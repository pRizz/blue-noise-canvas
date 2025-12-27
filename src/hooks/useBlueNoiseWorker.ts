import { useEffect, useRef, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

interface UseBlueNoiseWorkerOptions {
  gridWidth: number;
  gridHeight: number;
  numPoints: number;
  seed: number;
  candidatesPerPoint?: number;
}

export function useBlueNoiseWorker({
  gridWidth,
  gridHeight,
  numPoints,
  seed,
  candidatesPerPoint = 20,
}: UseBlueNoiseWorkerOptions) {
  const [points, setPoints] = useState<Point[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const pendingRequestRef = useRef<UseBlueNoiseWorkerOptions | null>(null);

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../lib/blueNoiseWorker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e: MessageEvent<Point[]>) => {
      setPoints(e.data);
      setIsGenerating(false);
      
      // Process pending request if exists
      if (pendingRequestRef.current) {
        const pending = pendingRequestRef.current;
        pendingRequestRef.current = null;
        workerRef.current?.postMessage({
          width: pending.gridWidth,
          height: pending.gridHeight,
          numPoints: pending.numPoints,
          candidatesPerPoint: pending.candidatesPerPoint,
          seed: pending.seed,
        });
        setIsGenerating(true);
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Generate points when params change
  const generate = useCallback(() => {
    if (!workerRef.current || numPoints === 0) {
      setPoints([]);
      return;
    }

    const params = { gridWidth, gridHeight, numPoints, seed, candidatesPerPoint };

    if (isGenerating) {
      // Queue the latest request, discarding any previous pending request
      pendingRequestRef.current = params;
    } else {
      workerRef.current.postMessage({
        width: gridWidth,
        height: gridHeight,
        numPoints,
        candidatesPerPoint,
        seed,
      });
      setIsGenerating(true);
    }
  }, [gridWidth, gridHeight, numPoints, seed, candidatesPerPoint, isGenerating]);

  useEffect(() => {
    generate();
  }, [gridWidth, gridHeight, numPoints, seed, candidatesPerPoint]);

  return { points, isGenerating };
}
