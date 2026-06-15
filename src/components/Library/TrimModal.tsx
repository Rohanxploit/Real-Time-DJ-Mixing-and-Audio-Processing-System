import { useState, useRef, useEffect } from 'react';
import { Scissors, X, Upload, Play, Square } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

interface TrimModalProps {
  onClose: () => void;
}

export default function TrimModal({ onClose }: TrimModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<any>(null);
  const activeRegion = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !file) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(161, 161, 170, 0.5)',
      progressColor: 'rgba(34, 211, 238, 0.8)',
      height: 100,
      cursorColor: '#22d3ee',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });

    regionsPlugin.current = wavesurfer.current.registerPlugin(RegionsPlugin.create());

    const url = URL.createObjectURL(file);
    wavesurfer.current.load(url);

    wavesurfer.current.on('decode', () => {
      const duration = wavesurfer.current?.getDuration() || 10;
      activeRegion.current = regionsPlugin.current.addRegion({
        start: duration * 0.1,
        end: duration * 0.9,
        color: 'rgba(34, 211, 238, 0.2)',
        drag: true,
        resize: true,
      });
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));

    return () => {
      wavesurfer.current?.destroy();
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePlayPreview = () => {
    if (!wavesurfer.current || !activeRegion.current) return;
    if (isPlaying) {
      wavesurfer.current.pause();
    } else {
      activeRegion.current.play();
    }
  };

  const handleTrim = async () => {
    if (!file || !activeRegion.current) return;
    setIsTrimming(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_sec', activeRegion.current.start.toString());
    formData.append('end_sec', activeRegion.current.end.toString());

    try {
      const res = await fetch('http://127.0.0.1:8000/api/library/trim', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Trimming failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Trimmed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      onClose();
    } catch (err) {
      console.error(err);
      setError('An error occurred while trimming.');
    } finally {
      setIsTrimming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6 w-[600px] shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Scissors size={20} />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">Trim Audio Clip</h2>
        </div>

        <div className="space-y-6">
          {!file && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Select Audio File</label>
              <input 
                type="file" 
                accept="audio/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 py-10 border-2 border-zinc-700 border-dashed rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:border-cyan-500/50 hover:text-zinc-200 transition-colors"
              >
                <Upload size={32} />
                <span className="font-medium">Click to choose an audio file</span>
              </button>
            </div>
          )}

          {file && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 uppercase">
                <span>{file.name}</span>
                <button 
                  onClick={() => setFile(null)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Change File
                </button>
              </div>

              {/* Waveform Container */}
              <div 
                ref={containerRef} 
                className="w-full bg-zinc-950/50 rounded-lg border border-zinc-800/50 overflow-hidden"
              />

              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={handlePlayPreview}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-sm font-semibold transition-colors"
                >
                  {isPlaying ? <Square size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Stop Preview' : 'Play Preview'}
                </button>
                <span className="text-xs text-zinc-500">Drag edges to adjust trim region</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            onClick={handleTrim}
            disabled={!file || isTrimming}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {isTrimming ? 'Processing...' : 'Trim & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
