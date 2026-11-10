import { contextBridge, ipcRenderer } from 'electron';
import type { WidgetState, WidgetType, AppSettings } from '../shared/types.js';

contextBridge.exposeInMainWorld('electronAPI', {
  getWidgets: () => ipcRenderer.invoke('get-widgets'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  createWidget: (type: WidgetType, x?: number, y?: number) => ipcRenderer.invoke('create-widget', type, x, y),
  removeWidget: (id: string) => ipcRenderer.invoke('remove-widget', id),
  updateWidgetPosition: (id: string, x: number, y: number) => ipcRenderer.invoke('update-widget-position', id, x, y),
  updateWidgetSize: (id: string, width: number, height: number) => ipcRenderer.invoke('update-widget-size', id, width, height),
  updateWidgetData: (id: string, data: Record<string, unknown>) => ipcRenderer.invoke('update-widget-data', id, data),
  bringWidgetToFront: (id: string) => ipcRenderer.invoke('bring-widget-to-front', id),
  toggleWidgetPin: (id: string) => ipcRenderer.invoke('toggle-widget-pin', id),
  duplicateWidget: (id: string) => ipcRenderer.invoke('duplicate-widget', id),
  updateSettings: (settings: Partial<AppSettings>) => ipcRenderer.invoke('update-settings', settings),
  showGallery: () => ipcRenderer.invoke('show-gallery'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  onWidgetCreated: (callback: (widget: WidgetState) => void) => {
    ipcRenderer.on('widget-created', (_, widget) => callback(widget));
    return () => ipcRenderer.off('widget-created', callback);
  },
  onWidgetRemoved: (callback: (id: string) => void) => {
    ipcRenderer.on('widget-removed', (_, id) => callback(id));
    return () => ipcRenderer.off('widget-removed', callback);
  },
  onWidgetUpdated: (callback: (widget: WidgetState) => void) => {
    ipcRenderer.on('widget-updated', (_, widget) => callback(widget));
    return () => ipcRenderer.off('widget-updated', callback);
  },
  onShowGallery: (callback: () => void) => {
    ipcRenderer.on('show-gallery', callback);
    return () => ipcRenderer.off('show-gallery', callback);
  },
});