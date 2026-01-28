'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  step?: number;
  formatValue?: (value: number) => string;
}

export default function Slider({
  min,
  max,
  value,
  onChange,
  label,
  step = 1,
  formatValue = (v) => v.toString(),
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const rawValue = min + percent * (max - min);
      // Round to nearest step
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const newValue = getValueFromPosition(e.clientX);
    onChange(newValue);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newValue = getValueFromPosition(e.clientX);
      onChange(newValue);
    },
    [getValueFromPosition, onChange]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    const touch = e.touches[0];
    const newValue = getValueFromPosition(touch.clientX);
    onChange(newValue);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const newValue = getValueFromPosition(touch.clientX);
    onChange(newValue);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Define tick marks
  const tickMarks = [25, 100, 200, 300, 400];

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-navy">{label}</label>
        <span className="text-sm font-semibold text-teal">{formatValue(value)}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Filled track */}
        <div
          className="absolute h-full bg-teal rounded-full transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-teal rounded-full shadow-sm transition-all duration-75 hover:scale-110"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />

        {/* Tick marks */}
        <div className="absolute top-3 left-0 right-0 flex justify-between px-0">
          {tickMarks.map((tick) => {
            const tickPercent = ((tick - min) / (max - min)) * 100;
            const isActive = value >= tick;
            return (
              <div
                key={tick}
                className={`text-[10px] ${
                  isActive ? 'text-teal font-medium' : 'text-gray-400'
                }`}
                style={{
                  position: 'absolute',
                  left: `${tickPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                {tick}
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-3" /> {/* Spacer for tick marks */}
    </div>
  );
}
