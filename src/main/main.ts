import { app, BrowserWindow, screen, Tray, Menu, nativeImage, ipcMain, dialog, globalShortcut, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
import path from 'path';
import { fileURLToPath } from 'url';
import { Widget, WidgetState, WidgetType, AppSettings, DEFAULT_SETTINGS } from '../shared/types.js';
import { createWidgetComponent } from '../shared/widgetFactory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = !app.isPackaged;
const isWindows = process.platform === 'win32';

interface AppStore {
  widgets: WidgetState[];
  settings: AppSettings;
  bounds: { x: number; y: number; width: number; height: number };
}

const store = new Store<AppStore>({
  name: 'win11-widgets-data',
  defaults: {
    widgets: [],
    settings: DEFAULT_SETTINGS,
    bounds: { x: 0, y: 0, width: 0, height: 0 },
  },
});

let overlayWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let widgetIdCounter = 0;

function getNextWidgetId(): string {
  return `widget_${Date.now()}_${++widgetIdCounter}`;
}

function createOverlayWindow(): BrowserWindow {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    type: 'toolbar',
  });

  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setContentProtection(true);

  if (isDev) {
    overlayWindow.loadURL('http://localhost:3000');
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

function createSettingsWindow(): BrowserWindow {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 650,
    minWidth: 450,
    minHeight: 550,
    frame: false,
    transparent: true,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    parent: overlayWindow || undefined,
    modal: true,
    show: false,
  });

  if (isDev) {
    settingsWindow.loadURL('http://localhost:3000/settings');
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../renderer/index.html'), { hash: 'settings' });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

function createTray(): void {
  let trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.png'));
  
  if (isWindows) {
    trayIcon = nativeImage.createFromPath(path.join(__dirname, '../../assets/icon.ico'));
  }

  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Win11 Widgets');

  const updateTrayMenu = () => {
    const widgets = store.get('widgets');
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Widgets',
        type: 'normal',
        click: () => toggleOverlay(),
        accelerator: 'CommandOrControl+Shift+W',
      },
      { type: 'separator' },
      {
        label: 'New Widget',
        submenu: [
          { label: 'Sticky Note', click: () => createWidget('sticky-note') },
          { label: 'Clock', click: () => createWidget('clock') },
          { label: 'Weather', click: () => createWidget('weather') },
          { label: 'System Monitor', click: () => createWidget('system-monitor') },
          { label: 'Todo List', click: () => createWidget('todo-list') },
          { label: 'Calendar', click: () => createWidget('calendar') },
          { label: 'Calculator', click: () => createWidget('calculator') },
          { label: 'Color Picker', click: () => createWidget('color-picker') },
        ],
      },
      { type: 'separator' },
      {
        label: 'Widget Gallery',
        click: () => showWidgetGallery(),
      },
      {
        label: 'Settings',
        click: () => createSettingsWindow(),
        accelerator: 'CommandOrControl+Shift+S',
      },
      { type: 'separator' },
      {
        label: 'Auto-start',
        type: 'checkbox',
        checked: store.get('settings.autoStart'),
        click: (item) => {
          const settings = store.get('settings');
          settings.autoStart = item.checked;
          store.set('settings', settings);
          app.setLoginItemSettings({ openAtLogin: item.checked });
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);
    tray?.setContextMenu(contextMenu);
  };

  updateTrayMenu();
  store.onDidChange('widgets', updateTrayMenu);
  store.onDidChange('settings', updateTrayMenu);

  tray.on('double-click', () => {
    toggleOverlay();
  });
}

function registerGlobalShortcuts(): void {
  const settings = store.get('settings');
  
  if (settings.enableHotkeys) {
    globalShortcut.register('CommandOrControl+Shift+W', toggleOverlay);
    globalShortcut.register('CommandOrControl+Shift+N', () => createWidget('sticky-note'));
    globalShortcut.register('CommandOrControl+Shift+S', () => createSettingsWindow());
  }
}

function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

function toggleOverlay(): void {
  if (overlayWindow) {
    if (overlayWindow.isVisible()) {
      overlayWindow.hide();
    } else {
      overlayWindow.show();
      overlayWindow.focus();
    }
  } else {
    createOverlayWindow();
  }
}

function createWidget(type: WidgetType, x?: number, y?: number): WidgetState | null {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  const defaultX = x ?? workArea.x + 100 + Math.random() * 200;
  const defaultY = y ?? workArea.y + 100 + Math.random() * 200;

  const widgetDef = getWidgetDefinition(type);
  const newWidget: WidgetState = {
    id: getNextWidgetId(),
    type,
    title: widgetDef.name,
    x: defaultX,
    y: defaultY,
    width: widgetDef.defaultWidth,
    height: widgetDef.defaultHeight,
    opacity: store.get('settings.defaultWidgetOpacity'),
    isPinned: false,
    isVisible: true,
    zIndex: Date.now(),
    createdAt: Date.now(),
    modifiedAt: Date.now(),
    data: getDefaultWidgetData(type),
  };

  const widgets = [...store.get('widgets'), newWidget];
  store.set('widgets', widgets);

  if (overlayWindow) {
    overlayWindow.webContents.send('widget-created', newWidget);
  }

  return newWidget;
}

function getWidgetDefinition(type: WidgetType) {
  const definitions: Record<WidgetType, { name: string; defaultWidth: number; defaultHeight: number; icon: string }> = {
    'sticky-note': { name: 'Sticky Note', defaultWidth: 320, defaultHeight: 240, icon: '📝' },
    'clock': { name: 'Clock', defaultWidth: 200, defaultHeight: 200, icon: '🕐' },
    'weather': { name: 'Weather', defaultWidth: 320, defaultHeight: 280, icon: '☀️' },
    'system-monitor': { name: 'System Monitor', defaultWidth: 400, defaultHeight: 300, icon: '📊' },
    'todo-list': { name: 'Todo List', defaultWidth: 320, defaultHeight: 400, icon: '✅' },
    'calendar': { name: 'Calendar', defaultWidth: 320, defaultHeight: 320, icon: '📅' },
    'calculator': { name: 'Calculator', defaultWidth: 280, defaultHeight: 360, icon: '🔢' },
    'color-picker': { name: 'Color Picker', defaultWidth: 280, defaultHeight: 320, icon: '🎨' },
  };
  return definitions[type];
}

function getDefaultWidgetData(type: WidgetType): Record<string, unknown> {
  const defaults: Record<WidgetType, Record<string, unknown>> = {
    'sticky-note': { content: '', color: '#FFF9C4', fontSize: 13 },
    'clock': { showSeconds: false, use24Hour: true, showDate: true, style: 'digital' },
    'weather': { location: 'Auto', unit: 'celsius', showForecast: true },
    'system-monitor': { showCpu: true, showMemory: true, showDisk: true, showNetwork: true, refreshMs: 1000 },
    'todo-list': { items: [], showCompleted: false },
    'calendar': { showWeekNumbers: false, firstDayOfWeek: 0 },
    'calculator': { mode: 'standard', history: [] },
    'color-picker': { savedColors: [], format: 'hex' },
  };
  return defaults[type] || {};
}

function removeWidget(id: string): void {
  const widgets = store.get('widgets').filter(w => w.id !== id);
  store.set('widgets', widgets);
  overlayWindow?.webContents.send('widget-removed', id);
}

function updateWidgetPosition(id: string, x: number, y: number): void {
  const widgets = store.get('widgets').map(w => 
    w.id === id ? { ...w, x, y, modifiedAt: Date.now() } : w
  );
  store.set('widgets', widgets);
}

function updateWidgetSize(id: string, width: number, height: number): void {
  const widgets = store.get('widgets').map(w => 
    w.id === id ? { ...w, width, height, modifiedAt: Date.now() } : w
  );
  store.set('widgets', widgets);
}

function updateWidgetData(id: string, data: Record<string, unknown>): void {
  const widgets = store.get('widgets').map(w => 
    w.id === id ? { ...w, data: { ...w.data, ...data }, modifiedAt: Date.now() } : w
  );
  store.set('widgets', widgets);
}

function bringWidgetToFront(id: string): void {
  const widgets = store.get('widgets');
  const maxZ = Math.max(...widgets.map(w => w.zIndex), 0);
  const updated = widgets.map(w => 
    w.id === id ? { ...w, zIndex: maxZ + 1, modifiedAt: Date.now() } : w
  );
  store.set('widgets', updated);
}

function toggleWidgetPin(id: string): void {
  const widgets = store.get('widgets').map(w => 
    w.id === id ? { ...w, isPinned: !w.isPinned, modifiedAt: Date.now() } : w
  );
  store.set('widgets', widgets);
}

function duplicateWidget(id: string): void {
  const widget = store.get('widgets').find(w => w.id === id);
  if (widget) {
    createWidget(widget.type, widget.x + 30, widget.y + 30);
  }
}

function showWidgetGallery(): void {
  overlayWindow?.webContents.send('show-gallery');
}

function getAllWidgets(): WidgetState[] {
  return store.get('widgets');
}

function getSettings(): AppSettings {
  return store.get('settings');
}

function updateSettings(settings: Partial<AppSettings>): void {
  const current = store.get('settings');
  store.set('settings', { ...current, ...settings });
  
  if (settings.enableHotkeys !== undefined) {
    unregisterGlobalShortcuts();
    registerGlobalShortcuts();
  }
  if (settings.autoStart !== undefined) {
    app.setLoginItemSettings({ openAtLogin: settings.autoStart });
  }
}

// IPC Handlers
ipcMain.handle('get-widgets', getAllWidgets);
ipcMain.handle('get-settings', getSettings);
ipcMain.handle('create-widget', (_, type: WidgetType, x?: number, y?: number) => createWidget(type, x, y));
ipcMain.handle('remove-widget', (_, id: string) => removeWidget(id));
ipcMain.handle('update-widget-position', (_, id: string, x: number, y: number) => updateWidgetPosition(id, x, y));
ipcMain.handle('update-widget-size', (_, id: string, width: number, height: number) => updateWidgetSize(id, width, height));
ipcMain.handle('update-widget-data', (_, id: string, data: Record<string, unknown>) => updateWidgetData(id, data));
ipcMain.handle('bring-widget-to-front', (_, id: string) => bringWidgetToFront(id));
ipcMain.handle('toggle-widget-pin', (_, id: string) => toggleWidgetPin(id));
ipcMain.handle('duplicate-widget', (_, id: string) => duplicateWidget(id));
ipcMain.handle('update-settings', (_, settings: Partial<AppSettings>) => updateSettings(settings));
ipcMain.handle('show-gallery', showWidgetGallery);
ipcMain.handle('open-external', (_, url: string) => shell.openExternal(url));

// App lifecycle
app.whenReady().then(() => {
  createOverlayWindow();
  createTray();
  registerGlobalShortcuts();

  if (store.get('settings.autoStart')) {
    app.setLoginItemSettings({ openAtLogin: true });
  }

  // Auto-updater
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  unregisterGlobalShortcuts();
  store.set('widgets', store.get('widgets')); // Force save
});

app.on('before-quit', () => {
  store.set('widgets', store.get('widgets'));
});

export { createOverlayWindow, createSettingsWindow };