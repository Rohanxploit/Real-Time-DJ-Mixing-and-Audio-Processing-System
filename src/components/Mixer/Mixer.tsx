import { useEffect, useState } from 'react';
import { getMixer } from '../../lib/audioEngine';
import Channel from './Channel';
import Crossfader from './Crossfader';
import SpectrumAnalyzer from './SpectrumAnalyzer';
import VUMeter from './VUMeter';

interface MixerProps {
  crossfader: number;
  setCrossfader: (val: number) => void;
}

function useMasterAudio() {
  const [rms, setRms] = useState(0);
  const [fft, setFft] = useState<number[]>(new Array(32).fill(0));

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/state');

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setRms(data.master_rms || 0);
          if (data.master_fft) setFft(data.master_fft);
        } catch (_) {}
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => setTimeout(connect, 1000);
    };

    connect();
    return () => { if (ws) ws.close(); };
  }, []);

  return { rms, fft };
}

export default function Mixer({ crossfader, setCrossfader }: MixerProps) {
  const { rms, fft } = useMasterAudio();

  useEffect(() => {
    getMixer().setCrossfader(crossfader);
  }, [crossfader]);

  return (
    <div className="w-64 bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4 flex flex-col shadow-lg backdrop-blur-md">
      <h2 className="text-xs font-bold tracking-widest text-center text-zinc-500 mb-4">
        MIXER
      </h2>

      <div className="flex flex-1 gap-4 justify-center">
        <Channel id="A" label="CH A" accentClass="accent-cyan-500" />
        <VUMeter rms={rms} />
        <Channel id="B" label="CH B" accentClass="accent-blue-500" />
      </div>

      <SpectrumAnalyzer fft={fft} />
      <Crossfader value={crossfader} onChange={setCrossfader} />
    </div>
  );
}
