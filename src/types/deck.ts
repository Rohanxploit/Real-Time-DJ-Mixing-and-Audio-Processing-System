
export interface TrackData {
  id: string;
  title: string;
  artist: string;
  bpm: number | string;
  duration: string;
  pictureUrl: string;
}

export interface DeckProps {
  id: 'A' | 'B';
  title: string;
  color: 'cyan' | 'blue' | 'orange';
  onTrackLoaded: (trackData: TrackData) => void;
  onBpmDetected: (bpm: number) => void;
  targetBpm: number;
}

export const THEME = {
  cyan: {
    wave: '#22d3ee',
    bg: 'from-cyan-950/20 to-zinc-900/50',
    border: 'border-cyan-900/30',
    accent: 'text-cyan-400',
    slider: 'accent-cyan-500',
    cueActive: 'bg-cyan-500 text-zinc-950 border-cyan-400',
  },
  blue: {
    wave: '#3b82f6',
    bg: 'from-blue-950/20 to-zinc-900/50',
    border: 'border-blue-900/30',
    accent: 'text-blue-400',
    slider: 'accent-blue-500',
    cueActive: 'bg-blue-500 text-zinc-950 border-blue-400',
  },
  orange: {
    wave: '#f97316',
    bg: 'from-orange-950/20 to-zinc-900/50',
    border: 'border-orange-900/30',
    accent: 'text-orange-400',
    slider: 'accent-orange-500',
    cueActive: 'bg-orange-500 text-zinc-950 border-orange-400',
  },
} as const;

export const PITCH_MIN = -16;
export const PITCH_MAX = 16;
export const HOT_CUE_COUNT = 8;

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function pitchToPlaybackRate(pitch: number): number {
  return 1 + pitch / 100;
}
