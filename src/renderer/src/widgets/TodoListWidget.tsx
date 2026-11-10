import React, { useState, useEffect } from 'react';
import { Plus, Check, CheckSquare, Trash2, Edit2, Copy, X, Settings, GripVertical, Calendar, Flag, MoreVertical } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: number;
  createdAt: number;
}

interface TodoListWidgetProps extends WidgetProps {
  widget: WidgetState;
}

const PRIORITY_COLORS = {
  low: '#6bcb77',
  medium: '#ffd93d',
  high: '#ff6b6b',
};

const PRIORITY_ICONS = {
  low: '🔵',
  medium: '🟡',
  high: '🔴',
};

export function TodoListWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: TodoListWidgetProps) {
  const [items, setItems] = useState<TodoItem[]>(widget.data.items as TodoItem[] || []);
  const [newItemText, setNewItemText] = useState('');
  const [showCompleted, setShowCompleted] = useState(widget.data.showCompleted as boolean || false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    onUpdate({ items });
  }, [items, onUpdate]);

  const visibleItems = showCompleted ? items : items.filter(i => !i.completed);

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem: TodoItem = {
      id: `todo_${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      priority: 'medium',
      createdAt: Date.now(),
    };
    setItems([...items, newItem]);
    setNewItemText('');
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const startEdit = (item: TodoItem) => {
    setEditingId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      setItems(items.map(item => item.id === editingId ? { ...item, text: editText.trim() } : item));
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingId) saveEdit();
      else addItem();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <div
        style={{
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          opacity: isFocused ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            style={iconButtonStyle()}
            aria-label={showCompleted ? 'Hide completed' : 'Show completed'}
          >
            <CheckSquare size={14} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={iconButtonStyle()}
            aria-label="Settings"
          >
            <Settings size={14} />
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

      {showSettings && (
        <div style={{
          position: 'absolute',
          top: 44,
          right: 8,
          zIndex: 100,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: 8,
          boxShadow: 'var(--shadow-lg)',
          minWidth: 200,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} />
            Show completed tasks
          </label>
        </div>
      )}

      <div style={{ padding: '0 12px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a new task..."
            style={{
              flex: 1,
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: 13,
            }}
          />
          <button
            onClick={addItem}
            disabled={!newItemText.trim()}
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '8px',
              fontSize: 13,
              fontWeight: 500,
              cursor: newItemText.trim() ? 'pointer' : 'not-allowed',
              opacity: newItemText.trim() ? 1 : 0.5,
            }}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {visibleItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
            <CheckSquare size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>{showCompleted ? 'No tasks yet' : 'All caught up!'}</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>{showCompleted ? 'Add your first task above' : 'Toggle "Show completed" to see finished tasks'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease',
                  opacity: item.completed ? 0.7 : 1,
                }}
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: `2px solid ${item.completed ? 'var(--accent)' : 'var(--border-color)'}`,
                    background: item.completed ? 'var(--accent)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {item.completed && <Check size={12} style={{ color: 'white' }} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--accent)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => startEdit(item)}
                      style={{
                        fontSize: 13,
                        color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: item.completed ? 'line-through' : 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: editingId ? 'default' : 'text',
                      }}
                    >
                      {item.text}
                    </div>
                  )}
                  {item.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Calendar size={11} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: PRIORITY_COLORS[item.priority],
                    }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                    style={iconButtonStyle()}
                    aria-label="Edit"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    style={iconButtonStyle(true)}
                    aria-label="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>{items.filter(i => !i.completed).length} remaining</span>
          <span>{items.length} total</span>
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
    color: danger ? '#ff5555' : 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  } as React.CSSProperties;
}