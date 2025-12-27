// Blue noise Web Worker for off-main-thread computation

interface Point {
  x: number;
  y: number;
}

interface WorkerMessage {
  width: number;
  height: number;
  numPoints: number;
  candidatesPerPoint: number;
  seed: number;
}

// Seeded random number generator for reproducibility
function createSeededRandom(seed: number) {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Spatial hash grid for O(1) neighbor lookups instead of O(n)
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Point[]>;
  private width: number;
  private height: number;

  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  add(point: Point): void {
    const key = this.getKey(point.x, point.y);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(point);
  }

  // Get minimum distance to nearby points (checks neighboring cells only)
  getMinDistance(candidate: Point): number {
    const cx = Math.floor(candidate.x / this.cellSize);
    const cy = Math.floor(candidate.y / this.cellSize);
    
    let minDistSq = Infinity;
    
    // Check 3x3 neighborhood of cells
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const point of cell) {
            const distX = candidate.x - point.x;
            const distY = candidate.y - point.y;
            const distSq = distX * distX + distY * distY;
            if (distSq < minDistSq) {
              minDistSq = distSq;
            }
          }
        }
      }
    }
    
    return Math.sqrt(minDistSq);
  }
}

// Generate blue noise points using Mitchell's best-candidate algorithm with spatial hashing
// Returns points in grid cell coordinates (integers from 0 to width-1, 0 to height-1)
function generateBlueNoisePoints(
  width: number,
  height: number,
  numPoints: number,
  candidatesPerPoint: number,
  seed: number
): Point[] {
  const random = createSeededRandom(seed);
  const totalCells = width * height;
  
  // Track which cells are filled
  const filledCells = new Set<string>();
  const points: Point[] = [];
  
  // Cell size for spatial hashing (in grid units)
  const expectedDist = Math.sqrt(totalCells / Math.max(numPoints, 1));
  const cellSize = Math.max(expectedDist / 2, 1);
  const grid = new SpatialGrid(width, height, cellSize);

  for (let i = 0; i < numPoints && filledCells.size < totalCells; i++) {
    let bestCandidate: Point | null = null;
    let bestDistance = -1;

    // Try multiple candidates to find one that maximizes distance to existing points
    for (let c = 0; c < candidatesPerPoint; c++) {
      // Generate a random cell position
      const cellX = Math.floor(random() * width);
      const cellY = Math.floor(random() * height);
      const cellKey = `${cellX},${cellY}`;
      
      // Skip if this cell is already filled
      if (filledCells.has(cellKey)) continue;
      
      const candidate: Point = { x: cellX, y: cellY };
      const dist = points.length === 0 ? Infinity : grid.getMinDistance(candidate);
      
      if (dist > bestDistance) {
        bestDistance = dist;
        bestCandidate = candidate;
      }
    }

    // If no valid candidate found (all candidates hit filled cells), find any empty cell
    if (!bestCandidate) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const cellX = Math.floor(random() * width);
        const cellY = Math.floor(random() * height);
        const cellKey = `${cellX},${cellY}`;
        if (!filledCells.has(cellKey)) {
          bestCandidate = { x: cellX, y: cellY };
          break;
        }
      }
    }

    if (bestCandidate) {
      const cellKey = `${bestCandidate.x},${bestCandidate.y}`;
      filledCells.add(cellKey);
      points.push(bestCandidate);
      grid.add(bestCandidate);
    }
  }

  return points;
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { width, height, numPoints, candidatesPerPoint, seed } = e.data;
  
  const points = generateBlueNoisePoints(
    width,
    height,
    numPoints,
    candidatesPerPoint,
    seed
  );
  
  self.postMessage(points);
};
