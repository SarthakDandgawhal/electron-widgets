import React, { useState, useEffect, useRef } from 'react';
import { Copy, X, Settings, Save, Trash2, ChevronDown, Eyedropper, Palette, Hash, Rgb, Cpu } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface ColorPickerWidgetProps extends WidgetProps {
  widget: WidgetState;
}

type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'cmyk';

export function ColorPickerWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: ColorPickerWidgetProps) {
  const [hex, setHex] = useState(widget.data.selectedColor as string || '#0078d4');
  const [rgb, setRgb] = useState({ r: 0, g: 120, b: 212 });
  const [hsl, setHsl] = useState({ h: 205, s: 100, l: 41 });
  const [format, setFormat] = useState<ColorFormat>((widget.data.format as ColorFormat) || 'hex');
  const [savedColors, setSavedColors] = useState<string[]>(widget.data.savedColors as string[] || []);
  const [showPalette, setShowPalette] = useState(true);
  const hueRef = useRef<HTMLDivElement>(null);
  const satRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateFromHex(hex);
  }, []);

  const updateFromHex = (hexColor: string) => {
    if (!hexColor.startsWith('#') || hexColor.length !== 7) return;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    setRgb({ r, g, b });
    const { h, s, l } = rgbToHsl(r, g, b);
    setHsl({ h, s, l });
  };

  const updateFromRgb = () => {
    const newHex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
    setHex(newHex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHsl({ h, s, l });
  };

  const updateFromHsl = () => {
    const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);
    setRgb({ r, g, b });
    const newHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    setHex(newHex);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(value)) {
      setHex(value);
      updateFromHex(value);
    }
  };

  const handleFormatChange = (newFormat: ColorFormat) => {
    setFormat(newFormat);
    onUpdate({ format: newFormat });
  };

  const handleSaveColor = () => {
    if (!savedColors.includes(hex)) {
      setSavedColors(prev => [hex, ...prev.slice(0, 19)]);
      onUpdate({ savedColors: [hex, ...savedColors.slice(0, 19)] });
    }
  };

  const handleRemoveColor = (color: string) => {
    setSavedColors(prev => prev.filter(c => c !== color));
    onUpdate({ savedColors: savedColors.filter(c => c !== color) });
  };

  const handleSelectSaved = (color: string) => {
    setHex(color);
    updateFromHex(color);
  };

  const copyColor = () => {
    let value = '';
    switch (format) {
      case 'hex': value = hex; break;
      case 'rgb': value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`; break;
      case 'hsl': value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`; break;
      case 'cmyk': value = rgbToCmyk(rgb.r, rgb.g, rgb.b); break;
    }
    navigator.clipboard.writeText(value);
  };

  const formattedColor = () => {
    switch (format) {
      case 'hex': return hex;
      case 'rgb': return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl': return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      case 'cmyk': return rgbToCmyk(rgb.r, rgb.g, rgb.b);
    }
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
    const c = (1 - rn - k) / (1 - k);
    const m = (1 - gn - k) / (1 - k);
    const y = (1 - bn - k) / (1 - k);
    return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
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
          <button onClick={copyColor} style={iconButtonStyle()} aria-label="Copy color"><Copy size={14} /></button>
          <button onClick={handleSaveColor} style={iconButtonStyle()} aria-label="Save color"><Save size={14} /></button>
          <button onClick={onDuplicate} style={iconButtonStyle()} aria-label="Duplicate"><Copy size={14} /></button>
          <button onClick={onRemove} style={iconButtonStyle(true)} aria-label="Delete"><X size={14} /></button>
        </div>
      </div>

      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ height: 100, borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, background: hex, borderRadius: '12px 0 0 12px', minWidth: 0 }} />
          <div style={{ width: 120, padding: '0 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <input
              type="text"
              value={formattedColor()}
              onChange={handleHexChange}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
              }}
            />
            <button onClick={copyColor} style={{ padding: '8px 12px', background: 'var(--accent)', color: 'white', borderRadius: '6px', fontSize: 12, fontWeight: 500 }}>Copy</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>RGB</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ColorSlider label="R" value={rgb.r} max={255} color="#ff6b6b" onChange={(v) => { setRgb(prev => ({ ...prev, r: v })); updateFromRgb(); }} />
              <ColorSlider label="G" value={rgb.g} max={255} color="#4ecdc4" onChange={(v) => { setRgb(prev => ({ ...prev, g: v })); updateFromRgb(); }} />
              <ColorSlider label="B" value={rgb.b} max={255} color="#6bcb77" onChange={(v) => { setRgb(prev => ({ ...prev, b: v })); updateFromRgb(); }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>HSL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <ColorSlider label="H" value={hsl.h} max={360} color="#ffd93d" onChange={(v) => { setHsl(prev => ({ ...prev, h: v })); updateFromHsl(); }} />
              <ColorSlider label="S" value={hsl.s} max={100} color="#ffd93d" onChange={(v) => { setHsl(prev => ({ ...prev, s: v })); updateFromHsl(); }} />
              <ColorSlider label="L" value={hsl.l} max={100} color="#ffd93d" onChange={(v) => { setHsl(prev => ({ ...prev, l: v })); updateFromHsl(); }} />
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Format</div>
            <select value={format} onChange={(e) => handleFormatChange(e.target.value as ColorFormat)} style={{ padding: '6px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: 12 }}>
              <option value="hex"><Hash size={12} /> Hex</option>
              <option value="rgb"><Rgb size={12} /> RGB</option>
              <option value="hsl"><Cpu size={12} /> HSL</option>
              <option value="cmyk"><Palette size={12} /> CMYK</option>
            </select>
          </div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            {formattedColor()}
          </div>
        </div>

        {showPalette && savedColors.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Saved Colors</div>
              <button onClick={() => setShowPalette(!showPalette)} style={iconButtonStyle()}><ChevronDown size={12} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {savedColors.map((color) => (
                <div key={color} style={{ position: 'relative', width: 36, height: 36, borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <button
                    onClick={() => handleSelectSaved(color)}
                    style={{ width: '100%', height: '100%', background: color, border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveColor(color); }}
                    style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorSlider({ label, value, max, color, onChange }: { label: string; value: number; max: number; color: string; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 16, fontSize: 12, fontWeight: 600, color, textAlign: 'right' }}>{label}</span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          flex: 1,
          accentColor: color,
          height: 6,
        }}
      />
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: 50,
          padding: '4px 8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          fontSize: 12,
          textAlign: 'right',
        }}
      />
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