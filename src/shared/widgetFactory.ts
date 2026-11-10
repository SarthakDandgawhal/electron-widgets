import React, { lazy, Suspense } from 'react';
import type { WidgetType, WidgetProps, WidgetDefinition, WIDGET_DEFINITIONS } from './types.js';

const StickyNoteWidget = lazy(() => import('../renderer/widgets/StickyNoteWidget').then(m => ({ default: m.StickyNoteWidget })));
const ClockWidget = lazy(() => import('../renderer/widgets/ClockWidget').then(m => ({ default: m.ClockWidget })));
const WeatherWidget = lazy(() => import('../renderer/widgets/WeatherWidget').then(m => ({ default: m.WeatherWidget })));
const SystemMonitorWidget = lazy(() => import('../renderer/widgets/SystemMonitorWidget').then(m => ({ default: m.SystemMonitorWidget })));
const TodoListWidget = lazy(() => import('../renderer/widgets/TodoListWidget').then(m => ({ default: m.TodoListWidget })));
const CalendarWidget = lazy(() => import('../renderer/widgets/CalendarWidget').then(m => ({ default: m.CalendarWidget })));
const CalculatorWidget = lazy(() => import('../renderer/widgets/CalculatorWidget').then(m => ({ default: m.CalculatorWidget })));
const ColorPickerWidget = lazy(() => import('../renderer/widgets/ColorPickerWidget').then(m => ({ default: m.ColorPickerWidget })));

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<WidgetProps>> = {
  'sticky-note': StickyNoteWidget,
  'clock': ClockWidget,
  'weather': WeatherWidget,
  'system-monitor': SystemMonitorWidget,
  'todo-list': TodoListWidget,
  'calendar': CalendarWidget,
  'calculator': CalculatorWidget,
  'color-picker': ColorPickerWidget,
};

export function createWidgetComponent(type: WidgetType): React.ComponentType<WidgetProps> {
  return WIDGET_COMPONENTS[type] || StickyNoteWidget;
}

export function getWidgetDefinition(type: WidgetType): WidgetDefinition {
  return WIDGET_DEFINITIONS.find(w => w.type === type) || WIDGET_DEFINITIONS[0];
}