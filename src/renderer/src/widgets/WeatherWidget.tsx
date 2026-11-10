import React, { useState, useEffect } from 'react';
import { RotateCcw, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Droplets, Wind, Copy, X, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface WeatherWidgetProps extends WidgetProps {
  widget: WidgetState;
}

const WEATHER_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  stormy: CloudLightning,
  drizzle: Droplets,
  windy: Wind,
};

const MOCK_WEATHER = [
  { temp: 22, condition: 'Sunny', icon: 'sunny', humidity: 45, wind: 12 },
  { temp: 18, condition: 'Cloudy', icon: 'cloudy', humidity: 65, wind: 8 },
  { temp: 15, condition: 'Rainy', icon: 'rainy', humidity: 85, wind: 15 },
  { temp: 25, condition: 'Partly Cloudy', icon: 'cloudy', humidity: 55, wind: 10 },
];

export function WeatherWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<{ current: any; forecast: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const location = widget.data.location as string || 'Auto';
  const unit = widget.data.unit as string || 'celsius';
  const showForecast = widget.data.showForecast as boolean !== false;

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location, unit]);

  const fetchWeather = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    
    const current = MOCK_WEATHER[Math.floor(Math.random() * MOCK_WEATHER.length)];
    const forecast = Array.from({ length: 3 }, (_, i) => ({
      day: new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString([], { weekday: 'short' }),
      ...MOCK_WEATHER[Math.floor(Math.random() * MOCK_WEATHER.length)],
    }));
    
    setWeather({ current, forecast });
    setIsLoading(false);
  };

  const formatTemp = (temp: number) => `${unit === 'fahrenheit' ? Math.round(temp * 9/5 + 32) : temp}°${unit === 'fahrenheit' ? 'F' : 'C'}`;

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <Cloud size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading weather...</p>
        </div>
      </div>
    );
  }

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
            onClick={fetchWeather}
            style={iconButtonStyle()}
            aria-label="Refresh"
          >
            <RotateCcw size={14} />
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
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px', fontSize: 12 }}>
            <span>Location</span>
            <input
              type="text"
              value={location}
              onChange={(e) => onUpdate({ location: e.target.value })}
              placeholder="City name or 'Auto'"
              style={{ padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: 12 }}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="radio" name="unit" checked={unit === 'celsius'} onChange={() => onUpdate({ unit: 'celsius' })} />
            Celsius
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="radio" name="unit" checked={unit === 'fahrenheit'} onChange={() => onUpdate({ unit: 'fahrenheit' })} />
            Fahrenheit
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
            <input type="checkbox" checked={showForecast} onChange={(e) => onUpdate({ showForecast: e.target.checked })} />
            Show 3-day forecast
          </label>
        </div>
      )}

      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{location}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updated just now</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Feels like {formatTemp(weather!.current.temp + 2)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 64, color: 'var(--text-primary)' }}>
            <WEATHER_ICONS[weather!.current.icon] size={64} />
          </div>
          <div>
            <div style={{ fontSize: 48, fontWeight: 200, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {formatTemp(weather!.current.temp)}
            </div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {weather!.current.condition}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: 12, background: 'var(--bg-secondary)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Droplets size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Humidity</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{weather!.current.humidity}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <Wind size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Wind</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{weather!.current.wind} km/h</div>
            </div>
          </div>
        </div>

        {showForecast && weather && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase' }}>3-Day Forecast</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {weather.forecast.map((day, i) => (
                <div key={i} style={{ flex: 1, padding: 12, background: 'var(--bg-secondary)', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>{day.day}</div>
                  <WEATHER_ICONS[day.icon] size={32} style={{ color: 'var(--accent)', marginBottom: 8 }} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {formatTemp(day.temp)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{day.condition}</div>
                </div>
              ))}
            </div>
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