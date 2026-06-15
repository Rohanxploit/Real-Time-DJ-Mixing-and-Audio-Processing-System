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
    <div className="grid grid-cols-4 gap-2 bg-[#111113] p-2 rounded-lg border border-zinc-800 shadow-inner">
      {hotCues.map((cue, index) => {
        // Convert tailwind bg/text class from cueActiveClass into a glowing border/shadow for the pad
        const isCyan = cueActiveClass.includes('cyan');
        const isBlue = cueActiveClass.includes('blue');
        
        let padActiveStyle = 'bg-zinc-800 border-zinc-700 text-zinc-500';
        if (cue !== null) {
          padActiveStyle = isCyan 
            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4),inset_0_0_8px_rgba(6,182,212,0.5)]'
            : isBlue
            ? 'bg-blue-950/50 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.4),inset_0_0_8px_rgba(59,130,246,0.5)]'
            : 'bg-orange-950/50 border-orange-500 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.4),inset_0_0_8px_rgba(249,115,22,0.5)]';
        }

        return (
          <button
            key={index}
            onClick={() => onCueClick(index)}
            disabled={!isLoaded}
            title={cue !== null ? `Jump to ${formatTime(cue)}` : 'Set cue point'}
            className={cn(
              'aspect-square rounded-md text-lg font-display font-black transition-all border-2 disabled:opacity-30 active:scale-95 flex items-center justify-center',
              padActiveStyle,
              cue === null && 'hover:bg-zinc-700 hover:border-zinc-600'
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}
