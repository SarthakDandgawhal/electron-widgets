import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Plus, Settings, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, 
  Pin, PinOff, Copy, Trash2, MoreHorizontal, Grid, Layout,
  Sun, Moon, Monitor, Zap, Palette, Calculator, Calendar, Clock, Cloud, 
  Database, ListTodo, StickyNote, Feather, Search
} from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WidgetState, WidgetType, AppSettings, WidgetDefinition, WIDGET_DEFINITIONS } from '../shared/types';
import { createWidgetComponent, getWidgetDefinition } from '../shared/widgetFactory';
import { WidgetContainer } from './components/WidgetContainer';
import { WidgetGallery } from './components/WidgetGallery';
import { SettingsPanel } from './components/SettingsPanel';
import { FloatingActionButton } from './components/FloatingActionButton';
import { QuickActions } from './components/QuickActions';
import { EmptyState } from './components/EmptyState';
import { ContextMenu } from './components/ContextMenu';
import { Tooltip } from './components/Tooltip';

interface AppState {
  widgets: WidgetState[];
  settings: AppSettings;
  isGalleryOpen: boolean;
  isSettingsOpen: boolean;
  contextMenu: { x: number; y: number; widgetId: string | null } | null;
  draggedWidget: string | null;
  dragOffset: { x: number; y: number } | null;
  focusedWidget: string | null;
  
  setWidgets: (widgets: WidgetState[]) => void;
  addWidget: (widget: WidgetState) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<WidgetState>) => void;
  bringToFront: (id: string) => void;
  setFocusedWidget: (id: string | null) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
  toggleGallery: () => void;
  toggleSettings: () => void;
  openContextMenu: (x: number, y: number, widgetId: string | null) => void;
  closeContextMenu: () => void;
  setDraggedWidget: (id: string | null, offset?: { x: number; y: number }) => void;
  updateDragPosition: (x: number, y: number) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      widgets: [],
      settings: {
        autoStart: false,
        showInTray: true,
        defaultWidgetOpacity: 0.95,
        snapToGrid: true,
        gridSize: 20,
        widgetSpacing: 12,
        enableDropShadow: true,
        defaultWidgetWidth: 320,
        defaultWidgetHeight: 240,
        theme: 'system',
        showWidgetBorders: true,
        animationDurationMs: 200,
        enableHotkeys: true,
        hotkeyToggleOverlay: 'Win+Shift+W',
        hotkeyNewWidget: 'Win+Shift+N',
        hotkeySettings: 'Win+Shift+S',
      },
      isGalleryOpen: false,
      isSettingsOpen: false,
      contextMenu: null,
      draggedWidget: null,
      dragOffset: null,
      focusedWidget: null,

      setWidgets: (widgets) => set({ widgets }),
      addWidget: (widget) => set((state) => ({ 
        widgets: [...state.widgets, widget].sort((a, b) => a.zIndex - b.zIndex) 
      })),
      removeWidget: (id) => set((state) => ({ 
        widgets: state.widgets.filter(w => w.id !== id) 
      })),
      updateWidget: (id, updates) => set((state) => ({
        widgets: state.widgets.map(w => 
          w.id === id ? { ...w, ...updates, modifiedAt: Date.now() } : w
        )
      })),
      bringToFront: (id) => set((state) => {
        const maxZ = Math.max(...state.widgets.map(w => w.zIndex), 0);
        return {
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, zIndex: maxZ + 1, modifiedAt: Date.now() } : w
          ),
          focusedWidget: id
        };
      }),
      setFocusedWidget: (id) => set({ focusedWidget: id }),
      setSettings: (settings) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      toggleGallery: () => set((state) => ({ isGalleryOpen: !state.isGalleryOpen })),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      openContextMenu: (x, y, widgetId) => set({ contextMenu: { x, y, widgetId } }),
      closeContextMenu: () => set({ contextMenu: null }),
      setDraggedWidget: (id, offset) => set({ draggedWidget: id, dragOffset: offset || null }),
      updateDragPosition: (x, y) => set((state) => {
        if (!state.draggedWidget || !state.dragOffset) return state;
        const { snapToGrid, gridSize } = state.settings;
        let newX = x - state.dragOffset.x;
        let newY = y - state.dragOffset.y;
        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
        return {
          widgets: state.widgets.map(w => 
            w.id === state.draggedWidget ? { ...w, x: Math.max(0, newX), y: Math.max(0, newY) } : w
          )
        };
      }),
    }),
    {
      name: 'win11-widgets-store',
      partialize: (state) => ({ 
        widgets: state.widgets, 
        settings: state.settings 
      }),
    }
  )
);

