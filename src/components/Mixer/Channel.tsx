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

import VerticalSlider from './VerticalSlider';

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
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex gap-3 p-1.5 bg-[#18181b] rounded-lg border border-zinc-800 shadow-inner">
        <VerticalSlider label="HI"  value={state.eqHigh} onChange={(v) => update({ eqHigh: v })} accentClass={accentClass} height={70} />
        <VerticalSlider label="MID" value={state.eqMid}  onChange={(v) => update({ eqMid: v })} accentClass={accentClass} height={70} />
        <VerticalSlider label="LOW" value={state.eqLow}  onChange={(v) => update({ eqLow: v })} accentClass={accentClass} height={70} />
      </div>

      <div className="flex gap-3 w-full justify-center">
        <div className="p-2 bg-[#18181b] rounded-lg border border-zinc-800 shadow-inner flex flex-col justify-end">
          <VerticalSlider
            label="FILTER"
            height={90}
            value={state.filter}
            onChange={(v) => update({ filter: v })}
            accentClass="accent-purple-500"
          />
        </div>

        <div className="p-2 bg-[#18181b] rounded-lg border border-zinc-800 shadow-inner flex flex-col justify-end">
          <VerticalSlider
            label={label}
            height={90}
            value={state.volume}
            onChange={(v) => update({ volume: v })}
            accentClass={accentClass}
          />
        </div>
      </div>
    </div>
  );
}
