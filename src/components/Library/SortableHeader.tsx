import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export type SortKey = 'title' | 'artist' | 'bpm' | 'duration';
export type SortDir = 'asc' | 'desc';

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  className?: string;
  onSort: (key: SortKey) => void;
}

export default function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  className,
  onSort,
}: SortableHeaderProps) {
  const active = currentKey === sortKey;

  return (
    <th
      className={cn('px-4 py-2 font-medium cursor-pointer select-none group', className)}
      onClick={() => onSort(sortKey)}
      aria-sort={active ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="opacity-0 group-hover:opacity-50 transition-opacity">
          {active ? (
            currentDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
          ) : (
            <ChevronDown size={12} />
          )}
        </span>
        {active && (
          <span className="opacity-70">
            {currentDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </span>
        )}
      </span>
    </th>
  );
}
