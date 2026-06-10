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
  return (
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className={cn('text-xs font-bold tracking-widest', accentClass)}>
            {title}
          </h2>
          <button
            onClick={onLoadClick}
            className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors border border-zinc-700 text-zinc-300"
          >
            <Upload size={10} /> Load
          </button>
        </div>
        <div className="text-xl font-bold truncate w-full" title={trackName}>
          {trackName}
        </div>
        <div className="text-sm text-zinc-400">
          {artistName} — {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-2xl font-mono font-bold">
          {localBpm ? localBpm.toFixed(1) : '---'}
        </div>
        <div className="text-[10px] text-zinc-500 font-semibold tracking-wider">BPM</div>
      </div>
    </div>
  );
}
