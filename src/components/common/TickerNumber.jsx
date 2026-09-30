import React, { useState, useEffect, useRef } from 'react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Single character ticker column:
 * If numeric (0-9), renders a vertical rolling strip of 0-9 that slides to the target number.
 * If non-numeric (e.g. ₹, ,, .), renders the static symbol.
 */
function TickerDigit({ char, index, totalDigits }) {
  const isDigit = /^[0-9]$/.test(char);

  if (!isDigit) {
    return (
      <span className="inline-block select-none" aria-hidden="true">
        {char}
      </span>
    );
  }

  const num = parseInt(char, 10);
  // Stagger animation slightly from right-to-left for authentic stock ticker cascade
  const delay = Math.max(0, (totalDigits - 1 - index) * 35);

  return (
    <span
      className="inline-block relative overflow-hidden h-[1.16em] leading-[1.16em] align-top select-none"
      style={{ verticalAlign: 'baseline' }}
      aria-hidden="true"
    >
      <span
        className="flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: `translateY(-${num * 10}%)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="h-[1.16em] leading-[1.16em] flex items-center justify-center text-center font-bold"
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Stock-market style rolling number ticker with directional flash/pulse animation
 * @param {string|number} value The number or currency string to display (e.g., 2, '₹1,398')
 * @param {string} className Extra CSS classes
 * @param {boolean} enableFlash Whether to show a brief green/red flash on value change
 */
export default function TickerNumber({ value, className = '', enableFlash = true }) {
  const strValue = String(value ?? '0');
  const prevValueRef = useRef(strValue);
  const isFirstRender = useRef(true);
  const [flashType, setFlashType] = useState(null); // 'up' | 'down' | null

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevValueRef.current = strValue;
      return;
    }

    if (prevValueRef.current !== strValue) {
      if (enableFlash) {
        const prevNum = Number(prevValueRef.current.replace(/[^0-9.-]+/g, ''));
        const currentNum = Number(strValue.replace(/[^0-9.-]+/g, ''));

        if (!isNaN(prevNum) && !isNaN(currentNum)) {
          if (currentNum > prevNum) {
            setFlashType('up');
          } else if (currentNum < prevNum) {
            setFlashType('down');
          }
        } else {
          setFlashType('up');
        }

        const timer = setTimeout(() => {
          setFlashType(null);
        }, 1200);

        prevValueRef.current = strValue;
        return () => clearTimeout(timer);
      }
      prevValueRef.current = strValue;
    }
  }, [strValue, enableFlash]);

  const chars = strValue.split('');
  const totalDigits = chars.filter((c) => /^[0-9]$/.test(c)).length;
  let digitIndex = 0;

  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-tight transition-all duration-300 rounded px-1 -mx-1 ${
        flashType === 'up'
          ? 'bg-emerald-500/20 text-emerald-800 scale-102 ring-1 ring-emerald-500/40 shadow-xs'
          : flashType === 'down'
          ? 'bg-rose-500/20 text-rose-800 scale-102 ring-1 ring-rose-500/40 shadow-xs'
          : ''
      } ${className}`}
      aria-label={strValue}
    >
      {chars.map((char, idx) => {
        const isNum = /^[0-9]$/.test(char);
        const currentDigitIndex = isNum ? digitIndex++ : 0;
        // Key from right-to-left so existing digit positions remain mounted and animate smoothly
        const rightPos = chars.length - 1 - idx;
        const key = `${char === '₹' ? 'curr' : char === ',' ? 'sep' : 'pos'}-${rightPos}`;

        return (
          <TickerDigit
            key={key}
            char={char}
            index={currentDigitIndex}
            totalDigits={totalDigits}
          />
        );
      })}
    </span>
  );
}
