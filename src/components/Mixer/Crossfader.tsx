interface CrossfaderProps {
  value: number;
  onChange: (val: number) => void;
}

export default function Crossfader({ value, onChange }: CrossfaderProps) {
  return (
    <div className="mt-6 pt-4 border-t border-zinc-800/50">
      <div className="relative w-full h-8 bg-zinc-950 rounded flex items-center px-2">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-700" />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none bg-transparent accent-zinc-300 relative z-10"
          aria-label="Crossfader"
        />
      </div>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[9px] text-zinc-600 font-bold">A</span>
        <span className="text-[9px] text-zinc-600 font-bold">B</span>
      </div>
    </div>
  );
}
