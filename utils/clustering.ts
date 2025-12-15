export function kmeans5D(
  points: Array<{ x: number; y: number; z1: number; z2: number; z3: number }>,
  k: number,
  maxIter = 50
) {
  if (points.length === 0) return { centers: [], clusters: [] } as any;

  const pts = points.map((p) => [p.x, p.y, p.z1, p.z2, p.z3]);
  const centers: number[][] = [];
  const used = new Set();

  while (centers.length < Math.min(k, pts.length)) {
    const idx = Math.floor(Math.random() * pts.length);
    if (!used.has(idx)) {
      centers.push(pts[idx].slice());
      used.add(idx);
    }
  }

  const clusters = new Array(pts.length).fill(0);

  for (let it = 0; it < maxIter; it++) {
    let moved = false;

    for (let i = 0; i < pts.length; i++) {
      let best = 0;
      let bestd = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const d = distND(pts[i], centers[c]);
        if (d < bestd) {
          bestd = d;
          best = c;
        }
      }
      if (clusters[i] !== best) {
        clusters[i] = best;
        moved = true;
      }
    }

    const sums = centers.map(() => [0, 0, 0, 0, 0, 0]);
    for (let i = 0; i < pts.length; i++) {
      const c = clusters[i];
      for (let j = 0; j < 5; j++) {
        sums[c][j] += pts[i][j];
      }
      sums[c][5] += 1;
    }

    for (let c = 0; c < centers.length; c++) {
      if (sums[c][5] > 0) {
        for (let j = 0; j < 5; j++) {
          centers[c][j] = sums[c][j] / sums[c][5];
        }
      }
    }

    if (!moved) break;
  }

  return { centers, clusters, points: pts } as any;
}

function distND(a: number[], b: number[]) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// Simple K-Means for 2D PCA coordinates
export function kmeans2D(
  points: Array<{ x: number; y: number }>,
  k: number,
  maxIter = 50
): number[] {
  if (points.length === 0) return [];
  if (k >= points.length) {
    // If k >= number of points, assign each point to its own cluster
    return points.map((_, i) => i);
  }

  // Initialize centroids randomly
  const centroids: Array<{ x: number; y: number }> = [];
  const used = new Set<number>();

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * points.length);
    if (!used.has(idx)) {
      centroids.push({ x: points[idx].x, y: points[idx].y });
      used.add(idx);
    }
  }

  let clusters = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // Assign each point to nearest centroid
    for (let i = 0; i < points.length; i++) {
      let minDist = Infinity;
      let bestCluster = 0;

      for (let c = 0; c < k; c++) {
        const dx = points[i].x - centroids[c].x;
        const dy = points[i].y - centroids[c].y;
        const dist = dx * dx + dy * dy;

        if (dist < minDist) {
          minDist = dist;
          bestCluster = c;
        }
      }

      if (clusters[i] !== bestCluster) {
        clusters[i] = bestCluster;
        changed = true;
      }
    }

    if (!changed) break;

    // Update centroids
    const sums = Array.from({ length: k }, () => ({ x: 0, y: 0, count: 0 }));

    for (let i = 0; i < points.length; i++) {
      const c = clusters[i];
      sums[c].x += points[i].x;
      sums[c].y += points[i].y;
      sums[c].count += 1;
    }

    for (let c = 0; c < k; c++) {
      if (sums[c].count > 0) {
        centroids[c].x = sums[c].x / sums[c].count;
        centroids[c].y = sums[c].y / sums[c].count;
      }
    }
  }

  return clusters;
}
