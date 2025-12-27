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
export function getBlueNoiseParams(
  dimension: number,
  pixelSize: number,
  intensity: number
) {
  const gridWidth = Math.ceil(dimension / pixelSize);
  const gridHeight = Math.ceil(dimension / pixelSize);
  const maxPoints = gridWidth * gridHeight * 5;
  const numPoints = Math.max(0, Math.min(maxPoints, Math.floor((intensity / 100) * maxPoints)));
  
  return { gridWidth, gridHeight, numPoints };
}

// Render pre-generated points to canvas
export function renderBlueNoisePoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  height: number,
  pixelSize: number,
  foregroundColor: string,
  backgroundColor: string
): void {
  // Get colors
  const fg = hexToRgb(foregroundColor);
  const bg = hexToRgb(backgroundColor);
  
  // Create image data
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  // Fill background
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bg.r;
    data[i + 1] = bg.g;
    data[i + 2] = bg.b;
    data[i + 3] = 255;
  }

  // Draw points as pixels
  for (const point of points) {
    // Points are in grid coordinates (0 to gridWidth/gridHeight).
    // Snap to a grid cell so intensity maps 1:1 to filled cells.
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
