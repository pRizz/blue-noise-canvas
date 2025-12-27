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
  animateRender: boolean;
  chunkSize: number;
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
  animateRender,
  chunkSize,
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

    // Cancel any previous animation
    const cancelFn = renderBlueNoisePoints(
      ctx,
      points,
      dimension,
      dimension,
      pixelSize,
      foregroundColor,
      backgroundColor,
      animateRender,
      chunkSize,
      () => {
        onCanvasReady(canvas);
      }
    );

    onPointCountChange?.(points.length);

    return () => {
      if (typeof cancelFn === 'function') {
        cancelFn();
      }
    };
  }, [points, dimension, pixelSize, foregroundColor, backgroundColor, animateRender, chunkSize, onCanvasReady, onPointCountChange]);

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
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-muted-foreground">Generating</span>
        </div>
      )}
    </div>
  );
}
