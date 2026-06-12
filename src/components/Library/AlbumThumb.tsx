import { Disc3 } from 'lucide-react';

interface AlbumThumbProps {
  pictureUrl: string;
}

export default function AlbumThumb({ pictureUrl }: AlbumThumbProps) {
  if (pictureUrl) {
    return (
      <img
        src={pictureUrl}
        alt="Album art"
        className="w-8 h-8 rounded object-cover shadow border border-zinc-700"
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center border border-zinc-700">
      <Disc3 size={14} className="text-zinc-500" aria-hidden="true" />
    </div>
  );
}
