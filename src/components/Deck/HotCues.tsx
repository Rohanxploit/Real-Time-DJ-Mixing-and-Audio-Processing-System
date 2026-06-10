import { cn } from '../../lib/utils';
import { formatTime } from '../../types/deck';

export interface HotCuesProps {
  hotCues: (number | null)[];
  isLoaded: boolean;
  cueActiveClass: string;
  onCueClick: (index: number) => void;
}

export default function HotCues({
  hotCues,
  isLoaded,
  cueActiveClass,
  onCueClick,
}: HotCuesProps) {
  return (
    <div className="flex gap-2">
      {hotCues.map((cue, index) => (
        <button
          key={index}
          onClick={() => onCueClick(index)}
          disabled={!isLoaded}
          title={cue !== null ? `Jump to ${formatTime(cue)}` : 'Set cue point'}
          className={cn(
            'flex-1 py-1.5 rounded text-xs font-bold transition-colors border shadow-inner disabled:opacity-30',
            cue !== null
              ? cueActiveClass
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700/50'
          )}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
