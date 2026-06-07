import React, { useState } from 'react';

interface MixerProps {
  crossfader: number;
  setCrossfader: (val: number) => void;
}

export default function Mixer({ crossfader, setCrossfader }: MixerProps) {
  return (
    <div className="w-64 bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4 flex flex-col shadow-lg backdrop-blur-md">
      <h2 className="text-xs font-bold tracking-widest text-center text-zinc-500 mb-4">MIXER</h2>
      
      <div className="flex flex-1 gap-4 justify-center">
        <Channel eq={{ high: 0, mid: 0, low: 0 }} volume={80} label="CH A" color="cyan" />
        
        {/* Master LED Meter */}
        <div className="w-8 flex flex-col gap-1 items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-2 rounded-sm ${i < 2 ? 'bg-red-500/20' : i < 5 ? 'bg-amber-500/20' : 'bg-green-500/20'}`}
            />
          ))}
        </div>

        <Channel eq={{ high: 0, mid: 0, low: 0 }} volume={80} label="CH B" color="blue" />
      </div>

      {/* Crossfader */}
      <div className="mt-6 pt-4 border-t border-zinc-800/50">
        <div className="relative w-full h-8 bg-zinc-950 rounded flex items-center px-2">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800" />
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={crossfader}
            onChange={(e) => setCrossfader(Number(e.target.value))}
            className="w-full appearance-none bg-transparent accent-zinc-300 relative z-10"
          />
        </div>
      </div>
    </div>
  );
}

function Channel({ eq, volume, label, color }: any) {
  const [v, setV] = useState(volume);
  
  return (
    <div className="flex flex-col items-center gap-3">
      {/* EQ Knobs */}
      <div className="flex flex-col gap-3">
        <Knob label="HI" />
        <Knob label="MID" />
        <Knob label="LOW" />
      </div>
      
      {/* Filter */}
      <div className="mt-2 mb-2">
        <Knob label="FILTER" size="lg" />
      </div>

      {/* Volume Fader */}
      <div className="flex-1 relative flex justify-center py-2 h-32 w-full">
        <input 
          type="range" 
          min="0" 
          max="100"
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          className={`h-full w-1.5 bg-zinc-800 rounded-full appearance-none accent-${color}-500 cursor-ns-resize`}
          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
        />
      </div>
      
      <span className="text-[10px] font-bold text-zinc-500 tracking-wider">{label}</span>
    </div>
  );
}

function Knob({ label, size = "md" }: { label: string, size?: "md" | "lg" }) {
  const dim = size === "lg" ? "w-10 h-10" : "w-8 h-8";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${dim} rounded-full bg-zinc-800 border-2 border-zinc-700 shadow-lg relative flex items-center justify-center group cursor-pointer hover:border-zinc-500 transition-colors`}>
        <div className="w-1 h-3 bg-zinc-400 absolute top-1 rounded-full group-hover:bg-zinc-200" />
      </div>
      <span className="text-[9px] font-bold text-zinc-500 tracking-wider">{label}</span>
    </div>
  );
}
