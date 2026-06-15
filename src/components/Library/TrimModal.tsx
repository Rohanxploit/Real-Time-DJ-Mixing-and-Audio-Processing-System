import { useState, useRef } from 'react';
import { Scissors, X, Upload } from 'lucide-react';

interface TrimModalProps {
  onClose: () => void;
}

export default function TrimModal({ onClose }: TrimModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(10);
  const [isTrimming, setIsTrimming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTrim = async () => {
    if (!file) return;
    setIsTrimming(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_sec', startSec.toString());
    formData.append('end_sec', endSec.toString());

    try {
      const res = await fetch('http://127.0.0.1:8000/api/library/trim', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Trimming failed');
      }

      // Download the trimmed file
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
      <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6 w-96 shadow-2xl relative">
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

        <div className="space-y-4">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-zinc-700 border-dashed rounded-lg text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors"
            >
              <Upload size={16} />
              {file ? file.name : 'Choose file...'}
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Start (seconds)</label>
              <input 
                type="number" 
                min="0"
                step="0.1"
                value={startSec}
                onChange={(e) => setStartSec(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">End (seconds)</label>
              <input 
                type="number" 
                min="0"
                step="0.1"
                value={endSec}
                onChange={(e) => setEndSec(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button 
            onClick={handleTrim}
            disabled={!file || isTrimming}
            className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all active:scale-95"
          >
            {isTrimming ? 'Processing...' : 'Trim & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}
