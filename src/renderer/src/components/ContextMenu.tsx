import React, { useEffect, useRef } from 'react';
import { Plus, Layout, Settings, Copy, Pin, PinOff, Trash2, X } from 'lucide-react';
import type { WidgetType } from '../../shared/types';
import { WIDGET_DEFINITIONS } from '../../shared/widgetFactory';

interface ContextMenuProps {
  x: number;
  y: number;
  widgetId: string | null;
  onClose: () => void;
  onCreateWidget: (type: WidgetType) => void;
  onRemoveWidget?: () => void;
  onPinWidget?: () => void;
  onDuplicateWidget?: () => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
}

export function ContextMenu({
  x,
  y,
  widgetId,
  onClose,
  onCreateWidget,
  onRemoveWidget,
  onPinWidget,
  onDuplicateWidget,
  onOpenGallery,
  onOpenSettings,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const menuWidth = 220;
  const menuHeight = widgetId ? 320 : 280;
  
  const left = Math.min(x, viewportWidth - menuWidth - 16);
  const top = Math.min(y, viewportHeight - menuHeight - 16);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left,
        top,
        width: menuWidth,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        boxShadow: 'var(--shadow-lg)',
        padding: 8,
        zIndex: 2000,
        animation: 'fadeIn 0.1s ease',
      }}
    >
      {!widgetId && (
        <>
          <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            NEW WIDGET
          </div>
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: 4 }} />
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {widgetId && (
          <>
            <MenuItem
              icon={Copy}
              label="Duplicate"
              onClick={() => { onDuplicateWidget?.(); onClose(); }}
            />
            <MenuItem
              icon={Pin}
              label="Pin/Unpin"
              onClick={() => { onPinWidget?.(); onClose(); }}
            />
            <MenuItem
              icon={Trash2}
              label="Remove"
              danger
              onClick={() => { onRemoveWidget?.(); onClose(); }}
            />
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
          </>
        )}

        <MenuItem
          icon={Plus}
          label="New Sticky Note"
          onClick={() => { onCreateWidget('sticky-note'); onClose(); }}
        />
        <MenuItem
          icon={Layout}
          label="Widget Gallery"
          onClick={() => { onOpenGallery(); onClose(); }}
        />
        <MenuItem
          icon={Settings}
          label="Settings"
          onClick={() => { onOpenSettings(); onClose(); }}
        />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger = false }: { icon: React.ComponentType<{ size?: number }>; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '10px 12px',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: danger ? '#ff6b6b' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.1s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = danger ? 'rgba(255,107,107,0.15)' : 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      {label}
    </button>
  );
}