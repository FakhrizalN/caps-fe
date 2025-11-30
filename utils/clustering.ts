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
