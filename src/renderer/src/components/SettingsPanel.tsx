import React, { useRef, useEffect } from 'react';
import { X, ChevronDown, Monitor, Palette, Zap, Keyboard, Save, Loader2 } from 'lucide-react';
import type { AppSettings } from '../../shared/types';

interface SettingsPanelProps {
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export function SettingsPanel({ onClose, settings, onUpdateSettings }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    onUpdateSettings(settings);
    await new Promise(r => setTimeout(r, 300));
    setIsSaving(false);
    onClose();
  };

  const sections = [
    {
      title: 'General',
      icon: Monitor,
      items: [
        { key: 'autoStart', label: 'Auto-start with Windows', type: 'toggle' },
        { key: 'showInTray', label: 'Show in system tray', type: 'toggle' },
        { key: 'enableDropShadow', label: 'Enable drop shadows', type: 'toggle' },
        { key: 'snapToGrid', label: 'Snap widgets to grid', type: 'toggle' },
        { key: 'showWidgetBorders', label: 'Show widget borders', type: 'toggle' },
        { key: 'enableHotkeys', label: 'Enable global hotkeys', type: 'toggle' },
      ],
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        { key: 'theme', label: 'Theme', type: 'select', options: ['light', 'dark', 'system'] },
        { key: 'defaultWidgetOpacity', label: 'Default widget opacity', type: 'range', min: 0.5, max: 1, step: 0.05 },
        { key: 'gridSize', label: 'Grid size (px)', type: 'number', min: 10, max: 50, step: 5 },
        { key: 'widgetSpacing', label: 'Widget spacing (px)', type: 'number', min: 0, max: 30, step: 2 },
        { key: 'animationDurationMs', label: 'Animation duration (ms)', type: 'number', min: 0, max: 500, step: 50 },
      ],
    },
    {
      title: 'Default Widget Size',
      icon: Zap,
      items: [
        { key: 'defaultWidgetWidth', label: 'Default width', type: 'number', min: 150, max: 800, step: 10 },
        { key: 'defaultWidgetHeight', label: 'Default height', type: 'number', min: 100, max: 800, step: 10 },
      ],
    },
    {
      title: 'Hotkeys',
      icon: Keyboard,
      items: [
        { key: 'hotkeyToggleOverlay', label: 'Toggle overlay', type: 'text', readonly: true },
        { key: 'hotkeyNewWidget', label: 'New widget', type: 'text', readonly: true },
        { key: 'hotkeySettings', label: 'Open settings', type: 'text', readonly: true },
      ],
    },
  ];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 520,
        maxHeight: '85vh',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
        animation: 'slideIn 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Monitor size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Settings</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Configure Win11 Widgets</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24' }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <section.icon size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {section.title}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.items.map((item) => (
                <SettingItem
                  key={item.key}
                  item={item}
                  value={(settings as any)[item.key]}
                  onChange={(val) => onUpdateSettings({ [item.key]: val })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 24', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? <Loader2 size={16} /> : <Save size={16} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}

function SettingItem({ item, value, onChange }: { item: any; value: any; onChange: (val: any) => void }) {
  const id = `setting-${item.key}`;

  switch (item.type) {
    case 'toggle':
      return (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
          <button
            role="switch"
            aria-checked={value}
            onClick={() => onChange(!value)}
            style={{
              width: 44,
              height: 26,
              borderRadius: 13,
              background: value ? 'var(--accent)' : 'var(--bg-tertiary)',
              border: `1px solid ${value ? 'var(--accent)' : 'var(--border-color)'}`,
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: value ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
        </label>
      );

    case 'select':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: 13,
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {item.options.map((opt: string) => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </div>
      );

    case 'range':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 40, textAlign: 'right' }}>
              {typeof value === 'number' ? (value * 100).toFixed(0) + '%' : value}
            </span>
          </div>
          <input
            type="range"
            min={item.min}
            max={item.max}
            step={item.step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent)',
            }}
          />
        </div>
      );

    case 'number':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
          <input
            type="number"
            min={item.min}
            max={item.max}
            step={item.step}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{
              width: 100,
              padding: '8px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: 13,
              textAlign: 'right',
            }}
          />
        </div>
      );

    case 'text':
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{item.label}</span>
          <input
            type="text"
            value={value}
            readOnly={item.readonly}
            style={{
              width: 180,
              padding: '8px 12px',
              background: item.readonly ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: item.readonly ? 'var(--text-muted)' : 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
      );

    default:
      return null;
  }
}