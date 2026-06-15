import { useState, useRef, useEffect } from 'react';
import { Play, Square } from 'lucide-react';

export interface TimelineClip {
  id: string;
  file_path: string;
  start_time: number;
  duration: number;
  track_index: number;
  title: string;
}
interface TimelineEditorProps {
  clips: TimelineClip[];
  setClips: React.Dispatch<React.SetStateAction<TimelineClip[]>>;
}

export default function TimelineEditor({ clips, setClips }: TimelineEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // in seconds
  const [duration] = useState(120); // 2 minute default timeline
  
  const tracks = [0, 1, 2]; // 3 lanes
  
  const PIXELS_PER_SECOND = 10;
  
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayhead(p => p + 0.1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = (e: React.DragEvent, trackIndex: number) => {
    e.preventDefault();
    const trackData = e.dataTransfer.getData('application/json');
    if (trackData) {
      const track = JSON.parse(trackData);
      
      // Calculate start time based on drop X position
      const bounds = e.currentTarget.getBoundingClientRect();
      const dropX = e.clientX - bounds.left;
      const startTime = Math.max(0, dropX / PIXELS_PER_SECOND);
      
      let durationSeconds = 120;
      if (typeof track.duration === 'string') {
        const parts = track.duration.split(':');
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      } else if (typeof track.duration === 'number') {
        durationSeconds = track.duration;
      }

      const newClip: TimelineClip = {
        id: Math.random().toString(36).substr(2, 9),
        file_path: track.file_path,
        start_time: startTime,
        duration: durationSeconds,
        track_index: trackIndex,
        title: track.title,
      };
      
      const updatedClips = [...clips, newClip];
      setClips(updatedClips);
      syncWithBackend(updatedClips);
    }
  };

  const syncWithBackend = async (currentClips: TimelineClip[]) => {
    try {
      await fetch('http://127.0.0.1:8000/api/timeline/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clips: currentClips }),
      });
    } catch (e) {
      console.error('Failed to sync timeline', e);
    }
  };

  const togglePlayback = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/timeline/${isPlaying ? 'stop' : 'play'}`, { method: 'POST' });
      setIsPlaying(!isPlaying);
    } catch (e) {
      console.error('Playback toggle failed', e);
    }
  };

  const stopPlayback = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/timeline/stop', { method: 'POST' });
      setIsPlaying(false);
      setPlayhead(0);
    } catch (e) {
      console.error('Playback stop failed', e);
    }
  };

  return (
    <div className="h-32 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800/50 shadow-lg flex flex-col flex-shrink-0 mt-2 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-b border-zinc-800 bg-zinc-950/50 flex-shrink-0">
        <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sequencer Timeline</h2>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={togglePlayback}
            className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            {isPlaying ? <Square size={12} className="fill-current"/> : <Play size={12} className="fill-current ml-0.5" />}
          </button>
          <button 
            onClick={stopPlayback}
            className="flex items-center justify-center w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Square size={12} className="fill-current" />
          </button>
        </div>
        <div className="ml-auto text-[10px] text-zinc-500 font-mono">
          {Math.floor(playhead / 60)}:{(playhead % 60).toFixed(1).padStart(4, '0')}
        </div>
      </div>

      {/* Tracks Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-zinc-950">
        {/* Playhead Line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
          style={{ left: `${playhead * PIXELS_PER_SECOND}px` }}
        />

        <div className="min-w-max h-full flex flex-col" style={{ width: `${duration * PIXELS_PER_SECOND}px` }}>
          {/* Time ruler */}
          <div className="h-6 border-b border-zinc-800/50 flex text-[10px] text-zinc-600">
            {Array.from({ length: duration / 10 }).map((_, i) => (
              <div key={i} className="flex-none border-l border-zinc-800/50 px-1" style={{ width: `${10 * PIXELS_PER_SECOND}px` }}>
                {i * 10}s
              </div>
            ))}
          </div>

          {/* Lanes */}
          {tracks.map(trackIndex => (
            <div 
              key={trackIndex}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, trackIndex)}
              className="flex-1 border-b border-zinc-800/30 relative hover:bg-zinc-900/30 transition-colors"
            >
              {clips.filter(c => c.track_index === trackIndex).map(clip => {
                // Generate a pseudo-random waveform based on the clip ID
                const seed = clip.id.charCodeAt(0) || 1;
                const numBars = Math.max(10, Math.floor(clip.duration * PIXELS_PER_SECOND / 4));
                const bars = Array.from({ length: numBars }).map((_, i) => {
                  const height = 20 + Math.abs(Math.sin((i + seed) * 0.3) * 60) + Math.abs(Math.cos(i * 0.7) * 20);
                  return Math.min(100, height);
                });

                return (
                  <div 
                    key={clip.id}
                    className="absolute top-1 bottom-1 bg-zinc-800/80 border border-zinc-700/80 rounded flex items-center overflow-hidden group cursor-pointer"
                    style={{ 
                      left: `${clip.start_time * PIXELS_PER_SECOND}px`,
                      width: `${clip.duration * PIXELS_PER_SECOND}px`
                    }}
                  >
                    {/* Background Waveform Visual */}
                    <div className="absolute inset-0 flex items-center justify-between px-1 opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none gap-[1px]">
                      {bars.map((h, i) => (
                        <div key={i} className="w-1 bg-cyan-400 rounded-full" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    {/* Title Overlay */}
                    <div className="absolute inset-x-0 bottom-0 px-2 py-0.5 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[9px] font-bold text-cyan-100 truncate block">{clip.title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
