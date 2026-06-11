import { useEffect, useRef } from 'react';

interface SpectrumAnalyzerProps {
  fft: number[];
}

export default function SpectrumAnalyzer({ fft }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const fftRef = useRef<number[]>(new Array(32).fill(0));

  useEffect(() => {
    fftRef.current = fft.map((val, i) => {
      const prev = fftRef.current[i] || 0;
      return val > prev ? val * 0.8 + prev * 0.2 : val * 0.1 + prev * 0.9;
    });
  }, [fft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      if (!fftRef.current || fftRef.current.length === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      const barCount = fftRef.current.length;
      const barWidth = width / barCount - 1;

      for (let i = 0; i < barCount; i++) {
        const val = Math.min(1.0, fftRef.current[i] * 3.0);
        const barHeight = val * height;
        const x = i * (barWidth + 1);
        const y = height - barHeight;
        const hue = 200 + (i / barCount) * 100;

        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="w-full h-16 bg-zinc-950 p-1 rounded-lg border border-zinc-800 mt-2 flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={200}
        height={50}
        className="w-full h-full"
        aria-label="Spectrum Analyzer"
      />
    </div>
  );
}
