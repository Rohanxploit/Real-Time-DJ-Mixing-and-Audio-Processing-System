import React from 'react';

export interface FxSectionProps {
  distFx: number;
  delayFx: number;
  onDistChange: (val: number) => void;
  onDelayChange: (val: number) => void;
}

export default function FxSection({
  distFx,
  delayFx,
  onDistChange,
  onDelayChange,
}: FxSectionProps) {
  return (
    <div className="w-16 flex flex-col gap-2 items-center justify-center bg-zinc-900/50 rounded p-2 border border-zinc-800/50">
      <span className="text-[10px] font-bold text-zinc-500 mb-1">FX</span>

      <div className="flex-1 w-full relative">
        <input
          type="range"
          min={0}
          max={100}
          value={distFx}
          onChange={(e) => onDistChange(Number(e.target.value))}
          className="absolute left-1/2 -translate-x-1/2 h-full w-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-orange-500"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
          title="Distortion"
        />
      </div>
      <span className="text-[8px] font-bold text-orange-500">DIST</span>

      <div className="flex-1 w-full relative">
        <input
          type="range"
          min={0}
          max={100}
          value={delayFx}
          onChange={(e) => onDelayChange(Number(e.target.value))}
          className="absolute left-1/2 -translate-x-1/2 h-full w-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-purple-500"
          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
          title="Delay"
        />
      </div>
      <span className="text-[8px] font-bold text-purple-500">DLY</span>
    </div>
  );
}
