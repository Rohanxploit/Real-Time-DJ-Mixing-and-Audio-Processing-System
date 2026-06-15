import { cn } from '../../lib/utils';
import { formatTime } from '../../types/deck';

export interface HotCuesProps {
  hotCues: (number | null)[];
  isLoaded: boolean;
  cueActiveClass: string;
  onCueClick: (index: number) => void;
  showPadNumbers?: boolean;
}

export default function HotCues({
  hotCues,
  isLoaded,
  cueActiveClass,
  onCueClick,
  showPadNumbers = true,
}: HotCuesProps) {
  return (
    <div className="flex gap-1.5 bg-[#111113] p-1.5 rounded-lg border border-zinc-800 shadow-inner h-16">
      {hotCues.map((cue, index) => {
        // Convert tailwind bg/text class from cueActiveClass into a glowing border/shadow for the pad
        const isCyan = cueActiveClass.includes('cyan');
        const isBlue = cueActiveClass.includes('blue');
        let padActiveStyle = 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:border-zinc-600';
        if (cue !== null) {
          padActiveStyle = isCyan 
            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5),inset_0_0_10px_rgba(6,182,212,0.4)]'
            : isBlue
            ? 'bg-blue-950/50 border-blue-500 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5),inset_0_0_10px_rgba(59,130,246,0.4)]'
            : 'bg-orange-950/50 border-orange-500 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.5),inset_0_0_10px_rgba(249,115,22,0.4)]';
        }

        return (
          <button
            key={index}
            onClick={() => onCueClick(index)}
            disabled={!isLoaded}
            title={cue !== null ? `Jump to ${formatTime(cue)}` : 'Set cue point'}
            className={cn(
              'flex-1 rounded-sm transition-all border-b-4 disabled:opacity-30 active:scale-95 flex flex-col items-center justify-end pb-1.5',
              padActiveStyle
            )}
          >
            {showPadNumbers && (
              <span className="text-[10px] font-bold tracking-widest opacity-80">
                CUE {index + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
