import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Save, X, Palette, Copy, MoreHorizontal, GripVertical } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface StickyNoteWidgetProps extends WidgetProps {
  widget: WidgetState;
}

const NOTE_COLORS = [
  '#FFF9C4', '#FCE4EC', '#E3F2FD', '#E8F5E9',
  '#FFF3E0', '#F3E5F5', '#E0F2F1', '#FBE9E7', '#FFFFFF',
];

export function StickyNoteWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: StickyNoteWidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(widget.data.content as string || '');
  const [color, setColor] = useState(widget.data.color as string || '#FFF9C4');
  const [fontSize, setFontSize] = useState(widget.data.fontSize as number || 13);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing, content]);

  const handleSave = () => {
    setIsEditing(false);
    onUpdate({ content, color, fontSize });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      setContent(widget.data.content as string || '');
      setIsEditing(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: color,
        color: '#333',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 8px',
          opacity: isFocused ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={iconButtonStyle()}
            aria-label="Change color"
          >
            <Palette size={14} />
          </button>
          <button
            onClick={onDuplicate}
            style={iconButtonStyle()}
            aria-label="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onRemove}
            style={iconButtonStyle(true)}
            aria-label="Delete"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {showColorPicker && (
        <div
          ref={colorPickerRef}
          style={{
            position: 'absolute',
            top: 44,
            right: 8,
            zIndex: 100,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: 8,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setShowColorPicker(false); }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  border: `2px solid ${color === c ? 'var(--accent)' : 'transparent'}`,
                  background: c,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: 16, overflow: 'auto', position: 'relative' }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: `${fontSize}px`,
              lineHeight: 1.6,
              color: '#333',
              fontFamily: 'inherit',
            }}
            placeholder="Type your note here... (Ctrl+Enter to save)"
            spellCheck={false}
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            style={{
              width: '100%',
              height: '100%',
              fontSize: `${fontSize}px`,
              lineHeight: 1.6,
              color: '#333',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflow: 'auto',
            }}
          >
            {content || <span style={{ color: '#999', fontStyle: 'italic' }}>Double-click to edit...</span>}
          </div>
        )}
      </div>

      <div
        style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          fontSize: 11,
          color: '#666',
        }}
      >
        <span>{new Date(widget.modifiedAt).toLocaleString()}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setFontSize(Math.max(10, fontSize - 1))}
            style={iconButtonStyle()}
            aria-label="Decrease font size"
          >
            <span style={{ fontSize: 10 }}>A-</span>
          </button>
          <button
            onClick={() => setFontSize(Math.min(24, fontSize + 1))}
            style={iconButtonStyle()}
            aria-label="Increase font size"
          >
            <span style={{ fontSize: 10 }}>A+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function iconButtonStyle(danger = false) {
  return {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    background: danger ? 'rgba(255, 85, 85, 0.2)' : 'rgba(0, 0, 0, 0.08)',
    color: danger ? '#ff5555' : '#666',
    transition: 'all 0.15s ease',
  } as React.CSSProperties;
}