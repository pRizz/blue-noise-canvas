import { useEffect, useRef, useCallback } from 'react';
import { renderBlueNoise } from '@/lib/blueNoise';

interface BlueNoiseCanvasProps {
  dimension: number;
  pixelSize: number;
  foregroundColor: string;
  backgroundColor: string;
  intensity: number;
  seed: number;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export function BlueNoiseCanvas({
  dimension,
  pixelSize,
  foregroundColor,
  backgroundColor,
  intensity,
  seed,
  onCanvasReady,
}: BlueNoiseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderBlueNoise(
      ctx,
      dimension,
      dimension,
      pixelSize,
      foregroundColor,
      backgroundColor,
      intensity,
      seed
    );

    onCanvasReady(canvas);
  }, [dimension, pixelSize, foregroundColor, backgroundColor, intensity, seed, onCanvasReady]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className="canvas-container transition-glow">
      <canvas
        ref={canvasRef}
        width={dimension}
        height={dimension}
        className="block max-w-full h-auto"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
