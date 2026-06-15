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
    <div className="w-16 flex flex-col items-center bg-[#111113] rounded-lg p-2 border border-zinc-800 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] relative">
      <button
        onClick={onSync}
        disabled={!isLoaded || !targetBpm || !localBpm}
        title="Sync BPM to other deck"
        className="mb-3 text-[10px] font-black tracking-widest bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-300 px-2 py-1 rounded-md border border-zinc-600 shadow-sm disabled:opacity-30 transition-colors z-10 active:scale-95"
      >
        SYNC
      </button>

      <div className="flex-1 w-full flex justify-center items-center py-4 relative">
        {/* Pitch Slider Track Background & Center Detent */}
        <div className="absolute w-1 h-36 bg-black rounded-full border border-zinc-800 shadow-inner"></div>
        {/* Center zero-mark */}
        <div className="absolute w-4 h-0.5 bg-zinc-600 shadow-[0_0_4px_rgba(255,255,255,0.2)] z-0"></div>

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
            'absolute w-36 h-2 rounded-full appearance-none origin-center -rotate-90 disabled:opacity-30 cursor-ns-resize mix-blend-screen bg-transparent',
            sliderClass
          )}
        />
      </div>

      <span className="text-xs font-display text-zinc-400 mt-3 z-10">
        {pitch > 0 ? '+' : ''}
        {pitch.toFixed(1)}%
      </span>
    </div>
  );
}
