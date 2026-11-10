import React, { useState, useEffect } from 'react';
import { Copy, X, Settings, RotateCcw, Minus, Percent, Delete, Plus, Divide, Multiply, Equal } from 'lucide-react';
import type { WidgetProps, WidgetState } from '../../shared/types';

interface CalculatorWidgetProps extends WidgetProps {
  widget: WidgetState;
}

export function CalculatorWidget({ widget, onUpdate, onRemove, onPin, onDuplicate, onBringToFront, isFocused }: CalculatorWidgetProps) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>(widget.data.history as string[] || []);
  const [showHistory, setShowHistory] = useState(false);

  const currentValue = useRef(0);
  const previousValue = useRef(0);
  const operation = useRef<string>('');
  const isNewEntry = useRef(true);
  const hasDecimal = useRef(false);

  const handleNumber = (num: string) => {
    if (isNewEntry.current) {
      setDisplay(num === '.' ? '0.' : num);
      hasDecimal.current = num === '.';
      isNewEntry.current = false;
    } else {
      if (num === '.') {
        if (!hasDecimal.current) {
          setDisplay(prev => prev + '.');
          hasDecimal.current = true;
        }
      } else {
        setDisplay(prev => prev === '0' ? num : prev + num);
      }
    }
  };

  const handleOperation = (op: string) => {
    if (!isNewEntry.current) {
      calculate();
    }
    previousValue.current = parseFloat(display);
    operation.current = op;
    isNewEntry.current = true;
    hasDecimal.current = false;
    setExpression(`${previousValue.current} ${getOpSymbol(op)}`);
  };

  const calculate = () => {
    if (!operation.current) return;
    currentValue.current = parseFloat(display);
    let result = 0;

    try {
      switch (operation.current) {
        case '+': result = previousValue.current + currentValue.current; break;
        case '-': result = previousValue.current - currentValue.current; break;
        case '*': result = previousValue.current * currentValue.current; break;
        case '/': result = currentValue.current !== 0 ? previousValue.current / currentValue.current : NaN; break;
      }

      const historyEntry = `${previousValue.current} ${getOpSymbol(operation.current)} ${currentValue.current} = ${result}`;
      setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);

      setDisplay(result.toString());
      previousValue.current = result;
    } catch {
      setDisplay('Error');
    }
  };

  const handleEquals = () => {
    calculate();
    operation.current = '';
    isNewEntry.current = true;
    setExpression('');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    currentValue.current = 0;
    previousValue.current = 0;
    operation.current = '';
    isNewEntry.current = true;
    hasDecimal.current = false;
  };

  const handleClearEntry = () => {
    setDisplay('0');
    isNewEntry.current = true;
    hasDecimal.current = false;
  };

  const handleBackspace = () => {
    if (!isNewEntry.current && display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
      isNewEntry.current = true;
    }
  };

  const handleToggleSign = () => {
    if (!isNewEntry.current && display !== '0') {
      setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
    }
  };

  const handlePercent = () => {
    if (!isNewEntry.current) {
      setDisplay((parseFloat(display) / 100).toString());
    }
  };

  const getOpSymbol = (op: string) => ({ '+': '+', '-': '−', '*': '×', '/': '÷' })[op] || op;

  const copyResult = () => {
    navigator.clipboard.writeText(display);
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
            onClick={() => { setShowHistory(!showHistory); }}
            style={iconButtonStyle()}
            aria-label="History"
          >
            <RotateCcw size={14} />
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

      {showHistory && history.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 36,
          right: 8,
          bottom: 0,
          width: 200,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0 0 8px 0',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
        }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>History</span>
            <button onClick={() => setHistory([])} style={iconButtonStyle()}><Trash2 size={12} /></button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            {history.map((entry, i) => (
              <div key={i} style={{ padding: '6px 12px', fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}
                onClick={() => { setDisplay(entry.split('=')[1].trim()); setShowHistory(false); }}
              >
                {entry}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', minHeight: 20, fontFamily: 'var(--font-mono)' }}>{expression}</div>
          <div style={{ fontSize: 42, fontWeight: 200, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{display}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'C', action: handleClear, className: 'btn-func' },
            { label: '⌫', action: handleBackspace, className: 'btn-func' },
            { label: '%', action: handlePercent, className: 'btn-func' },
            { label: '÷', action: () => handleOperation('/'), className: 'btn-op' },
            { label: '7', action: () => handleNumber('7') },
            { label: '8', action: () => handleNumber('8') },
            { label: '9', action: () => handleNumber('9') },
            { label: '×', action: () => handleOperation('*'), className: 'btn-op' },
            { label: '4', action: () => handleNumber('4') },
            { label: '5', action: () => handleNumber('5') },
            { label: '6', action: () => handleNumber('6') },
            { label: '−', action: () => handleOperation('-'), className: 'btn-op' },
            { label: '1', action: () => handleNumber('1') },
            { label: '2', action: () => handleNumber('2') },
            { label: '3', action: () => handleNumber('3') },
            { label: '+', action: () => handleOperation('+'), className: 'btn-op' },
            { label: '±', action: handleToggleSign, className: 'btn-func' },
            { label: '0', action: () => handleNumber('0') },
            { label: '.', action: () => handleNumber('.') },
            { label: '=', action: handleEquals, className: 'btn-eq' },
          ].map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              style={{
                ...btnStyle,
                background: btn.className === 'btn-op' ? 'var(--accent)' : 
                           btn.className === 'btn-eq' ? '#107c10' : 
                           btn.className === 'btn-func' ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                color: btn.className === 'btn-op' || btn.className === 'btn-eq' ? 'white' : 'var(--text-primary)',
                fontWeight: btn.className === 'btn-op' || btn.className === 'btn-eq' ? 600 : 400,
                fontSize: btn.className === 'btn-eq' ? 20 : 18,
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  height: 52,
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  cursor: 'pointer',
  transition: 'all 0.1s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

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