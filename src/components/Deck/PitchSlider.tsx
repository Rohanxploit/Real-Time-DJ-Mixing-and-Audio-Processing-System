import { cn } from '../../lib/utils';
import { PITCH_MIN, PITCH_MAX } from '../../types/deck';

export interface PitchSliderProps {
  pitch: number;
  isLoaded: boolean;
  targetBpm: number;
  localBpm: number;
  sliderClass: string;
  onPitchChange: (val: number) => void;
  onSync: () => void;
}

export default function PitchSlider({
  pitch,
  isLoaded,
  targetBpm,
  localBpm,
  sliderClass,
  onPitchChange,
  onSync,
}: PitchSliderProps) {
  return (
    <div className="w-16 flex flex-col items-center bg-zinc-950/50 rounded-lg p-2 border border-zinc-800/50 relative">
      <button
        onClick={onSync}
        disabled={!isLoaded || !targetBpm || !localBpm}
        title="Sync BPM to other deck"
        className="mb-2 text-[8px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700 disabled:opacity-30 transition-colors z-10"
      >
        SYNC
      </button>

      <div className="flex-1 w-full flex justify-center items-center py-4 relative">
        <input
          type="range"
          min={PITCH_MIN}
          max={PITCH_MAX}
          step={0.1}
          value={pitch}
          onChange={(e) => onPitchChange(Number(e.target.value))}
          disabled={!isLoaded}
          title={`Pitch: ${pitch > 0 ? '+' : ''}${pitch.toFixed(1)}%`}
          className={cn(
            'absolute w-28 h-1.5 bg-zinc-800 rounded-full appearance-none origin-center -rotate-90 disabled:opacity-30',
            sliderClass
          )}
        />
      </div>

      <span className="text-[10px] font-mono text-zinc-400 mt-2 z-10">
        {pitch > 0 ? '+' : ''}
        {pitch.toFixed(1)}%
      </span>
    </div>
  );
}
