import { useState, useEffect } from 'react';
import Deck from './components/Deck/Deck';
import Mixer from './components/Mixer/Mixer';
import TrackLibrary from './components/Library/TrackLibrary';
import TimelineEditor, { TimelineClip } from './components/Timeline/TimelineEditor';
import { MonitorSpeaker, Mic, Library, Hash } from 'lucide-react';
import { getMixer, startRecording, stopRecording } from './lib/audioEngine';
import { useMidi } from './lib/useMidi';
import { cn } from './lib/utils';

function App() {
  const [crossfader, setCrossfader] = useState(50);
  const [masterVolume, setMasterVolume] = useState(80);

  const [libraryTracks, setLibraryTracks] = useState<any[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);

  const [devices, setDevices] = useState<any[]>([]);
  const [masterDeviceId, setMasterDeviceId] = useState<string>('default');
  const [cueDeviceId, setCueDeviceId] = useState<string>('default');

  const [bpmA, setBpmA] = useState<number>(0);
  const [bpmB, setBpmB] = useState<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState<string>('mix.wav');

  const [showPadNumbers, setShowPadNumbers] = useState(true);

  // MIDI state
  const handleMidi = (status: number, data1: number, data2: number) => {
    if (status >= 176 && status <= 191) {
      if (data1 === 10) {
        setCrossfader((data2 / 127) * 100);
      }
    }
  };
  const { midiConnected, midiName } = useMidi(handleMidi);

  const loadDevices = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/devices');
      const data = await res.json();
      setDevices(data.devices);
    } catch (err) {
      console.warn("Failed to fetch devices from backend:", err);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    const mixer = getMixer();
    mixer.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    const mixer = getMixer();
    mixer.setMasterOutputDevice(masterDeviceId).catch(() => { });
  }, [masterDeviceId]);

  useEffect(() => {
    const mixer = getMixer();
    mixer.setCueOutputDevice(cueDeviceId).catch(() => { });
  }, [cueDeviceId]);

  const handleTrackLoaded = (deckId: 'A' | 'B', trackData: any) => {
    if (deckId === 'A') {
      setBpmA(Number(trackData.bpm) || 0);
    } else {
      setBpmB(Number(trackData.bpm) || 0);
    }

    // Parse duration string like "3:45"
    let durationSeconds = 120;
    if (typeof trackData.duration === 'string') {
      const parts = trackData.duration.split(':');
      if (parts.length === 2) {
        durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }

    // Add visual representation to timeline
    setTimelineClips(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        file_path: trackData.title,
        start_time: 0,
        duration: durationSeconds,
        track_index: deckId === 'A' ? 0 : 1,
        title: trackData.title
      }
    ]);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const res = await stopRecording();
      if (res.status === 'ok') {
        const url = `http://127.0.0.1:8000/api/recording/download/${res.filename}`;
        try {
          const blobRes = await fetch(url);
          const blob = await blobRes.blob();
          const localUrl = URL.createObjectURL(blob);
          setDownloadUrl(localUrl);
          setDownloadName(res.filename);
          window.location.assign(url);
        } catch (e) {
          console.error("Failed to download recording blob:", e);
        }
      }
      setIsRecording(false);
    } else {
      await startRecording();
      setDownloadUrl(null);
      setIsRecording(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col p-2 gap-2 text-zinc-100 overflow-hidden">
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-md p-3 rounded-xl border border-zinc-800/50 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
            <MonitorSpeaker size={18} className="text-zinc-950" />
          </div>
          <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            NEXUS MIX
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {midiConnected && (
            <div className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-[10px] font-bold text-green-400">
              MIDI: {midiName}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPadNumbers(!showPadNumbers)}
              className={showPadNumbers ? 'px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 hover:bg-zinc-700 transition-colors' : 'px-2 py-1 bg-zinc-900 text-zinc-500 rounded border border-zinc-800 hover:bg-zinc-800 transition-colors'}
              title="Toggle Hot Cue Labels"
            >
              <Hash size={14} />
            </button>

            {downloadUrl && !isRecording && (
              <a
                href={downloadUrl}
                download={downloadName}
                className="text-[10px] text-cyan-400 font-bold hover:underline ml-2"
              >
                Download
              </a>
            )}
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-colors border ${isRecording
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                }`}
            >
              <Mic size={14} />
              {isRecording ? 'REC' : 'REC'}
            </button>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Master Out</span>
              <select
                value={masterDeviceId}
                onChange={e => setMasterDeviceId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded text-xs px-2 py-1 text-zinc-300 outline-none w-32 truncate"
              >
                <option value="default">System Default</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name || 'Unknown Device'}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cue Out (PFL)</span>
              <select
                value={cueDeviceId}
                onChange={e => setCueDeviceId(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded text-xs px-2 py-1 text-zinc-300 outline-none w-32 truncate"
              >
                <option value="default">System Default</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name || 'Unknown Device'}</option>)}
              </select>
            </div>
            <button onClick={loadDevices} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-400 border border-zinc-700 transition-colors" title="Refresh Devices">
              Refresh Devices
            </button>
          </div>

          <div className="flex items-center gap-3 bg-zinc-950/50 px-4 py-2 rounded-lg border border-zinc-800/50 h-full">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Master</span>
            <input
              type="range"
              min="0" max="100"
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* DJ Decks and Mixer */}
          <main className="flex-1 flex gap-4 min-w-0 min-h-0">
            <Deck id="A" title="DECK A" color="cyan" onTrackLoaded={(data) => handleTrackLoaded('A', data)} onBpmDetected={setBpmA} targetBpm={bpmB} showPadNumbers={showPadNumbers} />
            <Mixer crossfader={crossfader} setCrossfader={setCrossfader} />
            <Deck id="B" title="DECK B" color="orange" onTrackLoaded={(data) => handleTrackLoaded('B', data)} onBpmDetected={setBpmB} targetBpm={bpmA} showPadNumbers={showPadNumbers} />
          </main>
        </div>

        <TimelineEditor clips={timelineClips} setClips={setTimelineClips} />
      </div>
    </div>
  );
}

export default App;
