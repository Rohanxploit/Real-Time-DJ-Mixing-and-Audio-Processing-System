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
    <div className="w-80 bg-gradient-to-b from-[#111113] to-[#0a0a0c] rounded-xl border-2 border-zinc-800/80 p-5 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] backdrop-blur-xl relative overflow-hidden">
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-xl" />

      <h2 className="text-[10px] font-black tracking-[0.3em] text-center text-zinc-500 mb-6 bg-zinc-900/50 py-1.5 rounded-full border border-zinc-800/50 mx-4 shadow-inner">
        NEXUS MIXER
      </h2>

      <div className="flex flex-1 gap-6 justify-center relative z-10">
        <Channel id="A" label="CH A" accentClass="accent-cyan-500" />
        <VUMeter rms={rms} />
        <Channel id="B" label="CH B" accentClass="accent-orange-500" />
      </div>

      <div className="mt-6 mb-2">
        <SpectrumAnalyzer fft={fft} />
      </div>
      <Crossfader value={crossfader} onChange={setCrossfader} />
    </div>
  );
}
