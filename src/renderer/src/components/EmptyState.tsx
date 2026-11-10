import React from 'react';
import { Plus, Layout, Grid, Zap, Palette, Calculator, Calendar, Clock, Cloud, Database, ListTodo, StickyNote, Feather } from 'lucide-react';
import type { WidgetType } from '../../shared/types';
import { WIDGET_DEFINITIONS } from '../../shared/widgetFactory';

interface EmptyStateProps {
  onCreateWidget: (type: WidgetType) => void;
}

export function EmptyState({ onCreateWidget }: EmptyStateProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        padding: 40,
        maxWidth: 400,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.5 }}>📱</div>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
        No widgets yet
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
        Create your first widget to get started. Choose from sticky notes, clocks, system monitors, and more.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <button
          onClick={() => onCreateWidget('sticky-note')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 24px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '12px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            minWidth: 220,
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Plus size={18} />
          Create Sticky Note
        </button>

        <button
          onClick={() => onCreateWidget('clock')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            minWidth: 220,
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          <Clock size={18} />
          Add Clock Widget
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Or browse all <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={onCreateWidget}>8 widget types</span>
        </p>
      </div>
    </div>
  );
}