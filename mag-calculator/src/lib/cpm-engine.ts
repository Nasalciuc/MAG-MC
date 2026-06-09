import type {
  DurationsMap, CalcParams, MAGNode, MAGResult,
  Activity, ActivityData, OrderResult, Successor,
  CalculationResult, NetworkEdge,
} from './types';

// --- Helpers ---

export function ti(durate: DurationsMap, p: string, s: string): number {
  return durate[`${p}${s}`];
}

export function getSuccessors(p: string, s: string, sectors: string[]): Successor[] {
  const si = sectors.indexOf(s);
  const succs: Successor[] = [];
  if (si < sectors.length - 1) succs.push({ proc: p, sec: sectors[si + 1] });
  if (p === 'P1') {
    succs.push({ proc: 'P2', sec: s });
    succs.push({ proc: 'P3', sec: s });
  }
  if (p === 'P2' || p === 'P3') succs.push({ proc: 'P4', sec: s });
  return succs;
}

export function calcStart(
  proc: string,
  predEnds: Record<string, number>,
  sectors: string[],
  durate: DurationsMap
): number {
  let maxVal = 0;
  let cumOwn = 0;
  sectors.forEach(s => {
    const val = predEnds[s] - cumOwn;
    if (val > maxVal) maxVal = val;
    cumOwn += ti(durate, proc, s);
  });
  return maxVal;
}

// --- Main CPM ---

export function calcMAG(
  order: string[],
  durate: DurationsMap,
  rata: number,
  nrMunc: number,
  _productivitate = 2000
): MAGResult {
  const sectors = order;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const nodes: Record<string, MAGNode> = {};
  const N = sectors.length;

  const makeNode = (t: number, dur: number): MAGNode => ({
    t, ti: dur, tt: t + dur, tm: 0, r: 0, R: 0, B: 0, N: 0, isCritical: false,
  });

  // P1 forward
  for (let i = 0; i < N; i++) {
    const s = sectors[i];
    const t = i === 0 ? 0 : nodes[`P1${sectors[i - 1]}`].tt;
    nodes[`P1${s}`] = makeNode(t, ti(durate, 'P1', s));
  }

  // P2, P3 forward
  for (const proc of ['P2', 'P3']) {
    for (let i = 0; i < N; i++) {
      const s = sectors[i];
      const tech = nodes[`P1${s}`].tt;
      const cont = i > 0 ? nodes[`${proc}${sectors[i - 1]}`].tt : 0;
      nodes[`${proc}${s}`] = makeNode(Math.max(tech, cont), ti(durate, proc, s));
    }
  }

  // P4 forward
  for (let i = 0; i < N; i++) {
    const s = sectors[i];
    const tech = Math.max(nodes[`P2${s}`].tt, nodes[`P3${s}`].tt);
    const cont = i > 0 ? nodes[`P4${sectors[i - 1]}`].tt : 0;
    nodes[`P4${s}`] = makeNode(Math.max(tech, cont), ti(durate, 'P4', s));
  }

  const T = nodes[`P4${sectors[N - 1]}`].tt;

  // Backward pass
  const reverseTopo: Array<{ p: string; s: string }> = [];
  for (const p of ['P4', 'P3', 'P2', 'P1']) {
    for (let i = N - 1; i >= 0; i--) reverseTopo.push({ p, s: sectors[i] });
  }

  for (const { p, s } of reverseTopo) {
    const key = `${p}${s}`;
    const succs = getSuccessors(p, s, sectors);
    nodes[key].tm = succs.length === 0
      ? T
      : Math.min(...succs.map(suc => nodes[`${suc.proc}${suc.sec}`].tm - nodes[`${suc.proc}${suc.sec}`].ti));
  }

  // Reserves, critical, budget
  for (const p of procs) {
    for (const s of sectors) {
      const key = `${p}${s}`;
      const n = nodes[key];
      const succs = getSuccessors(p, s, sectors);

      n.R = n.tm - n.tt;
      n.r = succs.length === 0
        ? T - n.tt
        : Math.min(...succs.map(suc => nodes[`${suc.proc}${suc.sec}`].t)) - n.tt;

      n.R = Math.max(0, Number(n.R.toFixed(10)));
      n.r = Math.max(0, Number(n.r.toFixed(10)));
      n.isCritical = n.R === 0;
      n.B = n.ti * rata;
      n.N = nrMunc;
    }
  }

  return { nodes, T, sectors };
}

