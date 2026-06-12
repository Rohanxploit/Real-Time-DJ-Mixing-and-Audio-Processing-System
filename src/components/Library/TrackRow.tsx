import { useState } from 'react';
import { cn } from '../../lib/utils';
import AlbumThumb from './AlbumThumb';
import type { TrackData } from '../../types/deck';

interface TrackRowProps {
  track: TrackData;
  onLoadToDeck?: (deckId: 'A' | 'B', track: TrackData) => void;
}

export default function TrackRow({ track, onLoadToDeck }: TrackRowProps) {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('trackId', track.id);
    e.dataTransfer.effectAllowed = 'copy';
    setDragging(true);
  };

  return (
    <tr
      draggable={!!onLoadToDeck}
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
      className={cn(
        'border-b border-zinc-800/30 transition-colors group',
        dragging ? 'opacity-50' : 'hover:bg-zinc-800/30 cursor-pointer'
      )}
    >
      <td className="px-4 py-2">
        <AlbumThumb pictureUrl={track.pictureUrl} />
      </td>
      <td className="px-4 py-2.5 font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors max-w-[200px] truncate">
        {track.title}
      </td>
      <td className="px-4 py-2.5 text-zinc-400 max-w-[140px] truncate">
        {track.artist}
      </td>
      <td className="px-4 py-2.5 text-zinc-400 text-sm tabular-nums">
        {typeof track.bpm === 'number' ? track.bpm.toFixed(1) : track.bpm}
      </td>
      <td className="px-4 py-2.5 text-zinc-400 text-right tabular-nums">
        {track.duration}
      </td>
    </tr>
  );
}
