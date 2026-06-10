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
        className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-transform active:scale-95 shadow-lg border border-zinc-700/50 text-zinc-300 disabled:opacity-30"
      >
        <RefreshCw size={20} />
      </button>

      <button
        onClick={onToggleCue}
        disabled={!isLoaded}
        title="Toggle cue output (PFL)"
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-transform shadow-lg border text-[10px] font-bold tracking-tighter disabled:opacity-30',
          isCueOn
            ? 'bg-amber-500 text-zinc-950 border-white'
            : 'bg-zinc-800 text-amber-500 border-zinc-700/50 hover:bg-zinc-700'
        )}
      >
        CUE
      </button>

      <button
        onClick={onTogglePlay}
        disabled={!isLoaded}
        title={isPlaying ? 'Pause' : 'Play'}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-lg border disabled:opacity-30',
          isPlaying
            ? 'bg-zinc-100 text-zinc-950 border-white'
            : 'bg-zinc-800 text-zinc-100 border-zinc-700/50 hover:bg-zinc-700'
        )}
      >
        {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
      </button>
    </div>
  );
}
