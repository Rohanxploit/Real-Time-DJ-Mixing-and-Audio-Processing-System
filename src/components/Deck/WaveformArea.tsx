import React from 'react';
import { cn } from '../../lib/utils';

export interface WaveformAreaProps {
  waveformRef: React.RefObject<HTMLDivElement>;
  currentTime: number;
  duration: number;
  isLoaded: boolean;
  sliderClass: string;
  onSeek: (val: number) => void;
}

export default function WaveformArea({
  waveformRef,
  currentTime,
  duration,
  isLoaded,
  sliderClass,
  onSeek,
}: WaveformAreaProps) {
  return (
    <div className="bg-zinc-950/80 rounded-lg p-2 mb-4 border border-zinc-800/50 flex flex-col gap-2">
      {/* WaveSurfer mounts here — div must always be in DOM for the ref to work */}
      <div ref={waveformRef} className="w-full h-[60px]" />

      {/* Native seek bar as ground-truth scrubber */}
      <div className="px-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.01}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={!isLoaded}
          className={cn(
            'w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer disabled:opacity-30',
            sliderClass
          )}
        />
      </div>
    </div>
  );
}
