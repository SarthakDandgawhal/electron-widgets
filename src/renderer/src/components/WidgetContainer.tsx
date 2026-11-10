import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, Pin, PinOff, Copy, Trash2, MoreHorizontal, Grip } from 'lucide-react';
import type { WidgetState } from '../../shared/types';

interface WidgetContainerProps {
  children: React.ReactNode;
  widget: WidgetState;
  isFocused: boolean;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onUpdate: (data: Record<string, unknown>) => void;
  onRemove: () => void;
  onPin: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
}

export function WidgetContainer({
  children,
  widget,
  isFocused,
  isDragging,
  onMouseDown,
  onContextMenu,
  onUpdate,
  onRemove,
  onPin,
  onDuplicate,
  onBringToFront,
}: WidgetContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const handleResize = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;
      const { x, y, width, height } = resizeStartRef.current;
      const newWidth = Math.max(150, width + e.clientX - x);
      const newHeight = Math.max(100, height + e.clientY - y);
      onUpdate({ width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      resizeStartRef.current = null;
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, onUpdate]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      };
      setIsResizing(true);
    }
  };

  const style: React.CSSProperties = {
    position: 'absolute',
    left: widget.x,
    top: widget.y,
    width: widget.width,
    height: widget.height,
    zIndex: widget.zIndex,
    opacity: widget.opacity,
    transform: isDragging ? 'scale(1.02)' : 'none',
    transition: isDragging ? 'none' : 'transform 0.1s ease, opacity 0.1s ease',
    pointerEvents: isDragging ? 'none' : 'auto',
  };

  return (
    <div
      ref={containerRef}
      style={style}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className="widget-container"
    >
      <div
        className="widget-frame"
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="widget-header"
          style={{
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            background: 'transparent',
            borderBottom: '1px solid var(--border-color)',
            opacity: showControls || isFocused ? 1 : 0,
            transition: 'opacity 0.2s ease',
            userSelect: 'none',
            '-webkit-app-region': 'drag',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {widget.title}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
              {widget.type}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, '-webkit-app-region': 'no-drag' }}>
            <TooltipContent text="Pin" show={showControls || isFocused}>
              <button
                onClick={(e) => { e.stopPropagation(); onPin(); }}
                style={iconButtonStyle(widget.isPinned)}
                aria-label={widget.isPinned ? 'Unpin' : 'Pin'}
              >
                {widget.isPinned ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
            </TooltipContent>

            <TooltipContent text="Duplicate" show={showControls || isFocused}>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                style={iconButtonStyle()}
                aria-label="Duplicate"
              >
                <Copy size={14} />
              </button>
            </TooltipContent>

            <TooltipContent text="Close" show={showControls || isFocused}>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                style={iconButtonStyle(true)}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </TooltipContent>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </div>

        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 20,
            height: 20,
            cursor: 'se-resize',
            background: 'linear-gradient(135deg, transparent 50%, var(--border-light) 50%)',
            opacity: showControls || isFocused ? 0.6 : 0,
            transition: 'opacity 0.2s ease',
            zIndex: 10,
          }}
          aria-label="Resize"
        />
      </div>
    </div>
  );
}

function iconButtonStyle(danger = false) {
  return {
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    background: danger ? 'rgba(255, 85, 85, 0.15)' : 'transparent',
    color: danger ? '#ff5555' : 'var(--text-secondary)',
    transition: 'all 0.15s ease',
  } as React.CSSProperties;
}

function TooltipContent({ text, show, children }: { text: string; show: boolean; children: React.ReactElement }) {
  if (!show) return <>{children}</>;
  return (
    <div style={{ position: 'relative' }}>
      {children}
      <div style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: 8,
        padding: '4px 8px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '4px',
        fontSize: 11,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        zIndex: 100,
        boxShadow: 'var(--shadow-md)',
      }}>
        {text}
      </div>
    </div>
  );
}