import { useState, useRef } from 'react';
import * as mmb from 'music-metadata-browser';
import { guess } from 'web-audio-beat-detector';
import { getMixer, loadTrackToBackend } from '../lib/audioEngine';
import { TrackData, formatTime } from '../types/deck';

interface UseFileLoaderOptions {
  id: 'A' | 'B';
  onTrackLoaded: (data: TrackData) => void;
  onBpmDetected: (bpm: number) => void;
  onBeforeLoad: () => void;
  onLoaded: (buffer: AudioBuffer) => void;
  onWaveformLoad: (url: string) => void;
}

export function useFileLoader({
  id,
  onTrackLoaded,
  onBpmDetected,
  onBeforeLoad,
  onLoaded,
  onWaveformLoad,
}: UseFileLoaderOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const objectUrlsRef = useRef<string[]>([]);

  // Cleanup on unmount
  const cleanup = () => objectUrlsRef.current.forEach(URL.revokeObjectURL);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsProcessing(true);
    onBeforeLoad();

    const mixer = getMixer();
    let decodedData: AudioBuffer;

    try {
      const arrayBuffer = await file.arrayBuffer();
      decodedData =
        (await mixer.ctx?.decodeAudioData(arrayBuffer)) ??
        new AudioBuffer({ length: 1, sampleRate: 44100 });
      await loadTrackToBackend(id, file);
    } catch (err: any) {
      console.error('[Deck] Audio decode/load failed:', err);
      alert(`Could not decode or upload "${file.name}".\nReason: ${err.message}`);
      setIsProcessing(false);
      return;
    }

    onLoaded(decodedData);

    const waveUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(waveUrl);
    onWaveformLoad(waveUrl);

    // Metadata — non-fatal
    let title = file.name.replace(/\.[^/.]+$/, '');
    let artist = 'Unknown Artist';
    let pictureUrl = '';

    try {
      const meta = await mmb.parseBlob(file);
      if (meta.common.title) title = meta.common.title;
      if (meta.common.artist) artist = meta.common.artist;
      if (meta.common.picture?.length) {
        const pic = meta.common.picture[0];
        const picBlob = new Blob([pic.data], { type: pic.format });
        pictureUrl = URL.createObjectURL(picBlob);
        objectUrlsRef.current.push(pictureUrl);
      }
    } catch {
      console.warn('[Deck] Metadata parse failed — using filename as title');
    }

    // BPM detection after UI unblocks
    let detectedBpm = 0;
    try {
      await new Promise<void>((resolve) =>
        setTimeout(async () => {
          try {
            const { bpm } = await guess(decodedData);
            detectedBpm = Math.round(bpm * 10) / 10;
          } catch {
            console.warn('[Deck] BPM detection failed');
          }
          resolve();
        }, 0)
      );
    } finally {
      if (detectedBpm) onBpmDetected(detectedBpm);
    }

    onTrackLoaded({
      id: `${id}-${Date.now()}`,
      title,
      artist,
      bpm: detectedBpm || '—',
      duration: formatTime(decodedData.duration),
      pictureUrl,
    });

    setIsProcessing(false);
  };

  return { isProcessing, handleFileUpload, cleanup };
}
