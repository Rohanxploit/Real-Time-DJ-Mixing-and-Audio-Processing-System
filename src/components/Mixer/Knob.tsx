import React from 'react';

interface KnobProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  height?: string;
  accentClass?: string;
}

export default function Knob({
  label,
  value,
  onChange,
  height = 'h-16',
  accentClass = 'accent-zinc-400',
}: KnobProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative flex justify-center py-1 ${height} w-full`}>
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`h-full w-1.5 bg-zinc-800 rounded-full appearance-none cursor-ns-resize ${accentClass}`}
          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
          aria-label={label}
        />
      </div>
      <span className="text-[9px] font-bold text-zinc-500 tracking-wider">{label}</span>
    </div>
  );
}
