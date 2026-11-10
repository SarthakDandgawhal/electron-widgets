import React from 'react';
import { Plus, Layout, Settings, StickyNote, Clock, Cloud, Database, ListTodo, Calendar, Calculator, Palette } from 'lucide-react';
import type { WidgetType } from '../../shared/types';

interface QuickActionsProps {
  onCreateWidget: (type: WidgetType) => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
}

export function QuickActions({ onCreateWidget, onOpenGallery, onOpenSettings }: QuickActionsProps) {
  const actions = [
    { icon: StickyNote, label: 'Sticky Note', type: 'sticky-note' as WidgetType },
    { icon: Clock, label: 'Clock', type: 'clock' as WidgetType },
    { icon: ListTodo, label: 'Todo List', type: 'todo-list' as WidgetType },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12 16',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '50px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 100,
        opacity: 1,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
    >
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => onCreateWidget(action.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          <action.icon size={14} />
          {action.label}
        </button>
      ))}
      
      <button
        onClick={onOpenGallery}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        aria-label="Widget Gallery"
      >
        <Layout size={16} />
      </button>

      <button
        onClick={onOpenSettings}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        aria-label="Settings"
      >
        <Settings size={16} />
      </button>
    </div>
  );
}