// --- Matrice ---

export function calcMatrice(order: string[], durate: DurationsMap): number {
  const sectors = order;
  const N = sectors.length;
  const starts: Record<string, number> = {};
  const ends: Record<string, number> = {};

  // P1 — preserved redundant logic from original
  starts['P1'] = 0;
  let cum = 0;
  sectors.forEach(s => {
    ends[`P1${s}`] = (cum === 0 ? 0 : (cum > 0 ? cum : 0)) + ti(durate, 'P1', s);
    if (cum === 0) {
      ends[`P1${s}`] = ti(durate, 'P1', s);
    } else {
      ends[`P1${s}`] = ends[`P1${sectors[sectors.indexOf(s) - 1]}`] + ti(durate, 'P1', s);
    }
    cum += ti(durate, 'P1', s);
  });

  // P2
  const predP2: Record<string, number> = {};
  sectors.forEach(s => { predP2[s] = ends[`P1${s}`]; });
  starts['P2'] = calcStart('P2', predP2, sectors, durate);
  let prevP2 = starts['P2'];
  sectors.forEach(s => { ends[`P2${s}`] = prevP2 + ti(durate, 'P2', s); prevP2 = ends[`P2${s}`]; });

  // P3
  const predP3: Record<string, number> = {};
  sectors.forEach(s => { predP3[s] = ends[`P1${s}`]; });
  starts['P3'] = calcStart('P3', predP3, sectors, durate);
  let prevP3 = starts['P3'];
  sectors.forEach(s => { ends[`P3${s}`] = prevP3 + ti(durate, 'P3', s); prevP3 = ends[`P3${s}`]; });

  // P4
  const predP4: Record<string, number> = {};
  sectors.forEach(s => { predP4[s] = Math.max(ends[`P2${s}`], ends[`P3${s}`]); });
  starts['P4'] = calcStart('P4', predP4, sectors, durate);
  let prevP4 = starts['P4'];
  sectors.forEach(s => { ends[`P4${s}`] = prevP4 + ti(durate, 'P4', s); prevP4 = ends[`P4${s}`]; });

  return ends[`P4${sectors[N - 1]}`];
}

// --- Permutations ---

export function allPermutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr];
  const result: string[][] = [];
  arr.forEach((el, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    allPermutations(rest).forEach(p => result.push([el, ...p]));
  });
  return result;
}

// --- Activities builder ---

export function buildActivities(magResult: MAGResult): ActivityData {
  const { nodes, T, sectors } = magResult;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const activities: Activity[] = [];

  procs.forEach(p => {
    sectors.forEach(s => {
      const key = `${p}${s}`;
      const n = nodes[key];
      activities.push({
        id: key, process: p, sector: s,
        duration: n.ti, earlyStart: n.t, earlyFinish: n.tt,
        lateFinish: n.tm, freeSlack: n.r, totalSlack: n.R,
        budget: n.B, workers: n.N, isCritical: n.isCritical,
      });
    });
  });

  return {
    activities,
    totalDuration: T,
    totalBudget: activities.reduce((sum, a) => sum + a.budget, 0),
    criticalPath: activities.filter(a => a.isCritical).map(a => a.id),
    sectorOrder: sectors,
  };
}

// --- Critical path analysis ---

