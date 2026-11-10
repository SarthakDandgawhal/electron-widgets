import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({ content, children, position = 'top', delay = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (childRef.current && tooltipRef.current) {
        const rect = childRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let x = rect.left + rect.width / 2 - tooltipRect.width / 2;
        let y = rect.top - tooltipRect.height - 8;
        
        if (position === 'bottom') {
          y = rect.bottom + 8;
        } else if (position === 'left') {
          x = rect.left - tooltipRect.width - 8;
          y = rect.top + rect.height / 2 - tooltipRect.height / 2;
        } else if (position === 'right') {
          x = rect.right + 8;
          y = rect.top + rect.height / 2 - tooltipRect.height / 2;
        }
        
        setTooltipPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const enhancedChildren = React.cloneElement(children, {
    ref: childRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  });

  return (
    <>
      {enhancedChildren}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            padding: '6px 10px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontSize: 11,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            zIndex: 3000,
            pointerEvents: 'none',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {content}
        </div>
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}