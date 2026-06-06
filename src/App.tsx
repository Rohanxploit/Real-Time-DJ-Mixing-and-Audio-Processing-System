import React, { useState } from 'react';
import Deck from './components/Deck';
import Mixer from './components/Mixer';
import TrackLibrary from './components/TrackLibrary';
import { Settings, Maximize2, MonitorSpeaker } from 'lucide-react';

function App() {
  const [crossfader, setCrossfader] = useState(50);
  const [masterVolume, setMasterVolume] = useState(80);

  return (
    <div className="h-screen w-screen bg-zinc-950 flex flex-col p-4 gap-4 text-zinc-100 overflow-hidden">
      {/* Header Bar */}
      <header className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-md p-4 rounded-xl border border-zinc-800/50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center">
            <MonitorSpeaker size={18} className="text-zinc-950" />
          </div>
          <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            NEXUS MIX
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-950/50 px-4 py-2 rounded-lg border border-zinc-800/50">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Master</span>
            <input 
              type="range" 
              min="0" max="100" 
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
          <div className="flex gap-3">
            <button className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100">
              <Settings size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-100">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Mix Area */}
      <main className="flex-1 flex gap-4 min-h-0">
        {/* Deck A */}
        <Deck title="DECK A" color="cyan" />
        
        {/* Center Mixer */}
        <Mixer crossfader={crossfader} setCrossfader={setCrossfader} />
        
        {/* Deck B */}
        <Deck title="DECK B" color="blue" />
      </main>

      {/* Track Library */}
      <footer className="h-64 bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-800/50 shadow-lg overflow-hidden flex flex-col">
        <TrackLibrary />
      </footer>
    </div>
  );
}

export default App;
