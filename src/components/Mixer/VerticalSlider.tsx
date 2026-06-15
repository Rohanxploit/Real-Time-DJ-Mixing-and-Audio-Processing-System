import React, { useRef, useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '../../lib/utils';

export interface VerticalSliderProps {
  label: string;
  value: number; // 0 to 100
  onChange: (val: number) => void;
  accentClass: string; // e.g., 'text-cyan-400' or 'bg-cyan-400'
  height?: number;
}

export default function VerticalSlider({ label, value, onChange, accentClass, height = 100 }: VerticalSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Extract color from accentClass or use a default
  let glowColor = 'rgba(255,255,255,0.2)';
  let bgClass = 'bg-zinc-300';
  
  if (accentClass.includes('cyan')) {
    bgClass = 'bg-cyan-400';
    glowColor = 'rgba(34, 211, 238, 0.4)';
  } else if (accentClass.includes('blue')) {
    bgClass = 'bg-blue-400';
    glowColor = 'rgba(59, 130, 246, 0.4)';
  } else if (accentClass.includes('orange')) {
    bgClass = 'bg-orange-400';
    glowColor = 'rgba(251, 146, 60, 0.4)';
  } else if (accentClass.includes('purple')) {
    bgClass = 'bg-purple-400';
    glowColor = 'rgba(192, 132, 252, 0.4)';
  }

  const handleMove = (clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Inverted because Y grows downwards
    let percentage = (rect.bottom - clientY) / rect.height;
    percentage = Math.max(0, Math.min(1, percentage));
    onChange(percentage * 100);
  };

  const onMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY);
    };
    const onMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  const fillPercentage = value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        ref={containerRef}
        onMouseDown={onMouseDown}
        className="relative w-6 cursor-ns-resize flex justify-center group"
        style={{ height }}
      >
        {/* Track Background (Empty part) */}
        <div className="absolute top-0 bottom-0 w-1.5 bg-zinc-600 rounded-full" />
        
        {/* Track Fill */}
        <div 
          className={cn("absolute bottom-0 w-1.5 rounded-full shadow-lg", bgClass)}
          style={{ 
            height: `${fillPercentage}%`,
            boxShadow: `0 0 8px ${glowColor}` 
          }}
        />

        {/* Thumb */}
        <div 
          className={cn("absolute w-4 h-4 rounded-full border-4 border-[#2c2c2f] transition-transform duration-75", bgClass)}
          style={{ 
            bottom: `calc(${fillPercentage}% - 8px)`,
            transform: isDragging ? 'scale(1.2)' : 'scale(1)',
          }}
        />
      </div>
      {label && <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase mt-1">{label}</span>}
    </div>
  );
}
