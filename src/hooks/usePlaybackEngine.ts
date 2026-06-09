import { useState, useRef, useEffect, useCallback } from 'react';
import { getMixer, playDeck, pauseDeck, seekDeck } from '../lib/audioEngine';
import { pitchToPlaybackRate } from '../types/deck';

interface UsePlaybackEngineOptions {
  id: 'A' | 'B';
  audioBuffer: AudioBuffer | null;
  duration: number;
  pitch: number;
  onTimeUpdate: (t: number) => void;
  onEnded: () => void;
}

export function usePlaybackEngine({
  id,
  audioBuffer,
  duration,
  pitch,
  onTimeUpdate,
  onEnded,
}: UsePlaybackEngineOptions) {
  const [isPlaying, setIsPlaying] = useState(false);

  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef(0);
  const pauseOffsetRef = useRef(0);
  const animFrameRef = useRef(0);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const tick = () => {
      const mixer = getMixer();
      const rate = pitchToPlaybackRate(pitch);
      const elapsed = (mixer.ctx.currentTime - startTimeRef.current) * rate;
      const pos = pauseOffsetRef.current + elapsed;

      if (duration > 0 && pos >= duration) {
        onTimeUpdate(duration);
        setIsPlaying(false);
        pauseOffsetRef.current = 0;
        sourceNodeRef.current = null;
        onEnded();
        return;
      }

      onTimeUpdate(pos);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, duration, pitch]);

  const stopSource = useCallback(() => {
    pauseDeck(id).catch(console.error);
    const node = sourceNodeRef.current;
    if (!node) return;
    try { node.stop(); } catch { /* already stopped */ }
    node.disconnect();
    sourceNodeRef.current = null;
  }, [id]);

  const startPlayback = useCallback((offset: number) => {
    if (!audioBuffer) return;
    seekDeck(id, offset).then(() => playDeck(id)).catch(console.error);
    const mixer = getMixer();
    startTimeRef.current = mixer.ctx?.currentTime || performance.now() / 1000;
    pauseOffsetRef.current = offset;
    setIsPlaying(true);
  }, [audioBuffer, id]);

  const pausePlayback = useCallback(() => {
    const mixer = getMixer();
    const rate = pitchToPlaybackRate(pitch);
    pauseOffsetRef.current += (mixer.ctx.currentTime - startTimeRef.current) * rate;
    stopSource();
    setIsPlaying(false);
  }, [pitch, stopSource]);

  const seek = useCallback((newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, duration));
    pauseOffsetRef.current = clamped;
    seekDeck(id, clamped).catch(console.error);
    if (isPlaying) {
      startTimeRef.current = getMixer().ctx?.currentTime || performance.now() / 1000;
    }
    return clamped;
  }, [id, isPlaying, duration]);

  const togglePlay = useCallback(() => {
    if (isPlaying) pausePlayback();
    else startPlayback(pauseOffsetRef.current);
  }, [isPlaying, pausePlayback, startPlayback]);

  return {
    isPlaying,
    pauseOffsetRef,
    stopSource,
    startPlayback,
    pausePlayback,
    seek,
    togglePlay,
  };
}
