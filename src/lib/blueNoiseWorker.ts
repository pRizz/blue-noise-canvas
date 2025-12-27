// Blue noise Web Worker for off-main-thread computation

interface Point {
  x: number;
  y: number;
}

export type Algorithm = 'mitchell' | 'bridson';

interface WorkerMessage {
  width: number;
  height: number;
  numPoints: number;
  candidatesPerPoint: number;
  seed: number;
  algorithm: Algorithm;
}

// Seeded random number generator for reproducibility (Mulberry32)
function createSeededRandom(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
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

// ============= MITCHELL'S BEST-CANDIDATE ALGORITHM =============
// O(n²) in worst case, but uses spatial hashing to speed up
function generateMitchellPoints(
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

// ============= BRIDSON'S POISSON DISK SAMPLING =============
// O(n) expected time complexity
function generateBridsonPoints(
  width: number,
  height: number,
  numPoints: number,
  seed: number
): Point[] {
  const random = createSeededRandom(seed);
  const totalCells = width * height;
  
  if (numPoints <= 0 || width <= 0 || height <= 0) return [];
  
  // Calculate minimum distance r based on desired density
  // For n points in area A, average spacing is sqrt(A/n)
  // Poisson disk achieves ~0.7 of theoretical max density
  const targetDensity = numPoints / totalCells;
  const r = Math.sqrt(1 / (targetDensity * Math.PI * 0.7));
  
  const k = 30; // attempts per active point
  
  const cellSize = r / Math.SQRT2;
  const gridW = Math.ceil(width / cellSize);
  const gridH = Math.ceil(height / cellSize);
  
  // Store index of sample point in each grid cell, or -1 if empty
  const grid = new Int32Array(gridW * gridH).fill(-1);
  const samples: Point[] = [];
  const active: number[] = [];
  
  function gridIndex(gx: number, gy: number): number {
    return gy * gridW + gx;
  }
  
  function pointToCell(p: Point): { gx: number; gy: number } {
    return {
      gx: Math.floor(p.x / cellSize),
      gy: Math.floor(p.y / cellSize),
    };
  }
  
  function insertSample(p: Point): number {
    const idx = samples.length;
    samples.push(p);
    active.push(idx);
    const { gx, gy } = pointToCell(p);
    if (gx >= 0 && gx < gridW && gy >= 0 && gy < gridH) {
      grid[gridIndex(gx, gy)] = idx;
    }
    return idx;
  }
  
  function dist2(a: Point, b: Point): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }
  
  function isFarEnough(p: Point): boolean {
    const { gx, gy } = pointToCell(p);
    const r2 = r * r;
    const x0 = Math.max(0, gx - 2);
    const x1 = Math.min(gridW - 1, gx + 2);
    const y0 = Math.max(0, gy - 2);
    const y1 = Math.min(gridH - 1, gy + 2);
    
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const sIdx = grid[gridIndex(x, y)];
        if (sIdx === -1) continue;
        if (dist2(p, samples[sIdx]) < r2) return false;
      }
    }
    return true;
  }
  
  function randomInAnnulus(center: Point): Point {
    const u = random();
    const v = random();
    const theta = 2 * Math.PI * u;
    const r1 = r;
    const r2 = 2 * r;
    const rad = Math.sqrt((r2 * r2 - r1 * r1) * v + r1 * r1);
    return {
      x: center.x + rad * Math.cos(theta),
      y: center.y + rad * Math.sin(theta),
    };
  }
  
  function inBounds(p: Point): boolean {
    return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
  }
  
  // Start with a random initial sample
  insertSample({
    x: random() * width,
    y: random() * height,
  });
  
  while (active.length > 0 && samples.length < numPoints) {
    const ai = Math.floor(random() * active.length);
    const sIndex = active[ai];
    const s = samples[sIndex];
    
    let found = false;
    for (let attempt = 0; attempt < k; attempt++) {
      const cand = randomInAnnulus(s);
      if (!inBounds(cand)) continue;
      if (!isFarEnough(cand)) continue;
      insertSample(cand);
      found = true;
      break;
    }
    
    if (!found) {
      const last = active.pop()!;
      if (ai < active.length) active[ai] = last;
    }
  }
  
  // Snap continuous coordinates to grid cells for pixel rendering
  return samples.map(p => ({
    x: Math.floor(p.x),
    y: Math.floor(p.y),
  }));
}

// Worker message handler
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { width, height, numPoints, candidatesPerPoint, seed, algorithm } = e.data;
  
  let points: Point[];
  
  if (algorithm === 'bridson') {
    points = generateBridsonPoints(width, height, numPoints, seed);
  } else {
    points = generateMitchellPoints(width, height, numPoints, candidatesPerPoint, seed);
  }
  
  self.postMessage(points);
};
