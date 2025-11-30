export function arForecast(values: number[], p: number, d: number, h: number) {
  if (values.length === 0) return [];

  let series = values.slice();
  for (let i = 0; i < d; i++) {
    const diffed: number[] = [];
    for (let j = 1; j < series.length; j++)
      diffed.push(series[j] - series[j - 1]);
    series = diffed;
  }

  if (series.length <= p) return new Array(h).fill(0);

  const N = series.length - p;
  const X: number[][] = [];
  const y: number[] = [];

  for (let i = 0; i < N; i++) {
    const row: number[] = [];
    for (let j = 0; j < p; j++) row.push(series[i + p - j - 1]);
    X.push(row);
    y.push(series[i + p]);
  }

  const beta = ols(X, y);
  const preds: number[] = [];
  const seq = series.slice();

  for (let t = 0; t < h; t++) {
    let pred = 0;
    for (let j = 0; j < p; j++)
      pred += beta[j] * (seq[seq.length - 1 - j] ?? 0);
    seq.push(pred);
    preds.push(pred);
  }

  if (d > 0) {
    const inv: number[] = [];
    let last = values[values.length - 1];
    for (let v of preds) {
      last = last + v;
      inv.push(last);
    }
    return inv;
  }
  return preds;
}

function ols(X: number[][], y: number[]) {
  const p = X[0].length;
  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const Xty: number[] = Array(p).fill(0);

  for (let i = 0; i < X.length; i++) {
    for (let a = 0; a < p; a++) {
      for (let b = 0; b < p; b++) XtX[a][b] += X[i][a] * X[i][b];
      Xty[a] += X[i][a] * y[i];
    }
  }
  return solveLinearSystem(XtX, Xty);
}

function solveLinearSystem(A: number[][], b: number[]) {
  const n = A.length;
  const M: number[][] = Array.from({ length: n }, (_, i) => A[i].slice());
  const rhs = b.slice();

  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let r = i; r < n; r++)
      if (Math.abs(M[r][i]) > Math.abs(M[pivot][i])) pivot = r;

    if (i !== pivot) {
      const tmp = M[i];
      M[i] = M[pivot];
      M[pivot] = tmp;
      const t2 = rhs[i];
      rhs[i] = rhs[pivot];
      rhs[pivot] = t2;
    }

    const diag = M[i][i] || 0;
    if (Math.abs(diag) < 1e-12) return Array(n).fill(0);

    for (let c = i; c < n; c++) M[i][c] /= diag;
    rhs[i] /= diag;

    for (let r = 0; r < n; r++) {
      if (r === i) continue;
      const fac = M[r][i];
      for (let c = i; c < n; c++) M[r][c] -= fac * M[i][c];
      rhs[r] -= fac * rhs[i];
    }
  }
  return rhs;
}
