import React, { useState, useEffect, useRef } from 'react';
import { Activity, MemoryStick, HardDrive, Wifi, Cpu, Database, Copy, X, Settings, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface SystemMonitorWidgetProps extends WidgetProps {
  widget: WidgetState;
}

const COLORS = {
  cpu: '#ff6b6b',
  memory: '#4ecdc4',
  disk: '#ffd93d',
  network: '#6bcb77',
};

export function SystemMonitorWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: SystemMonitorWidgetProps) {
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, disk: 0, network: 0 });
  const [history, setHistory] = useState({ cpu: [] as number[], memory: [] as number[], disk: [] as number[], network: [] as number[] });
  const [showSettings, setShowSettings] = useState(false);
  const canvasRefs = useRef({ cpu: null as HTMLCanvasElement | null, memory: null as HTMLCanvasElement | null, disk: null as HTMLCanvasElement | null, network: null as HTMLCanvasElement | null });

  const showCpu = widget.data.showCpu as boolean !== false;
  const showMemory = widget.data.showMemory as boolean !== false;
  const showDisk = widget.data.showDisk as boolean !== false;
  const showNetwork = widget.data.showNetwork as boolean !== false;
  const refreshMs = widget.data.refreshMs as number || 1000;

  useEffect(() => {
    const updateMetrics = () => {
      const newMetrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: Math.random() * 100,
      };
      setMetrics(newMetrics);
      setHistory(prev => ({
        cpu: [...prev.cpu.slice(-59), newMetrics.cpu],
        memory: [...prev.memory.slice(-59), newMetrics.memory],
        disk: [...prev.disk.slice(-59), newMetrics.disk],
        network: [...prev.network.slice(-59), newMetrics.network],
      }));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, refreshMs);
    return () => clearInterval(interval);
  }, [refreshMs]);

  useEffect(() => {
    drawAllGraphs();
  }, [history]);

  const drawGraph = (ctx: CanvasRenderingContext2D | null, data: number[], color: string) => {
    if (!ctx || data.length < 2) return;
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const stepX = width / (data.length - 1);
    const maxValue = 100;

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, height);
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / maxValue) * height;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = `${color}20`;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(0, height - (data[0] / maxValue) * height);
    data.forEach((value, i) => {
      const x = i * stepX;
      const y = height - (value / maxValue) * height;
      ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current value dot
    const lastValue = data[data.length - 1];
    ctx.beginPath();
    ctx.arc(width - stepX / 2, height - (lastValue / maxValue) * height, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const drawAllGraphs = () => {
    Object.entries(canvasRefs.current).forEach(([key, canvas]) => {
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);
        drawGraph(ctx, history[key as keyof typeof history], COLORS[key as keyof typeof COLORS]);
      }
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes > 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    if (bytes > 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
    return `${(bytes / 1e3).toFixed(1)} KB`;
  };

  const metricItems = [
    { key: 'cpu', label: 'CPU', icon: Cpu, color: COLORS.cpu, show: showCpu, value: metrics.cpu },
    { key: 'memory', label: 'Memory', icon: MemoryStick, color: COLORS.memory, show: showMemory, value: metrics.memory },
    { key: 'disk', label: 'Disk', icon: HardDrive, color: COLORS.disk, show: showDisk, value: metrics.disk },
    { key: 'network', label: 'Network', icon: Wifi, color: COLORS.network, show: showNetwork, value: metrics.network },
  ].filter(m => m.show);

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
          minWidth: 200,
        }}>
          {['cpu', 'memory', 'disk', 'network'].map((key) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={(widget.data as any)[`show${key.charAt(0).toUpperCase() + key.slice(1)}`] as boolean !== false}
                onChange={(e) => onUpdate({ [`show${key.charAt(0).toUpperCase() + key.slice(1)}`]: e.target.checked })}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS[key as keyof typeof COLORS] }} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </label>
          ))}
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0', paddingTop: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', cursor: 'pointer', fontSize: 12 }}>
              <span>Refresh rate</span>
              <select
                value={refreshMs}
                onChange={(e) => onUpdate({ refreshMs: parseInt(e.target.value) })}
                style={{ padding: '4px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: 11 }}
              >
                <option value={500}>500ms</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {metricItems.map((metric) => (
            <div key={metric.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '8px', background: `${metric.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <metric.icon size={16} style={{ color: metric.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{metric.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usage</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: metric.color, fontFamily: 'var(--font-mono)', minWidth: 50, textAlign: 'right' }}>
                    {metric.value.toFixed(1)}%
                  </div>
                  <div style={{ width: 100, height: 6, background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${metric.value}%`, height: '100%', background: metric.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              </div>
              <canvas
                ref={(el) => { canvasRefs.current[metric.key as keyof typeof canvasRefs.current] = el; }}
                style={{ width: '100%', height: 50, borderRadius: '6px', background: 'var(--bg-secondary)' }}
              />
            </div>
          ))}
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