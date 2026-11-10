# Win11 Widgets - Electron Version

A modern, cross-platform desktop widgets manager built with Electron, React, and TypeScript. Features drag-and-drop widgets that live on your desktop with system tray integration.

## Features

- **8 Widget Types**: Sticky Notes, Clock, Weather, System Monitor, Todo List, Calendar, Calculator, Color Picker
- **Drag & Drop**: Move widgets anywhere on your desktop
- **Resize**: Drag corner handle to resize widgets
- **Pin/Unpin**: Keep widgets always on top
- **System Tray**: Quick access from system tray with context menu
- **Global Hotkeys**: Win+Shift+W (toggle), Win+Shift+N (new note), Win+Shift+S (settings)
- **Auto-start**: Launch automatically with Windows/macOS/Linux
- **Persistence**: Widget positions and state saved automatically
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Theming**: Light, Dark, and System theme support

## Screenshots

*Widgets floating on desktop with system tray access*

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# In another terminal, start Electron
npm run start
```

### Building

```bash
# Build for current platform
npm run build
npm run dist

# Build for specific platforms
npm run dist:win     # Windows (NSIS + Portable)
npm run dist:mac     # macOS (DMG)
npm run dist:linux   # Linux (AppImage)
```

### Output

Built executables will be in the `release/` folder:
- Windows: `Win11 Widgets-1.0.0-x64.exe` (NSIS installer) + `Win11 Widgets-1.0.0-portable.exe`
- macOS: `Win11 Widgets-1.0.0.dmg`
- Linux: `Win11 Widgets-1.0.0.AppImage`

## Project Structure

```
electron-widgets/
├── src/
│   ├── main/
│   │   └── main.ts           # Main process (window management, tray, IPC)
│   ├── preload/
│   │   └── preload.ts        # Preload script (secure IPC bridge)
│   ├── renderer/
│   │   ├── src/
│   │   │   ├── main.tsx      # React entry point
│   │   │   ├── App.tsx       # Main app component
│   │   │   ├── components/   # UI components
│   │   │   │   ├── WidgetContainer.tsx
│   │   │   │   ├── FloatingActionButton.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── WidgetGallery.tsx
│   │   │   │   ├── SettingsPanel.tsx
│   │   │   │   ├── ContextMenu.tsx
│   │   │   │   └── Tooltip.tsx
│   │   │   ├── widgets/      # Widget implementations
│   │   │   │   ├── StickyNoteWidget.tsx
│   │   │   │   ├── ClockWidget.tsx
│   │   │   │   ├── WeatherWidget.tsx
│   │   │   │   ├── SystemMonitorWidget.tsx
│   │   │   │   ├── TodoListWidget.tsx
│   │   │   │   ├── CalendarWidget.tsx
│   │   │   │   ├── CalculatorWidget.tsx
│   │   │   │   └── ColorPickerWidget.tsx
│   │   │   └── styles/
│   │   │       └── global.css
│   │   └── index.html
│   └── shared/
│       ├── types.ts          # TypeScript types
│       └── widgetFactory.tsx # Widget component registry
├── assets/
│   └── icon.png              # App icon
├── package.json
├── tsconfig.*.json
├── vite.config.ts
└── README.md
```

## Widget Details

| Widget | Features |
|--------|----------|
| **Sticky Note** | Rich text, color themes, font size, markdown-ish |
| **Clock** | Digital/Analog/Text, 12/24h, seconds, date |
| **Weather** | Current + 3-day forecast, Celsius/Fahrenheit, auto-location |
| **System Monitor** | CPU/Memory/Disk/Network graphs, real-time |
| **Todo List** | Priorities, due dates, drag reorder, show/hide completed |
| **Calendar** | Month view, week numbers, today highlight, navigation |
| **Calculator** | Basic ops, history, copy result, keyboard support |
| **Color Picker** | RGB/HSL/HEX/CMYK, sliders, palette, saved colors |

## Configuration

Settings stored in:
- Windows: `%APPDATA%\win11-widgets\config.json`
- macOS: `~/Library/Application Support/win11-widgets/config.json`
- Linux: `~/.config/win11-widgets/config.json`

Widget data stored in same directory as `widgets.json`.

## Hotkeys

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Toggle Overlay | Win+Shift+W | Cmd+Shift+W |
| New Sticky Note | Win+Shift+N | Cmd+Shift+N |
| Open Settings | Win+Shift+S | Cmd+Shift+S |

## Adding Custom Widgets

1. Create new component in `src/renderer/src/widgets/`
2. Export it and add to `widgetFactory.ts`
3. Add definition to `shared/types.ts`
4. Register in `WIDGET_DEFINITIONS` array

## Tech Stack

- **Electron 27** - Desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Zustand** - State management
- **Lucide React** - Icons
- **electron-builder** - Packaging
- **electron-store** - Persistent storage

## License

MIT License - feel free to use and modify!