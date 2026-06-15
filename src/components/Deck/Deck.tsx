import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { getMixer, setDeckPitch, setDeckLoop, setDeckFX } from '../../lib/audioEngine';

import DeckHeader from './DeckHeader';
import WaveformArea from './WaveformArea';
import HotCues from './HotCues';
import TransportControls from './TransportControls';
import PitchSlider from './PitchSlider';
import FxSection from './FxSection';

import { useWaveSurfer } from '../../hooks/useWaveSurfer';
import { usePlaybackEngine } from '../../hooks/usePlaybackEngine';
import { useFileLoader } from '../../hooks/useFileLoader';

import {
  DeckProps,
  TrackData,
  THEME,
  PITCH_MIN,
  PITCH_MAX,
  HOT_CUE_COUNT,
  pitchToPlaybackRate,
} from '../../types/deck';

export type { TrackData };

export default function Deck({ id, title, color, onTrackLoaded, onBpmDetected, targetBpm }: DeckProps) {
  const theme = THEME[color];
  const fileInputRef = useRef<HTMLInputElement>(null);

 
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trackName] = useState('No track loaded');
  const [artistName] = useState('—');
  const [localBpm, setLocalBpm] = useState(0);


  const [pitch, setPitch] = useState(0);
  const [isCueOn, setIsCueOn] = useState(false);
  const [hotCues, setHotCues] = useState<(number | null)[]>(Array(HOT_CUE_COUNT).fill(null));
  const [loopIn, setLoopIn] = useState<number | null>(null);
  const [loopOut, setLoopOut] = useState<number | null>(null);
  const [loopActive, setLoopActive] = useState(false);
  const [distFx, setDistFx] = useState(0);
  const [delayFx, setDelayFx] = useState(0);


  useEffect(() => { setDeckPitch(id, pitchToPlaybackRate(pitch)).catch(console.error); }, [pitch, id]);
  useEffect(() => { setDeckLoop(id, loopIn, loopOut, loopActive).catch(console.error); }, [loopIn, loopOut, loopActive, id]);
  useEffect(() => { setDeckFX(id, delayFx, distFx).catch(console.error); }, [delayFx, distFx, id]);


  const { waveformRef, wsSeekingRef, seekTo: wsSeeekTo, load: wsLoad } = useWaveSurfer(
    color,
    isLoaded,
    (t) => { seek(t); }
  );

  
  const { isPlaying, pauseOffsetRef, stopSource, seek, togglePlay } = usePlaybackEngine({
    id,
    audioBuffer,
    duration,
    pitch,
    onTimeUpdate: (t) => {
      setCurrentTime(t);
      if (!wsSeekingRef.current && duration > 0) wsSeeekTo(t / duration);
    },
    onEnded: () => setCurrentTime(duration),
  });


  const handleSeek = useCallback((val: number) => {
    const t = seek(val);
    setCurrentTime(t);
    if (duration > 0) wsSeeekTo(val / duration);
  }, [seek, duration]);

  const handleRestart = useCallback(() => {
    handleSeek(0);
  }, [handleSeek]);

  const handleHotCue = useCallback((index: number) => {
    if (!isLoaded) return;
    if (hotCues[index] !== null) {
      handleSeek(hotCues[index]!);
    } else {
      setHotCues((prev) => { const next = [...prev]; next[index] = currentTime; return next; });
    }
  }, [isLoaded, hotCues, currentTime, handleSeek]);

  const toggleCue = useCallback(() => {
    const newState = !isCueOn;
    setIsCueOn(newState);
    const mixer = getMixer();
    const channel = id === 'A' ? mixer.channelA : mixer.channelB;
    channel.setCueEnabled(newState);
  }, [isCueOn, id]);

  const handleSync = useCallback(() => {
    if (!localBpm || !targetBpm) return;
    const required = ((targetBpm / localBpm) - 1) * 100;
    setPitch(Math.max(PITCH_MIN, Math.min(PITCH_MAX, required)));
  }, [localBpm, targetBpm]);


  const { isProcessing, handleFileUpload, cleanup } = useFileLoader({
    id,
    onTrackLoaded,
    onBpmDetected: (bpm) => { setLocalBpm(bpm); onBpmDetected(bpm); },
    onBeforeLoad: () => {
      if (isPlaying) { stopSource(); }
      pauseOffsetRef.current = 0;
      setCurrentTime(0);
      setHotCues(Array(HOT_CUE_COUNT).fill(null));
      setPitch(0);
      setIsLoaded(false);
    },
    onLoaded: (buffer) => {
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setIsLoaded(true);
    },
    onWaveformLoad: wsLoad,
  });

  useEffect(() => () => cleanup(), []);


  return (
    <div className={cn('flex-1 rounded-xl border-2 flex flex-col p-4 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] bg-gradient-to-b from-[#111113] to-[#0a0a0c] backdrop-blur-xl relative overflow-hidden', theme.border)}>
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-t-xl" />
      <input ref={fileInputRef} type="file" accept="audio/mpeg,audio/wav,audio/flac" className="hidden" onChange={handleFileUpload} />

      <DeckHeader
        title={title}
        trackName={isProcessing ? 'Analysing…' : trackName}
        artistName={artistName}
        currentTime={currentTime}
        duration={duration}
        localBpm={localBpm}
        accentClass={theme.accent}
        onLoadClick={() => fileInputRef.current?.click()}
      />

      <WaveformArea
        waveformRef={waveformRef as React.RefObject<HTMLDivElement>}
        currentTime={currentTime}
        duration={duration}
        isLoaded={isLoaded}
        sliderClass={theme.slider}
        onSeek={handleSeek}
      />

      <div className="flex-1 flex gap-4">
        <div className="flex-1 flex flex-col justify-end gap-4">
          <HotCues hotCues={hotCues} isLoaded={isLoaded} cueActiveClass={theme.cueActive} onCueClick={handleHotCue} />

          <div className="flex gap-2 bg-[#111113] p-2 rounded-lg border border-zinc-800 shadow-inner">
            <button onClick={() => setLoopIn(currentTime)} disabled={!isLoaded} className="flex-1 py-1.5 text-[10px] font-black tracking-wider rounded-md bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-300 border border-zinc-600 shadow-sm disabled:opacity-30 active:scale-95 transition-all">IN</button>
            <button onClick={() => { if (loopIn !== null && currentTime > loopIn) { setLoopOut(currentTime); setLoopActive(true); } }} disabled={!isLoaded || loopIn === null} className="flex-1 py-1.5 text-[10px] font-black tracking-wider rounded-md bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-300 border border-zinc-600 shadow-sm disabled:opacity-30 active:scale-95 transition-all">OUT</button>
            <button onClick={() => setLoopActive(!loopActive)} disabled={!isLoaded || loopIn === null || loopOut === null} className={cn('flex-1 py-1.5 text-[10px] font-black tracking-wider rounded-md border shadow-sm disabled:opacity-30 active:scale-95 transition-all', loopActive ? theme.cueActive : 'bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-300 border-zinc-600')}>LOOP</button>
          </div>

          <TransportControls isPlaying={isPlaying} isLoaded={isLoaded} isCueOn={isCueOn} onRestart={handleRestart} onToggleCue={toggleCue} onTogglePlay={togglePlay} />
        </div>

        <div className="flex gap-2">
          <FxSection distFx={distFx} delayFx={delayFx} onDistChange={setDistFx} onDelayChange={setDelayFx} />
          <PitchSlider pitch={pitch} isLoaded={isLoaded} targetBpm={targetBpm} localBpm={localBpm} sliderClass={theme.slider} onPitchChange={setPitch} onSync={handleSync} />
        </div>
      </div>
    </div>
  );
}
