import { useEffect, useRef } from 'react';

interface VUMeterProps {
  rms: number;
}

export default function VUMeter({ rms }: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const levelRef = useRef(0);

  useEffect(() => {
    levelRef.current =
      rms > levelRef.current
        ? rms * 0.8 + levelRef.current * 0.2
        : rms * 0.1 + levelRef.current * 0.9;
  }, [rms]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const segCount = 12;
      const segH = height / segCount - 1;

      for (let i = 0; i < segCount; i++) {
        const threshold = (segCount - 1 - i) / segCount;
        const lit = levelRef.current * 3.0 >= threshold;
        const y = i * (segH + 1);

        if (i < 2) {
          ctx.fillStyle = lit ? '#ef4444' : '#1f1f1f';
        } else if (i < 5) {
          ctx.fillStyle = lit ? '#f59e0b' : '#1f1f1f';
        } else {
          ctx.fillStyle = lit ? '#22c55e' : '#1f1f1f';
        }

        ctx.beginPath();
        ctx.roundRect(0, y, width, segH, 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="w-16 flex flex-col gap-0 items-center justify-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
      <canvas
        ref={canvasRef}
        width={48}
        height={144}
        className="w-full"
        aria-label="Master VU meter"
      />
    </div>
  );
}
