import { useEffect, useRef, useMemo } from 'react';
import { getBlueNoiseParams, renderBlueNoisePoints } from '@/lib/blueNoise';
import { useBlueNoiseWorker, Algorithm } from '@/hooks/useBlueNoiseWorker';

interface BlueNoiseCanvasProps {
  dimension: number;
  pixelSize: number;
  foregroundColor: string;
  backgroundColor: string;
  intensity: number;
  seed: number;
  algorithm: Algorithm;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onPointCountChange?: (count: number) => void;
}

export function BlueNoiseCanvas({
  dimension,
  pixelSize,
  foregroundColor,
  backgroundColor,
  intensity,
  seed,
  algorithm,
  onCanvasReady,
  onPointCountChange,
}: BlueNoiseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate generation parameters
  const { gridWidth, gridHeight, numPoints } = useMemo(
    () => getBlueNoiseParams(dimension, pixelSize, intensity),
    [dimension, pixelSize, intensity]
  );

  // Generate points in web worker
  const { points, isGenerating } = useBlueNoiseWorker({
    gridWidth,
    gridHeight,
    numPoints,
    seed,
    algorithm,
  });

  // Render points to canvas when they change or colors change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderBlueNoisePoints(
      ctx,
      points,
      dimension,
      dimension,
      pixelSize,
      foregroundColor,
      backgroundColor
    );

    onCanvasReady(canvas);
    onPointCountChange?.(points.length);
  }, [points, dimension, pixelSize, foregroundColor, backgroundColor, onCanvasReady, onPointCountChange]);

  return (
    <div className="canvas-container transition-glow relative">
      <canvas
        ref={canvasRef}
        width={dimension}
        height={dimension}
        className="block max-w-full h-auto"
        style={{ imageRendering: 'pixelated' }}
      />
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="text-sm font-mono text-muted-foreground animate-pulse">
            Generating...
          </div>
        </div>
      )}
    </div>
  );
}
