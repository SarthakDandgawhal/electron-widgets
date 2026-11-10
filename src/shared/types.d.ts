export type WidgetType = 'sticky-note' | 'clock' | 'weather' | 'system-monitor' | 'todo-list' | 'calendar' | 'calculator' | 'color-picker';
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
export declare const DEFAULT_SETTINGS: AppSettings;
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
export declare const WIDGET_DEFINITIONS: WidgetDefinition[];
//# sourceMappingURL=types.d.ts.map