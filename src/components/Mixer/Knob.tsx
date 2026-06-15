import React, { useState, useRef, useCallback } from 'react';

interface KnobProps {
  label: string;
  value: number; // 0 to 100
  onChange: (val: number) => void;
  size?: number;
  accentClass?: string;
  centerDetent?: boolean;
}

// Helper to convert tailwind accent class to hex color for SVG
const getAccentHex = (className: string) => {
  if (className.includes('purple')) return '#c084fc';
  if (className.includes('cyan')) return '#22d3ee';
  if (className.includes('blue')) return '#3b82f6';
  return '#a1a1aa'; // default zinc-400
};

export default function Knob({
  label,
  value,
  onChange,
  size = 42,
  accentClass = 'accent-zinc-400',
  centerDetent = true
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    
    // Sensitivity: 1 pixel = 1 value point
    const deltaY = startYRef.current - e.clientY;
    let newVal = startValRef.current + deltaY;
    
    newVal = Math.max(0, Math.min(100, newVal));

    // Optional center detent (snap to 50 if close)
    if (centerDetent && Math.abs(newVal - 50) < 3) {
      newVal = 50;
    }

    onChange(newVal);
  }, [isDragging, onChange, centerDetent]);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    setIsDragging(false);
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Map 0-100 to -135 to +135 degrees
  const angle = -135 + (value / 100) * 270;
  const accentHex = getAccentHex(accentClass);

  return (
    <div className="flex flex-col items-center gap-1 select-none touch-none">
      <div 
        className="relative rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-zinc-800 bg-gradient-to-b from-zinc-800 to-zinc-900 cursor-ns-resize flex items-center justify-center transition-shadow"
        style={{ width: size, height: size, boxShadow: isDragging ? '0 0 15px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)' : '' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove as any}
        onPointerUp={handlePointerUp as any}
        onPointerCancel={handlePointerUp as any}
      >
        {/* Indicator Ring background */}
        <svg className="absolute inset-0 pointer-events-none" width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#18181b" strokeWidth="6" strokeDasharray="198 100" strokeDashoffset="-66" strokeLinecap="round" />
          
          {/* Active Value Ring */}
          <circle 
            cx="50" cy="50" r="42" fill="none" stroke={accentHex} strokeWidth="6" 
            strokeDasharray="198 100" strokeDashoffset={-66 - (198 - (value/100 * 198))} 
            strokeLinecap="round" 
            className="transition-all duration-75"
          />
        </svg>

        {/* Knob Body (Rotates) */}
        <div 
          className="absolute rounded-full bg-[#1e1e21] shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-zinc-700 flex items-center justify-center"
          style={{ width: size * 0.75, height: size * 0.75, transform: `rotate(${angle}deg)` }}
        >
          {/* Center metal cap */}
          <div className="absolute rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 shadow-inner" style={{ width: size * 0.4, height: size * 0.4 }}></div>
          {/* Indicator Line */}
          <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-1 h-[25%] rounded-full" style={{ backgroundColor: accentHex, boxShadow: `0 0 4px ${accentHex}` }}></div>
        </div>
      </div>
      
      {label && <span className="text-[10px] font-semibold text-zinc-400 tracking-wider font-sans">{label}</span>}
    </div>
  );
}
