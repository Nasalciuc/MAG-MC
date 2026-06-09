import type { MAGResult, AOAGraph, AOAEvent, AOAArc } from './types';

/**
 * Construiește Graful AOA (Activity-On-Arc) din rezultatul MAG.
 * Fiecare activitate PxSy devine un arc între 2 evenimente.
 * Arcele fictive (dummy) asigură dependențele P1→P2/P3 și P2/P3→P4.
 *
 * Numerotare evenimente:
 *   - Un eveniment per nod (P,S) pentru terminare
 *   - Eveniment start global: 0
 *   - Eveniment final global: ultim
 */
export function buildAOAGraph(magResult: MAGResult): AOAGraph {
  const { nodes, T, sectors } = magResult;
  const procs = ['P1', 'P2', 'P3', 'P4'];

  // Colectăm toate momentele unice de timp pentru a crea evenimente
  const timesSet = new Set<number>();
  timesSet.add(0);
  timesSet.add(T);

  procs.forEach(p => {
    sectors.forEach(s => {
      const n = nodes[`${p}${s}`];
      timesSet.add(n.t);
      timesSet.add(n.tt);
    });
  });

  // Sortăm timpii și creăm evenimentele
  const times = Array.from(timesSet).sort((a, b) => a - b);
  const timeToEventId: Record<number, number> = {};
  times.forEach((t, i) => { timeToEventId[t] = i; });

  // Late times pentru fiecare eveniment (din backward pass)
  const latestTimes: Record<number, number> = {};
  times.forEach(t => {
    latestTimes[timeToEventId[t]] = T; // default
  });
  procs.forEach(p => {
    sectors.forEach(s => {
      const n = nodes[`${p}${s}`];
      const eid = timeToEventId[n.t];
      // Evenimentul de start al activității are lm = tm - ti
      const lm = n.tm - n.ti;
      if (lm < latestTimes[eid]) latestTimes[eid] = lm;
    });
  });
  // Evenimentul final are lm = T
  latestTimes[timeToEventId[T]] = T;

  const events: AOAEvent[] = times.map(t => {
    const id = timeToEventId[t];
    const latest = latestTimes[id] ?? T;
    return {
      id,
      earliestTime: t,
      latestTime: latest,
      isCritical: Math.abs(t - latest) < 0.001,
    };
  });

  const arcs: AOAArc[] = [];

  procs.forEach(p => {
    sectors.forEach(s => {
      const n = nodes[`${p}${s}`];
      const fromId = timeToEventId[n.t];
      const toId = timeToEventId[n.tt];
      arcs.push({
        from: fromId,
        to: toId,
        activity: `${p}${s}`,
        duration: n.ti,
        isDummy: false,
        isCritical: n.isCritical,
      });
    });
  });

  // Arcuri fictive pentru dependențe tehnologice care nu coincid în timp
  // P1Sx termină la tt(P1Sx), P2Sx/P3Sx pornesc la t(P2Sx) ≥ tt(P1Sx)
  // Dacă t(P2Sx) > tt(P1Sx) → adăugăm arc fictiv între evenimentul tt(P1Sx) și t(P2Sx)
  sectors.forEach(s => {
    const p1tt = nodes[`P1${s}`].tt;
    for (const p of ['P2', 'P3']) {
      const pStart = nodes[`${p}${s}`].t;
      if (Math.abs(pStart - p1tt) > 0.001) {
        const fromId = timeToEventId[p1tt];
        const toId = timeToEventId[pStart];
        if (fromId !== toId && !arcs.find(a => a.from === fromId && a.to === toId && a.isDummy)) {
          arcs.push({ from: fromId, to: toId, duration: 0, isDummy: true, isCritical: false });
        }
      }
    }
    // P2/P3 → P4
    for (const p of ['P2', 'P3']) {
      const ptt = nodes[`${p}${s}`].tt;
      const p4Start = nodes[`P4${s}`].t;
      if (Math.abs(p4Start - ptt) > 0.001) {
        const fromId = timeToEventId[ptt];
        const toId = timeToEventId[p4Start];
        if (fromId !== toId && !arcs.find(a => a.from === fromId && a.to === toId && a.isDummy)) {
          arcs.push({ from: fromId, to: toId, duration: 0, isDummy: true, isCritical: false });
        }
      }
    }
  });

  return { events, arcs, T };
}
