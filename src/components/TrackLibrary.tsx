import React from 'react';
import { Search, Music, FolderOpen } from 'lucide-react';

const mockTracks = [
  { id: 1, title: 'Neon Nights', artist: 'Synthwave Dreams', bpm: 124, key: 'Am', duration: '4:15' },
  { id: 2, title: 'Deep Ocean', artist: 'Techno Marine', bpm: 126, key: 'Gm', duration: '6:30' },
  { id: 3, title: 'Acid Groove', artist: 'TB-303 Masters', bpm: 130, key: 'C', duration: '5:45' },
  { id: 4, title: 'Starlight', artist: 'Astro', bpm: 128, key: 'Fm', duration: '3:50' },
  { id: 5, title: 'City Runner', artist: 'Cyberpunk', bpm: 122, key: 'Dm', duration: '4:20' },
];

export default function TrackLibrary() {
  return (
    <>
      <div className="flex items-center gap-4 p-3 border-b border-zinc-800/50 bg-zinc-950/30">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors">
            <FolderOpen size={14} /> Browse
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800/50 hover:bg-zinc-700 text-xs font-semibold text-zinc-400 transition-colors">
            <Music size={14} /> Playlists
          </button>
        </div>
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search tracks, artists, or albums..." 
            className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 pl-9 pr-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 bg-zinc-900/50 sticky top-0">
            <tr>
              <th className="px-4 py-2 font-medium">Title</th>
              <th className="px-4 py-2 font-medium">Artist</th>
              <th className="px-4 py-2 font-medium w-20">BPM</th>
              <th className="px-4 py-2 font-medium w-20">Key</th>
              <th className="px-4 py-2 font-medium w-24 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {mockTracks.map((track) => (
              <tr key={track.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 cursor-pointer group transition-colors">
                <td className="px-4 py-2.5 font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">{track.title}</td>
                <td className="px-4 py-2.5 text-zinc-400">{track.artist}</td>
                <td className="px-4 py-2.5 text-zinc-400">{track.bpm}</td>
                <td className="px-4 py-2.5 text-zinc-500">{track.key}</td>
                <td className="px-4 py-2.5 text-zinc-400 text-right">{track.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
