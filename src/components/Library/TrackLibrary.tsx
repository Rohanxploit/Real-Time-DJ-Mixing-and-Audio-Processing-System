import { useMemo, useState } from 'react';
import type { TrackData } from '../../types/deck';
import LibraryToolbar from './LibraryToolbar';
import SortableHeader, { type SortKey, type SortDir } from './SortableHeader';
import TrackRow from './TrackRow';

interface TrackLibraryProps {
  tracks: TrackData[];
  onLoadToDeck?: (deckId: 'A' | 'B', track: TrackData) => void;
}

function sortTracks(tracks: TrackData[], key: SortKey, dir: SortDir): TrackData[] {
  return [...tracks].sort((a, b) => {
    if (key === 'bpm') {
      const av = typeof a.bpm === 'number' ? a.bpm : 0;
      const bv = typeof b.bpm === 'number' ? b.bpm : 0;
      return dir === 'asc' ? av - bv : bv - av;
    }

    if (key === 'duration') {
      const toSec = (s: string) => {
        const [m, sec] = String(s).split(':').map(Number);
        return (m || 0) * 60 + (sec || 0);
      };
      return dir === 'asc'
        ? toSec(String(a.duration)) - toSec(String(b.duration))
        : toSec(String(b.duration)) - toSec(String(a.duration));
    }

    const cmp = String(a[key] ?? '').localeCompare(String(b[key] ?? ''));
    return dir === 'asc' ? cmp : -cmp;
  });
}

import TrimModal from './TrimModal';

export default function TrackLibrary({ tracks, onLoadToDeck }: TrackLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showTrimModal, setShowTrimModal] = useState(false);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = q
      ? tracks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q)
        )
      : tracks;

    return sortTracks(filtered, sortKey, sortDir);
  }, [tracks, searchQuery, sortKey, sortDir]);

  return (
    <>
      <LibraryToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showDeckHints={!!onLoadToDeck}
        filteredCount={filteredAndSorted.length}
        totalCount={tracks.length}
        onTrimClick={() => setShowTrimModal(true)}
      />

      <div className="flex-1 overflow-auto" role="region" aria-label="Track library">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 bg-zinc-900/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 font-medium w-12" aria-label="Album art" />
              <SortableHeader label="Title"  sortKey="title"    currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Artist" sortKey="artist"   currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="BPM"    sortKey="bpm"      currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="w-20" />
              <SortableHeader label="Time"   sortKey="duration" currentKey={sortKey} currentDir={sortDir} onSort={handleSort} className="w-20 text-right" />
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-zinc-600 text-sm">
                  {searchQuery.trim()
                    ? 'No tracks match your search.'
                    : 'Load a track on either deck to populate the library.'}
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((track) => (
                <TrackRow key={track.id} track={track} onLoadToDeck={onLoadToDeck} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTrimModal && <TrimModal onClose={() => setShowTrimModal(false)} />}
    </>
  );
}
