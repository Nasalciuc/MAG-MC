import type { Activity, GFMResult } from './types';

/**
 * GFM — Graficul Forței de Muncă
 * Calculează histograma muncitorilor per zi și coeficientul K.
 * K = N_max / N_med; K ≤ 2 → uniform, K > 2 → necesită aplatizare.
 */
export function calcGFM(activities: Activity[], T: number, nrMunc: number): GFMResult {
  const days = Math.ceil(T);
  const workersPerDay = new Array(days).fill(0);

  for (const act of activities) {
    const start = Math.floor(act.earlyStart);
    const end = Math.ceil(act.earlyFinish);
    for (let d = start; d < end && d < days; d++) {
      workersPerDay[d] += nrMunc;
    }
  }

  const N_max = Math.max(...workersPerDay, 0);
  const totalWorkerDays = workersPerDay.reduce((s, v) => s + v, 0);
  const N_med = days > 0 ? totalWorkerDays / days : 0;
  const K = N_med > 0 ? N_max / N_med : 0;
  const uniform = K <= 2;

  return {
    workersPerDay,
    N_max,
    N_med: Math.round(N_med * 100) / 100,
    K: Math.round(K * 100) / 100,
    uniform,
    verdict: uniform ? 'UNIFORM' : 'NEEDS_FLATTENING',
  };
}
