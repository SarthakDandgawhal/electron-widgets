import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

declare global {
  interface Window {
    electronAPI: {
      getWidgets: () => Promise<any[]>;
      getSettings: () => Promise<any>;
      createWidget: (type: string, x?: number, y?: number) => Promise<any>;
      removeWidget: (id: string) => Promise<void>;
      updateWidgetPosition: (id: string, x: number, y: number) => Promise<void>;
      updateWidgetSize: (id: string, width: number, height: number) => Promise<void>;
      updateWidgetData: (id: string, data: Record<string, unknown>) => Promise<void>;
      bringWidgetToFront: (id: string) => Promise<void>;
      toggleWidgetPin: (id: string) => Promise<void>;
      duplicateWidget: (id: string) => Promise<void>;
      updateSettings: (settings: Partial<any>) => Promise<void>;
      showGallery: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      onWidgetCreated: (callback: (widget: any) => void) => () => void;
      onWidgetRemoved: (callback: (id: string) => void) => () => void;
      onWidgetUpdated: (callback: (widget: any) => void) => () => void;
      onShowGallery: (callback: () => void) => () => void;
    };
  }
}

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);