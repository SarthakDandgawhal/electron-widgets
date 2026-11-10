import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Copy, X, Settings, Sun } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface CalendarWidgetProps extends WidgetProps {
  widget: WidgetState;
}

export function CalendarWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  const firstDayOfWeek = widget.data.firstDayOfWeek as number || 0;
  const showWeekNumbers = widget.data.showWeekNumbers as boolean || false;

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = (firstDay - firstDayOfWeek + 7) % 7;

    const days = [];
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        date,
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      days.push({ day, isCurrentMonth: false, date: new Date(year, month + 1, day) });
    }

    return days;
  }, [currentMonth, firstDayOfWeek]);

  const monthYear = currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const adjustedWeekDays = [...weekDays.slice(firstDayOfWeek), ...weekDays.slice(0, firstDayOfWeek)];

  const handlePrevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleToday = () => setCurrentMonth(new Date());

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
            onClick={handlePrevMonth}
            style={iconButtonStyle()}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleToday}
            style={iconButtonStyle()}
            aria-label="Today"
          >
            <Sun size={14} />
          </button>
          <button
            onClick={handleNextMonth}
            style={iconButtonStyle()}
            aria-label="Next month"
          >
            <ChevronRight size={14} />
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
            <input type="checkbox" checked={showWeekNumbers} onChange={(e) => onUpdate({ showWeekNumbers: e.target.checked })} />
            Show week numbers
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <span>Week starts on</span>
            <select
              value={firstDayOfWeek}
              onChange={(e) => onUpdate({ firstDayOfWeek: parseInt(e.target.value) })}
              style={{ padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: 11 }}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </select>
          </label>
        </div>
      )}

      <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{monthYear}</h3>
        </div>
      </div>

      <div style={{ flex: 1, padding: 12, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: showWeekNumbers ? 'repeat(8, 1fr)' : 'repeat(7, 1fr)', gap: 2 }}>
          {showWeekNumbers && (
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>Wk</div>
          )}
          {adjustedWeekDays.map((day, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 4px', textTransform: 'uppercase' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: showWeekNumbers ? 'repeat(8, 1fr)' : 'repeat(7, 1fr)', gap: 4, marginTop: 8 }}>
          {showWeekNumbers && (
            <div />
          )}
          {daysInMonth.map((day, index) => {
            const weekIndex = Math.floor((index + (showWeekNumbers ? 1 : 0)) / (showWeekNumbers ? 8 : 7));
            return (
              <div
                key={index}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: day.isToday ? 700 : (day.isCurrentMonth ? 500 : 400),
                  color: day.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: day.isToday ? 'var(--accent-light)' : 'transparent',
                  border: day.isToday ? '2px solid var(--accent)' : 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!day.isToday) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!day.isToday) e.currentTarget.style.background = 'transparent'; }}
              >
                {showWeekNumbers && index % (showWeekNumbers ? 8 : 7) === 0 && (
                  <div style={{ position: 'absolute', top: 2, left: 2, fontSize: 8, color: 'var(--text-muted)' }}>
                    {weekIndex + 1}
                  </div>
                )}
                {day.day}
              </div>
            );
          })}
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