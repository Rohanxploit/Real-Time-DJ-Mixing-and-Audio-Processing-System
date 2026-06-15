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

      const segCount = 14;
      const spacing = 2;
      const segH = (height - (segCount - 1) * spacing) / segCount;
      const colW = (width - spacing) / 2;

      // Simulate slight stereo difference
      const lRms = levelRef.current;
      const rRms = Math.max(0, levelRef.current + (Math.random() * 0.05 - 0.025));

      const drawColumn = (xOffset: number, rmsVal: number) => {
        for (let i = 0; i < segCount; i++) {
          const threshold = (segCount - 1 - i) / segCount;
          const lit = rmsVal * 2.5 >= threshold;
          const y = i * (segH + spacing);

          let color = '#18181b'; // OFF color
          let glow = 'transparent';

          if (lit) {
            if (i < 2) { color = '#ef4444'; glow = 'rgba(239, 68, 68, 0.5)'; }      // Red
            else if (i < 5) { color = '#eab308'; glow = 'rgba(234, 179, 8, 0.5)'; } // Yellow
            else { color = '#22c55e'; glow = 'rgba(34, 197, 94, 0.5)'; }            // Green
          }

          ctx.fillStyle = color;
          ctx.shadowColor = lit ? glow : 'transparent';
          ctx.shadowBlur = lit ? 8 : 0;
          ctx.beginPath();
          ctx.roundRect(xOffset, y, colW, segH, 1);
          ctx.fill();
        }
      };

      drawColumn(0, lRms);
      drawColumn(colW + spacing, rRms);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="w-12 flex flex-col items-center justify-center bg-zinc-950/80 p-2 rounded border border-zinc-800 shadow-inner">
      <canvas
        ref={canvasRef}
        width={32}
        height={160}
        className="w-full"
        aria-label="Master VU meter"
      />
    </div>
  );
}