function App() {
  const {
    widgets,
    settings,
    isGalleryOpen,
    isSettingsOpen,
    contextMenu,
    draggedWidget,
    focusedWidget,
    addWidget,
    removeWidget,
    updateWidget,
    bringToFront,
    setFocusedWidget,
    setSettings,
    toggleGallery,
    toggleSettings,
    openContextMenu,
    closeContextMenu,
    setDraggedWidget,
    updateDragPosition,
  } = useAppStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (window.electronAPI) {
        const [savedWidgets, savedSettings] = await Promise.all([
          window.electronAPI.getWidgets(),
          window.electronAPI.getSettings(),
        ]);
        if (savedWidgets.length > 0) {
          addWidget(savedWidgets[0]); // Trigger re-render with all widgets
          useAppStore.setState({ widgets: savedWidgets });
        }
        useAppStore.setState({ settings: savedSettings });
      }
      setIsLoaded(true);
    };
    init();

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedWidget) {
        updateDragPosition(e.clientX, e.clientY);
      }
    };

    const handleMouseUp = () => {
      if (draggedWidget) {
        setDraggedWidget(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
        toggleGallery();
        toggleSettings();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onWidgetCreated((widget) => addWidget(widget));
      window.electronAPI.onWidgetRemoved((id) => removeWidget(id));
      window.electronAPI.onShowGallery(() => toggleGallery());
    }
  }, [addWidget, removeWidget, toggleGallery]);

  if (!isLoaded) {
    return (
      <div style={{ 
        width: '100%', height: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
          <div style={{ color: 'var(--text-secondary)' }}>Loading Win11 Widgets...</div>
        </div>
      </div>
    );
  }

  const handleCreateWidget = (type: WidgetType) => {
    if (window.electronAPI) {
      window.electronAPI.createWidget(type);
    }
    toggleGallery();
  };

  const handleRemoveWidget = (id: string) => {
    if (window.electronAPI) {
      window.electronAPI.removeWidget(id);
    }
    removeWidget(id);
    closeContextMenu();
  };

  const handleUpdateWidget = (id: string, updates: Partial<WidgetState>) => {
    if (window.electronAPI) {
      if (updates.x !== undefined || updates.y !== undefined) {
        window.electronAPI.updateWidgetPosition(id, updates.x ?? 0, updates.y ?? 0);
      }
      if (updates.width !== undefined || updates.height !== undefined) {
        window.electronAPI.updateWidgetSize(id, updates.width ?? 0, updates.height ?? 0);
      }
      if (updates.data) {
        window.electronAPI.updateWidgetData(id, updates.data);
      }
    }
    updateWidget(id, updates);
  };

  const handleWidgetMouseDown = (e: React.MouseEvent, widget: WidgetState) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button, input, textarea, select, .no-drag')) return;
    
    bringToFront(widget.id);
    setFocusedWidget(widget.id);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggedWidget(widget.id, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    e.preventDefault();
  };

  const handleWidgetContextMenu = (e: React.MouseEvent, widget: WidgetState) => {
    e.preventDefault();
    bringToFront(widget.id);
    openContextMenu(e.clientX, e.clientY, widget.id);
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY, null);
  };

  const sortedWidgets = [...widgets].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="app" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={canvasRef}
        className="widgets-canvas"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          touchAction: 'none'
        }}
        onContextMenu={handleCanvasContextMenu}
      >
        {sortedWidgets.map((widget) => {
          const WidgetComponent = createWidgetComponent(widget.type);
          const isFocused = focusedWidget === widget.id;
          
          return (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              isFocused={isFocused}
              isDragging={draggedWidget === widget.id}
              onMouseDown={(e) => handleWidgetMouseDown(e, widget)}
              onContextMenu={(e) => handleWidgetContextMenu(e, widget)}
              onUpdate={(data) => handleUpdateWidget(widget.id, { data })}
              onRemove={() => handleRemoveWidget(widget.id)}
              onPin={() => handleUpdateWidget(widget.id, { isPinned: !widget.isPinned })}
              onDuplicate={() => {
                if (window.electronAPI) window.electronAPI.duplicateWidget(widget.id);
              }}
              onBringToFront={() => bringToFront(widget.id)}
            >
              <WidgetComponent
                widget={widget}
                onUpdate={(data) => handleUpdateWidget(widget.id, { data })}
                onRemove={() => handleRemoveWidget(widget.id)}
                onPin={() => handleUpdateWidget(widget.id, { isPinned: !widget.isPinned })}
                onDuplicate={() => {
                  if (window.electronAPI) window.electronAPI.duplicateWidget(widget.id);
                }}
                onBringToFront={() => bringToFront(widget.id)}
                isFocused={isFocused}
              />
            </WidgetContainer>
          );
        })}

        {widgets.length === 0 && <EmptyState onCreateWidget={handleCreateWidget} />}
      </div>

      <FloatingActionButton onClick={toggleGallery} />
      <QuickActions onCreateWidget={handleCreateWidget} onOpenGallery={toggleGallery} onOpenSettings={toggleSettings} />
      
      {isGalleryOpen && (
        <WidgetGallery 
          onClose={toggleGallery}
          onAddWidget={handleCreateWidget}
          definitions={WIDGET_DEFINITIONS}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel 
          onClose={toggleSettings}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          widgetId={contextMenu.widgetId}
          onClose={closeContextMenu}
          onCreateWidget={handleCreateWidget}
          onRemoveWidget={contextMenu.widgetId ? () => handleRemoveWidget(contextMenu.widgetId!) : undefined}
          onPinWidget={contextMenu.widgetId ? () => handleUpdateWidget(contextMenu.widgetId!, { isPinned: !widgets.find(w => w.id === contextMenu.widgetId)?.isPinned }) : undefined}
          onDuplicateWidget={contextMenu.widgetId ? () => { if (window.electronAPI) window.electronAPI.duplicateWidget(contextMenu.widgetId!); } : undefined}
          onOpenGallery={toggleGallery}
          onOpenSettings={toggleSettings}
        />
      )}

      <Tooltip />
    </div>
  );
}

export default App;