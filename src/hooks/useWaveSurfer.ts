import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { THEME } from '../types/deck';

export function useWaveSurfer(
  color: 'cyan' | 'blue',
  isLoaded: boolean,
  onInteraction: (time: number) => void
) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const wsSeekingRef = useRef(false);
  const programmaticSeekRef = useRef(false);

  useEffect(() => {
    if (!waveformRef.current || wavesurferRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#52525b',
      progressColor: THEME[color].wave,
      cursorColor: '#f4f4f5',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 60,
      interact: true,
    });

    ws.setVolume(0);

    ws.on('interaction', () => {
      if (!isLoaded || programmaticSeekRef.current) return;
      wsSeekingRef.current = true;
      setTimeout(() => {
        onInteraction(ws.getCurrentTime());
        wsSeekingRef.current = false;
      }, 16);
    });

    wavesurferRef.current = ws;
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
    
  }, []);

  function seekTo(ratio: number) {
    if (!wavesurferRef.current) return;
    programmaticSeekRef.current = true;
    wavesurferRef.current.seekTo(Math.max(0, Math.min(1, ratio)));
    programmaticSeekRef.current = false;
  }

  function load(url: string) {
    wavesurferRef.current?.load(url);
  }

  return { waveformRef, wsSeekingRef, seekTo, load };
}
