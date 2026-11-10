import React, { useState, useEffect } from 'react';
import { Clock, Settings, Copy, X, RotateCcw, Sun, Moon, Calendar } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface ClockWidgetProps extends WidgetProps {
  widget: WidgetState;
}

export function ClockWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: ClockWidgetProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const showSeconds = widget.data.showSeconds as boolean || false;
  const use24Hour = widget.data.use24Hour as boolean !== false;
  const showDate = widget.data.showDate as boolean !== false;
  const style = widget.data.style as string || 'digital';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      if (style === 'digital') {
        if (use24Hour) {
          setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined, hour12: false }));
        } else {
          setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined, hour12: true }));
        }
      } else if (style === 'text') {
        setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !use24Hour }));
      }

      if (showDate) {
        setDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, showSeconds ? 1000 : 60000);
    return () => clearInterval(interval);
  }, [showSeconds, use24Hour, showDate, style]);

  const handleAnalogTime = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes() + seconds / 60;
    const hours = (now.getHours() % 12) + minutes / 60;

    return {
      hourDeg: hours * 30 - 90,
      minuteDeg: minutes * 6 - 90,
      secondDeg: seconds * 6 - 90,
    };
  };

  const analogAngles = handleAnalogTime();

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
          minWidth: 180,
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="checkbox" checked={showSeconds} onChange={(e) => onUpdate({ showSeconds: e.target.checked })} />
            Show seconds
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="checkbox" checked={use24Hour} onChange={(e) => onUpdate({ use24Hour: e.target.checked })} />
            24-hour format
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="checkbox" checked={showDate} onChange={(e) => onUpdate({ showDate: e.target.checked })} />
            Show date
          </label>
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0', paddingTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
              <input type="radio" name="clock-style" checked={style === 'digital'} onChange={() => onUpdate({ style: 'digital' })} />
              <span>Digital</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
              <input type="radio" name="clock-style" checked={style === 'analog'} onChange={() => onUpdate({ style: 'analog' })} />
              <span>Analog</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
              <input type="radio" name="clock-style" checked={style === 'text'} onChange={() => onUpdate({ style: 'text' })} />
              <span>Text</span>
            </label>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {style === 'analog' ? (
          <div style={{ position: 'relative', width: 180, height: 180 }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="85" fill="none" stroke="var(--border-color)" strokeWidth="2" />
              <circle cx="90" cy="90" r="4" fill="var(--accent)" />
              
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="90"
                  y1={i % 3 === 0 ? 15 : 20}
                  x2="90"
                  y2={i % 3 === 0 ? 5 : 10}
                  stroke="var(--text-secondary)"
                  strokeWidth={i % 3 === 0 ? 2 : 1}
                  transform={`rotate(${i * 30}, 90, 90)`}
                />
              ))}
              
              <line
                x1="90" y1="90"
                x2={90 + 50 * Math.cos(analogAngles.hourDeg * Math.PI / 180)}
                y2={90 + 50 * Math.sin(analogAngles.hourDeg * Math.PI / 180)}
                stroke="var(--text-primary)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="90" y1="90"
                x2={90 + 70 * Math.cos(analogAngles.minuteDeg * Math.PI / 180)}
                y2={90 + 70 * Math.sin(analogAngles.minuteDeg * Math.PI / 180)}
                stroke="var(--text-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {showSeconds && (
                <line
                  x1="90" y1="90"
                  x2={90 + 75 * Math.cos(analogAngles.secondDeg * Math.PI / 180)}
                  y2={90 + 75 * Math.sin(analogAngles.secondDeg * Math.PI / 180)}
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
        ) : style === 'text' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 300, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {time}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 200, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
              {time}
            </div>
          </div>
        )}

        {showDate && date && (
          <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {date}
          </div>
        )}
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