export function computeLongestCriticalChain(
  nodes: Record<string, import('./types').MAGNode>,
  sectors: string[]
): import('./types').CriticalPathInfo {
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const criticalNodes = procs.flatMap(p => sectors.map(s => `${p}${s}`))
    .filter(key => nodes[key]?.isCritical);

  const critSet = new Set(criticalNodes);

  // BFS/DFS to find all paths through critical nodes
  const adjCrit: Record<string, string[]> = {};
  criticalNodes.forEach(key => { adjCrit[key] = []; });

  criticalNodes.forEach(key => {
    const [p, s] = [key.slice(0, 2), key.slice(2)];
    const succs = getSuccessors(p, s, sectors);
    succs.forEach(({ proc, sec }) => {
      const succKey = `${proc}${sec}`;
      if (critSet.has(succKey)) adjCrit[key].push(succKey);
    });
  });

  // Find start nodes (no critical predecessor)
  const hasCritPred = new Set<string>();
  criticalNodes.forEach(key => { adjCrit[key].forEach(s => hasCritPred.add(s)); });
  const startNodes = criticalNodes.filter(k => !hasCritPred.has(k));

  // DFS to find longest chain
  let longestChain: string[] = [];
  const dfs = (node: string, path: string[]) => {
    const newPath = [...path, node];
    if (adjCrit[node].length === 0) {
      if (newPath.length > longestChain.length) longestChain = newPath;
      return;
    }
    adjCrit[node].forEach(next => dfs(next, newPath));
  };
  startNodes.forEach(s => dfs(s, []));

  // Find parallel branches — check ALL critical nodes for divergences
  const longestSet = new Set(longestChain);
  const parallelBranches: string[][] = [];
  const visited = new Set<string>();

  criticalNodes.forEach(node => {
    const critSuccs = adjCrit[node] || [];
    critSuccs.forEach(succ => {
      if (!longestSet.has(succ) && !visited.has(succ)) {
        const branch: string[] = [];
        let cur: string | undefined = succ;
        while (cur && !visited.has(cur)) {
          visited.add(cur);
          branch.push(cur);
        const nexts: string[] = (adjCrit[cur] || []).filter(n => !visited.has(n));
          cur = nexts[0];
        }
        if (branch.length > 0) parallelBranches.push(branch);
      }
    });
  });

  return {
    allCriticalNodes: criticalNodes,
    longestChain,
    parallelCriticalBranches: parallelBranches,
  };
}

// --- Network edges ---

export function buildNetworkEdges(sectors: string[]): NetworkEdge[] {
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const edges: NetworkEdge[] = [];

  procs.forEach(p => {
    sectors.forEach((s, si) => {
      if (si < sectors.length - 1)
        edges.push({ from: `${p}${s}`, to: `${p}${sectors[si + 1]}`, type: 'continuity' });
      if (p === 'P1') {
        edges.push({ from: `P1${s}`, to: `P2${s}`, type: 'technology' });
        edges.push({ from: `P1${s}`, to: `P3${s}`, type: 'technology' });
      }
      if (p === 'P2' || p === 'P3')
        edges.push({ from: `${p}${s}`, to: `P4${s}`, type: 'technology' });
    });
  });

  return edges;
}

// --- Full calculation ---

export function runCalculations(
  durate: DurationsMap,
  params: CalcParams,
  sectors: string[]
): CalculationResult {
  const { rata, nrMunc, productivitate } = params;
  const perms = allPermutations(sectors);

  const orderResults: OrderResult[] = perms
    .map(order => ({ order, T: calcMatrice(order, durate) }))
    .sort((a, b) => a.T - b.T);

  const minT = orderResults[0].T;
  const maxT = Math.max(...orderResults.map(r => r.T));

  // Cyclic rotations — pedagogical requirement UTM
  const magOrders: string[][] = [];
  for (let i = 0; i < sectors.length; i++)
    magOrders.push([...sectors.slice(i), ...sectors.slice(0, i)]);

  const magResults = magOrders.map(order =>
    calcMAG(order, durate, rata, nrMunc, productivitate)
  );

  const firstMAG = magResults[0];
  const totalBuget = Object.values(firstMAG.nodes).reduce((a, n) => a + n.B, 0);
  const critCount = Object.values(firstMAG.nodes).filter(n => n.isCritical).length;
  const optimalCount = orderResults.filter(r => r.T === minT).length;
  const activityData = buildActivities(firstMAG);

  return {
    orderResults, magOrders, magResults,
    minT, maxT, activityData, sectors,
    summary: {
      minT, maxT, firstMAGT: firstMAG.T,
      totalBuget, critCount, optimalCount,
      totalPerms: perms.length,
    },
  };
}
