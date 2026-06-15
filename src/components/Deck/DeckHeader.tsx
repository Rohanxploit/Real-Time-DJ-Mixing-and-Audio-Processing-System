import { Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatTime } from '../../types/deck';

export interface DeckHeaderProps {
  title: string;
  trackName: string;
  artistName: string;
  currentTime: number;
  duration: number;
  localBpm: number;
  accentClass: string;
  onLoadClick: () => void;
}

export default function DeckHeader({
  title,
  trackName,
  artistName,
  currentTime,
  duration,
  localBpm,
  accentClass,
  onLoadClick,
}: DeckHeaderProps) {
  // Convert accentClass to text glow color
  const glowClass = accentClass.includes('cyan') 
    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
    : accentClass.includes('blue')
    ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]'
    : 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]';

  return (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <h2 className={cn('text-[11px] font-black tracking-[0.2em] uppercase', accentClass)}>
          {title}
        </h2>
        <button
          onClick={onLoadClick}
          className="px-3 py-1 bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-colors border border-zinc-600 text-zinc-200 shadow-sm"
        >
          <Upload size={12} /> LOAD TRACK
        </button>
      </div>

      {/* LCD Display Panel */}
      <div className="bg-[#050505] border-2 border-zinc-800/80 rounded-lg p-3 shadow-[inset_0_4px_15px_rgba(0,0,0,0.8)] relative overflow-hidden flex justify-between items-end">
        {/* LCD Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}></div>
        
        <div className="flex-1 min-w-0 pr-4 relative z-10">
          <div className={cn("text-xl font-bold truncate w-full tracking-wide", glowClass)} title={trackName}>
            {trackName}
          </div>
          <div className="text-xs text-zinc-400 font-semibold mt-0.5 tracking-wide uppercase">
            {artistName}
          </div>
          
          <div className={cn("text-2xl font-display font-bold mt-2", glowClass)}>
            {formatTime(currentTime)} <span className="text-zinc-600 drop-shadow-none text-lg">/ {formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 relative z-10">
          <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1">BPM</div>
          <div className={cn("text-4xl font-display font-black leading-none", glowClass)}>
            {localBpm ? localBpm.toFixed(1) : '---.-'}
          </div>
        </div>
      </div>
    </div>
  );
}
