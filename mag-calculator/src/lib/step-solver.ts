import type { DurationsMap, SolverStep } from './types';
import { calcMAG } from './cpm-engine';

export function generateSteps(order: string[], durate: DurationsMap, rata: number, nrMunc: number): SolverStep[] {
  const sectors = order;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const steps: SolverStep[] = [];
  const result = calcMAG(order, durate, rata, nrMunc);
  const { nodes, T } = result;

  procs.forEach(p => {
    sectors.forEach(s => {
      const key = `${p}${s}`;
      const n = nodes[key];
      steps.push({
        nodeId: key,
        type: 'forward',
        values: { t: n.t, ti: n.ti, tt: n.tt },
        explanation: `${key}: start(t)=${n.t}, durată(ti)=${n.ti}, terminare(tt)=${n.t}+${n.ti}=${n.tt}`,
      });
    });
  });

  [...procs].reverse().forEach(p => {
    [...sectors].reverse().forEach(s => {
      const key = `${p}${s}`;
      const n = nodes[key];
      steps.push({
        nodeId: key,
        type: 'backward',
        values: { tm: n.tm },
        explanation: `${key}: tm=${n.tm} (T=${T})`,
      });
    });
  });

  procs.forEach(p => {
    sectors.forEach(s => {
      const key = `${p}${s}`;
      const n = nodes[key];
      steps.push({
        nodeId: key,
        type: 'reserve',
        values: { R: n.R, r: n.r },
        explanation: `${key}: R=tm-tt=${n.tm}-${n.tt}=${n.R}${n.R === 0 ? ' ★ CRITIC' : ''}, r=${n.r}`,
      });
    });
  });

  procs.forEach(p => {
    sectors.forEach(s => {
      const key = `${p}${s}`;
      if (nodes[key].isCritical) {
        steps.push({
          nodeId: key,
          type: 'critical',
          values: { isCritical: 1 },
          explanation: `${key}: R=0 → pe drumul critic`,
        });
      }
    });
  });

  return steps;
}
