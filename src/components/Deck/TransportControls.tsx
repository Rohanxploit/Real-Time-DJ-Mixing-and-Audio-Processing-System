import { Play, Pause, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TransportControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  isCueOn: boolean;
  onRestart: () => void;
  onToggleCue: () => void;
  onTogglePlay: () => void;
}

export default function TransportControls({
  isPlaying,
  isLoaded,
  isCueOn,
  onRestart,
  onToggleCue,
  onTogglePlay,
}: TransportControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRestart}
        disabled={!isLoaded}
        title="Restart track"
        className="w-10 h-10 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 flex items-center justify-center transition-transform active:scale-95 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-zinc-800 text-zinc-300 disabled:opacity-30 hover:brightness-110"
      >
        <div className="w-8 h-8 rounded-full bg-[#18181b] shadow-inner flex items-center justify-center border border-zinc-800">
          <RefreshCw size={14} />
        </div>
      </button>

      <button
        onClick={onToggleCue}
        disabled={!isLoaded}
        title="Toggle cue output (PFL)"
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-transform shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.1)] border text-[10px] font-bold tracking-tighter disabled:opacity-30 active:scale-95',
          isCueOn
            ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-zinc-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
            : 'bg-gradient-to-b from-zinc-700 to-zinc-900 text-amber-500 border-zinc-800 hover:brightness-110'
        )}
      >
        <div className={cn("w-10 h-10 rounded-full shadow-inner flex items-center justify-center border", isCueOn ? "bg-amber-400 border-amber-300" : "bg-[#18181b] border-zinc-800")}>
          CUE
        </div>
      </button>

      <button
        onClick={onTogglePlay}
        disabled={!isLoaded}
        title={isPlaying ? 'Pause' : 'Play'}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-[0_6px_12px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] border disabled:opacity-30',
          isPlaying
            ? 'bg-gradient-to-b from-green-400 to-green-600 text-zinc-950 border-green-300 shadow-[0_0_25px_rgba(74,222,128,0.6)]'
            : 'bg-gradient-to-b from-zinc-700 to-zinc-900 text-green-400 border-zinc-800 hover:brightness-110'
        )}
      >
        <div className={cn("w-12 h-12 rounded-full shadow-inner flex items-center justify-center border", isPlaying ? "bg-green-400 border-green-300" : "bg-[#18181b] border-zinc-800")}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        </div>
      </button>
    </div>
  );
}
