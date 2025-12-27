// Blue noise generation using Mitchell's best-candidate algorithm
// This creates a pattern where points are evenly distributed with no low-frequency components

interface Point {
  x: number;
  y: number;
}

// Seeded random number generator for reproducibility
function createSeededRandom(seed: number) {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Calculate squared distance between two points
function distanceSquared(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

// Find minimum distance from a point to all existing points
function minDistanceToPoints(candidate: Point, points: Point[]): number {
  if (points.length === 0) return Infinity;
  
  let minDist = Infinity;
  for (const point of points) {
    const dist = distanceSquared(candidate, point);
    if (dist < minDist) {
      minDist = dist;
    }
  }
  return Math.sqrt(minDist);
}

// Generate blue noise points using Mitchell's best-candidate algorithm
export function generateBlueNoisePoints(
  width: number,
  height: number,
  numPoints: number,
  candidatesPerPoint: number = 10,
  seed: number = 42
): Point[] {
  const random = createSeededRandom(seed);
  const points: Point[] = [];

  for (let i = 0; i < numPoints; i++) {
    let bestCandidate: Point | null = null;
    let bestDistance = -1;

    // Generate candidates and pick the one farthest from existing points
    for (let c = 0; c < candidatesPerPoint; c++) {
      const candidate: Point = {
        x: random() * width,
        y: random() * height,
      };

      const dist = minDistanceToPoints(candidate, points);
      if (dist > bestDistance) {
        bestDistance = dist;
        bestCandidate = candidate;
      }
    }

    if (bestCandidate) {
      points.push(bestCandidate);
    }
  }

  return points;
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

// Render blue noise to canvas
export function renderBlueNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number,
  foregroundColor: string,
  backgroundColor: string,
  intensity: number,
  seed: number
): void {
  // Clear canvas with background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Calculate grid dimensions
  const gridWidth = Math.ceil(width / pixelSize);
  const gridHeight = Math.ceil(height / pixelSize);
  
  // Calculate number of points based on intensity (0-100)
  // Intensity 0 = very sparse, 100 = very dense
  const maxPoints = gridWidth * gridHeight;
  const numPoints = Math.floor((intensity / 100) * maxPoints * 0.5);

  if (numPoints === 0) return;

  // Generate blue noise points
  const points = generateBlueNoisePoints(
    gridWidth,
    gridHeight,
    numPoints,
    20, // More candidates = better distribution
    seed
  );

  // Get foreground color
  const fg = hexToRgb(foregroundColor);
  
  // Create image data for faster rendering
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const bg = hexToRgb(backgroundColor);

  // Fill background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg.r;
    data[i + 1] = bg.g;
    data[i + 2] = bg.b;
    data[i + 3] = 255;
  }

  // Draw points as pixels
  for (const point of points) {
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

  ctx.putImageData(imageData, 0, 0);
}
