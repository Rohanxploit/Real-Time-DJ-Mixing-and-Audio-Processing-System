import { Search, FolderOpen } from 'lucide-react';

interface LibraryToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showDeckHints: boolean;
  filteredCount: number;
  totalCount: number;
  onTrimClick?: () => void;
}

export default function LibraryToolbar({
  searchQuery,
  onSearchChange,
  showDeckHints,
  filteredCount,
  totalCount,
  onTrimClick,
}: LibraryToolbarProps) {
  return (
    <div className="flex items-center gap-4 p-3 border-b border-zinc-800/50 bg-zinc-950/30">
      <div className="flex gap-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors">
          <FolderOpen size={14} aria-hidden="true" />
          Library
        </button>
        <button 
          onClick={onTrimClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-600/50 to-blue-600/50 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-500/30 text-xs font-semibold text-cyan-50 transition-colors shadow-lg"
        >
          Trim Clip
        </button>
      </div>

      {showDeckHints && (
        <div className="flex gap-2 text-[10px] text-zinc-500">
          <span>Drag row →</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 font-bold">DECK A</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-blue-400 font-bold">DECK B</span>
        </div>
      )}

      <div className="flex-1 relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by title or artist…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-md py-1.5 pl-9 pr-3 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 transition-colors"
          aria-label="Search library"
        />
      </div>

      <span className="text-[10px] text-zinc-600 shrink-0">
        {filteredCount} / {totalCount} tracks
      </span>
    </div>
  );
}
