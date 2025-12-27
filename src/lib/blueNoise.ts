// Blue noise generation utilities

interface Point {
  x: number;
  y: number;
}

// Convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

// Calculate generation parameters
// minSpacingPx: minimum distance between points in pixels
export function getBlueNoiseParams(
  dimension: number,
  pixelSize: number,
  minSpacingPx: number
) {
  const gridWidth = Math.ceil(dimension / pixelSize);
  const gridHeight = Math.ceil(dimension / pixelSize);
  const totalCells = gridWidth * gridHeight;
  
  // Convert pixel spacing to grid units
  const spacingInGridUnits = minSpacingPx / pixelSize;
  
  // Estimate max points based on Poisson disk packing (~60% efficiency)
  // Area per point ≈ π * (r/2)² for Poisson disk
  const areaPerPoint = Math.PI * Math.pow(spacingInGridUnits / 2, 2);
  const estimatedPoints = Math.floor(totalCells / Math.max(areaPerPoint, 0.1));
  const numPoints = Math.max(1, Math.min(totalCells * 5, estimatedPoints));
  
  return { gridWidth, gridHeight, numPoints };
}

// Render pre-generated points to canvas with optional chunked animation
export function renderBlueNoisePoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
  pixelSize: number,
  foregroundColor: string,
  backgroundColor: string,
  animated: boolean = false,
  chunkSize: number = 25,
  onComplete?: () => void
): (() => void) | void {
  const fg = hexToRgb(foregroundColor);
  const bg = hexToRgb(backgroundColor);

  // Create base image data with background
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg.r;
    data[i + 1] = bg.g;
    data[i + 2] = bg.b;
    data[i + 3] = 255;
  }

  if (!animated || points.length === 0) {
    // Immediate render
    for (const point of points) {
      drawPoint(data, point, width, height, pixelSize, fg);
    }
    ctx.putImageData(imageData, 0, 0);
    onComplete?.();
    return;
  }

  // Animated chunked render
  let currentIndex = 0;
  let cancelled = false;

  function renderNextChunk() {
    if (cancelled) return;

    const endIndex = Math.min(currentIndex + chunkSize, points.length);
    
    for (let i = currentIndex; i < endIndex; i++) {
      drawPoint(data, points[i], width, height, pixelSize, fg);
    }
    
    ctx.putImageData(imageData, 0, 0);
    currentIndex = endIndex;

    if (currentIndex < points.length) {
      requestAnimationFrame(renderNextChunk);
    } else {
      onComplete?.();
    }
  }

  requestAnimationFrame(renderNextChunk);

  // Return cancel function
  return () => {
    cancelled = true;
  };
}

function drawPoint(
  data: Uint8ClampedArray,
  point: Point,
  width: number,
  height: number,
  pixelSize: number,
  fg: { r: number; g: number; b: number }
) {
  const startX = Math.floor(point.x) * pixelSize;
  const startY = Math.floor(point.y) * pixelSize;

  for (let py = 0; py < pixelSize && startY + py < height; py++) {
    for (let px = 0; px < pixelSize && startX + px < width; px++) {
      const x = startX + px;
      const y = startY + py;
      const idx = (y * width + x) * 4;
      
      data[idx] = fg.r;
      data[idx + 1] = fg.g;
      data[idx + 2] = fg.b;
      data[idx + 3] = 255;
    }
  }
}
