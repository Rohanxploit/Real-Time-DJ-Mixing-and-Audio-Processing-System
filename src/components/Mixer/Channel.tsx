import { useEffect, useState } from 'react';
import { getMixer, setDeckEQ, setDeckFilter } from '../../lib/audioEngine';
import Knob from './Knob';

interface ChannelState {
  volume: number;
  eqHigh: number;
  eqMid: number;
  eqLow: number;
  filter: number;
}

const DEFAULT_CHANNEL_STATE: ChannelState = {
  volume: 80,
  eqHigh: 50,
  eqMid: 50,
  eqLow: 50,
  filter: 50,
};

interface ChannelProps {
  id: 'A' | 'B';
  label: string;
  accentClass: string;
}

export default function Channel({ id, label, accentClass }: ChannelProps) {
  const [state, setState] = useState<ChannelState>(DEFAULT_CHANNEL_STATE);

  const update = (patch: Partial<ChannelState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    const channel = id === 'A' ? getMixer().channelA : getMixer().channelB;
    channel.setVolume(state.volume);
  }, [state.volume, id]);

  useEffect(() => {
    setDeckEQ(id, state.eqLow, state.eqMid, state.eqHigh).catch(console.error);
  }, [state.eqHigh, state.eqMid, state.eqLow, id]);

  useEffect(() => {
    setDeckFilter(id, state.filter).catch(console.error);
  }, [state.filter, id]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col gap-3">
        <Knob label="HI"  value={state.eqHigh} onChange={(v) => update({ eqHigh: v })} />
        <Knob label="MID" value={state.eqMid}  onChange={(v) => update({ eqMid: v })}  />
        <Knob label="LOW" value={state.eqLow}  onChange={(v) => update({ eqLow: v })}  />
      </div>

      <div className="mt-2 mb-2">
        <Knob
          label="FILTER"
          height="h-20"
          value={state.filter}
          onChange={(v) => update({ filter: v })}
          accentClass="accent-purple-400"
        />
      </div>

      <div className="flex-1 relative flex justify-center py-2 h-32 w-full">
        <input
          type="range"
          min={0}
          max={100}
          value={state.volume}
          onChange={(e) => update({ volume: Number(e.target.value) })}
          className={`h-full w-1.5 bg-zinc-800 rounded-full appearance-none cursor-ns-resize ${accentClass}`}
          style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties}
          aria-label={`${label} volume`}
        />
      </div>

      <span className="text-[10px] font-bold text-zinc-500 tracking-wider">{label}</span>
    </div>
  );
}
