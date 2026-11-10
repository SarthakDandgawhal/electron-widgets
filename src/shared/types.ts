export type WidgetType = 
  | 'sticky-note' 
  | 'clock' 
  | 'weather' 
  | 'system-monitor' 
  | 'todo-list' 
  | 'calendar' 
  | 'calculator' 
  | 'color-picker';

export interface WidgetState {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  isPinned: boolean;
  isVisible: boolean;
  zIndex: number;
  createdAt: number;
  modifiedAt: number;
  data: Record<string, unknown>;
}

export interface Widget extends WidgetState {
  component: React.ComponentType<WidgetProps>;
}

export interface WidgetProps {
  widget: WidgetState;
  onUpdate: (data: Record<string, unknown>) => void;
  onRemove: () => void;
  onPin: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  isFocused: boolean;
}

export interface AppSettings {
  autoStart: boolean;
  showInTray: boolean;
  defaultWidgetOpacity: number;
  snapToGrid: boolean;
  gridSize: number;
  widgetSpacing: number;
  enableDropShadow: boolean;
  defaultWidgetWidth: number;
  defaultWidgetHeight: number;
  theme: 'light' | 'dark' | 'system';
  showWidgetBorders: boolean;
  animationDurationMs: number;
  enableHotkeys: boolean;
  hotkeyToggleOverlay: string;
  hotkeyNewWidget: string;
  hotkeySettings: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
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
};

export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultWidth: number;
  defaultHeight: number;
  resizable: boolean;
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: 'sticky-note',
    name: 'Sticky Note',
    description: 'A simple note widget with markdown support',
    icon: '📝',
    category: 'Productivity',
    defaultWidth: 320,
    defaultHeight: 240,
    resizable: true,
  },
  {
    type: 'clock',
    name: 'Clock',
    description: 'Digital/analog clock with timezone support',
    icon: '🕐',
    category: 'Utilities',
    defaultWidth: 200,
    defaultHeight: 200,
    resizable: true,
  },
  {
    type: 'weather',
    name: 'Weather',
    description: 'Current weather and forecast',
    icon: '☀️',
    category: 'Information',
    defaultWidth: 320,
    defaultHeight: 280,
    resizable: true,
  },
  {
    type: 'system-monitor',
    name: 'System Monitor',
    description: 'CPU, Memory, Disk, Network usage graphs',
    icon: '📊',
    category: 'System',
    defaultWidth: 400,
    defaultHeight: 300,
    resizable: true,
  },
  {
    type: 'todo-list',
    name: 'Todo List',
    description: 'Task management with priorities and due dates',
    icon: '✅',
    category: 'Productivity',
    defaultWidth: 320,
    defaultHeight: 400,
    resizable: true,
  },
  {
    type: 'calendar',
    name: 'Calendar',
    description: 'Monthly calendar with events',
    icon: '📅',
    category: 'Productivity',
    defaultWidth: 320,
    defaultHeight: 320,
    resizable: true,
  },
  {
    type: 'calculator',
    name: 'Calculator',
    description: 'Quick calculator widget',
    icon: '🔢',
    category: 'Utilities',
    defaultWidth: 280,
    defaultHeight: 360,
    resizable: false,
  },
  {
    type: 'color-picker',
    name: 'Color Picker',
    description: 'Pick and save colors with multiple formats',
    icon: '🎨',
    category: 'Design',
    defaultWidth: 280,
    defaultHeight: 320,
    resizable: true,
  },
];