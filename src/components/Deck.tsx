import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeckProps {
  title: string;
  color: 'cyan' | 'blue';
}

export default function Deck({ title, color }: DeckProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);

  const themeColors = {
    cyan: {
      wave: '#22d3ee',
      progress: '#0891b2',
      bg: 'from-cyan-950/20 to-zinc-900/50',
      border: 'border-cyan-900/30',
      accent: 'text-cyan-400',
      slider: 'accent-cyan-500'
    },
    blue: {
      wave: '#3b82f6',
      progress: '#2563eb',
      bg: 'from-blue-950/20 to-zinc-900/50',
      border: 'border-blue-900/30',
      accent: 'text-blue-400',
      slider: 'accent-blue-500'
    }
  };

  const theme = themeColors[color];

  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#52525b',
        progressColor: theme.wave,
        cursorColor: '#f4f4f5',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 80,
      });

      // We simulate an empty track visualization because we have no audio file loaded
    }

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [theme.wave]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={cn("flex-1 rounded-xl border flex flex-col p-4 shadow-lg bg-gradient-to-br", theme.bg, theme.border)}>
      {/* Deck Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className={cn("text-xs font-bold tracking-widest mb-1", theme.accent)}>{title}</h2>
          <div className="text-xl font-bold truncate w-48">Select Track</div>
          <div className="text-sm text-zinc-400">Artist - 0:00 / 0:00</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-mono font-bold">120.0</div>
          <div className="text-xs text-zinc-500 font-semibold tracking-wider">BPM</div>
        </div>
      </div>

      {/* Waveform */}
      <div className="bg-zinc-950/80 rounded-lg p-2 mb-4 border border-zinc-800/50">
        <div ref={waveformRef} className="w-full" />
      </div>

      <div className="flex-1 flex gap-4">
        {/* Controls */}
        <div className="flex-1 flex flex-col justify-end gap-4">
          {/* Cue Points */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((cue) => (
              <button key={cue} className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-colors border border-zinc-700/50 shadow-inner">
                {cue}
              </button>
            ))}
          </div>
          
          {/* Transport */}
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-transform active:scale-95 shadow-lg border border-zinc-700/50 text-zinc-300">
              <RefreshCw size={20} />
            </button>
            <button className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-transform active:scale-95 shadow-lg border border-zinc-700/50 text-amber-500 font-bold tracking-tighter">
              CUE
            </button>
            <button 
              onClick={togglePlay}
              className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg border", 
                isPlaying ? 'bg-zinc-100 text-zinc-950 border-white' : 'bg-zinc-800 text-zinc-100 border-zinc-700/50 hover:bg-zinc-700'
              )}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="w-12 flex flex-col items-center bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50">
          <span className="text-[10px] font-bold text-zinc-500 mb-2">PITCH</span>
          <div className="flex-1 relative w-full flex justify-center py-2">
            <input 
              type="range" 
              min="-8" 
              max="8" 
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-1.5 bg-zinc-800 rounded-full appearance-none slider-vertical cursor-ns-resize", theme.slider)}
              style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-400 mt-2">{pitch > 0 ? '+' : ''}{pitch.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
