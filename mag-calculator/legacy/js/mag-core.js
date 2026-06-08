// ===== MAG CORE — Logică pură (zero DOM) =====

// Returnează durata procesului p pe sectorul s
function ti(durate, p, s) {
  return durate[`${p}${s}`];
}

// Succesorii unui nod PiSj în rețeaua MAG
// 1) Continuitate brigadă: același proces pe sectorul următor
// 2) Succesori tehnologici pe același sector: P1→P2,P3 ; P2,P3→P4
function getSuccesors(p, s, sectors) {
  const si = sectors.indexOf(s);
  const succs = [];
  if (si < sectors.length - 1) succs.push({ proc: p, sec: sectors[si + 1] }); // generalizat N sectoare
  if (p === 'P1') {
    succs.push({ proc: 'P2', sec: s });
    succs.push({ proc: 'P3', sec: s });
  }
  if (p === 'P2' || p === 'P3') succs.push({ proc: 'P4', sec: s });
  return succs;
}

// Formula: start(Pi) = max k [ predEnds[k] - durată_proprie_cumulată_înainte_de_k ]
function calcStart(proc, predEnds, sectors, durate) {
  let maxVal = 0;
  let cumOwn = 0;
  sectors.forEach(s => {
    const val = predEnds[s] - cumOwn;
    if (val > maxVal) maxVal = val;
    cumOwn += ti(durate, proc, s);
  });
  return maxVal;
}

// Sectoare in ordinea data -> calculeaza MAG complet
// productivitate — parametru opțional (default 2000), backward-compatible
function calcMAG(order, durate, rata, nrMunc, productivitate) {
  productivitate = productivitate || 2000;
  const sectors = order;
  const procs = ['P1','P2','P3','P4'];
  const nodes = {};
  const numSectors = sectors.length;

  // Calculam t (start) si tt (terminare) pentru fiecare nod
  // Reguli:
  // P1: porneste la 0 pe primul sector, continuu pe celelalte
  // P2: predecesor = P1 pe acelasi sector; continuitate brigada = tt P2 pe sectorul anterior
  // P3: la fel cu P2
  // P4: predecesor = max(tt P2, tt P3) pe acelasi sector; continuitate brigada = tt P4 pe sectorul anterior

  // P1
  for (let i = 0; i < numSectors; i++) {
    const s = sectors[i];
    const key = `P1${s}`;
    let t;
    if (i === 0) {
      t = 0;
    } else {
      t = nodes[`P1${sectors[i-1]}`].tt;
    }
    const dur = ti(durate, 'P1', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // P2
  for (let i = 0; i < numSectors; i++) {
    const s = sectors[i];
    const key = `P2${s}`;
    const tech = nodes[`P1${s}`].tt;
    const cont = i > 0 ? nodes[`P2${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P2', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // P3
  for (let i = 0; i < numSectors; i++) {
    const s = sectors[i];
    const key = `P3${s}`;
    const tech = nodes[`P1${s}`].tt;
    const cont = i > 0 ? nodes[`P3${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P3', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // P4
  for (let i = 0; i < numSectors; i++) {
    const s = sectors[i];
    const key = `P4${s}`;
    const tech = Math.max(nodes[`P2${s}`].tt, nodes[`P3${s}`].tt);
    const cont = i > 0 ? nodes[`P4${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P4', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  const T = nodes[`P4${sectors[numSectors - 1]}`].tt;

  // ===== MERS ÎNAPOI CPM CORECT =====
  // tm = termen maxim de TERMINARE
  // Formula: tm(curent) = min peste succesori de [ tm(succ) - ti(succ) ]
  // Adică: cel mai târziu moment la care activitatea curentă poate termina
  // fără să întârzie startul maxim al niciunui succesor.

  procs.forEach(p => sectors.forEach(s => { nodes[`${p}${s}`].tm = undefined; }));

  const reverseTopo = [];
  ['P4', 'P3', 'P2', 'P1'].forEach(p => {
    for (let i = sectors.length - 1; i >= 0; i--) {
      reverseTopo.push({ p, s: sectors[i] });
    }
  });

  reverseTopo.forEach(({ p, s }) => {
    const key = `${p}${s}`;
    const succs = getSuccesors(p, s, sectors);
    if (succs.length === 0) {
      nodes[key].tm = T;
    } else {
      nodes[key].tm = Math.min(...succs.map(suc => {
        const sn = nodes[`${suc.proc}${suc.sec}`];
        return sn.tm - sn.ti;
      }));
    }
  });

  // ===== REZERVE, CRITIC, BUGET =====
  procs.forEach(p => sectors.forEach(s => {
    const key = `${p}${s}`;
    const n = nodes[key];
    const succs = getSuccesors(p, s, sectors);

    n.R = n.tm - n.tt;
    if (succs.length === 0) {
      n.r = T - n.tt;
    } else {
      const minTSucc = Math.min(...succs.map(suc => nodes[`${suc.proc}${suc.sec}`].t));
      n.r = minTSucc - n.tt;
    }

    n.R = Math.max(0, Number(n.R.toFixed(10)));
    n.r = Math.max(0, Number(n.r.toFixed(10)));

    n.isCritical = (n.R === 0);
    n.B = n.ti * rata;
    n.N = nrMunc;
  }));

  return { nodes, T, sectors };
}

// Calculeaza Matrice (optimizare ordini) - metoda flux continuu brigazi
function calcMatrice(order, durate) {
  const sectors = order;
  const numSectors = sectors.length;

  const starts = {};
  const ends = {};

  // P1 — cod redundant NEATINS (fix la Nivel 3)
  starts['P1'] = 0;
  let cum = 0;
  sectors.forEach(s => {
    ends[`P1${s}`] = (cum === 0 ? 0 : (cum > 0 ? cum : 0)) + ti(durate, 'P1', s);
    if (cum === 0) {
      ends[`P1${s}`] = ti(durate, 'P1', s);
    } else {
      ends[`P1${s}`] = ends[`P1${sectors[sectors.indexOf(s)-1]}`] + ti(durate, 'P1', s);
    }
    cum += ti(durate, 'P1', s);
  });

  // P2
  const predP2 = {};
  sectors.forEach(s => { predP2[s] = ends[`P1${s}`]; });
  starts['P2'] = calcStart('P2', predP2, sectors, durate);
  let prevP2 = starts['P2'];
  sectors.forEach(s => {
    ends[`P2${s}`] = prevP2 + ti(durate, 'P2', s);
    prevP2 = ends[`P2${s}`];
  });

  // P3
  const predP3 = {};
  sectors.forEach(s => { predP3[s] = ends[`P1${s}`]; });
  starts['P3'] = calcStart('P3', predP3, sectors, durate);
  let prevP3 = starts['P3'];
  sectors.forEach(s => {
    ends[`P3${s}`] = prevP3 + ti(durate, 'P3', s);
    prevP3 = ends[`P3${s}`];
  });

  // P4: predecesor = max(P2, P3) pe fiecare sector
  const predP4 = {};
  sectors.forEach(s => { predP4[s] = Math.max(ends[`P2${s}`], ends[`P3${s}`]); });
  starts['P4'] = calcStart('P4', predP4, sectors, durate);
  let prevP4 = starts['P4'];
  sectors.forEach(s => {
    ends[`P4${s}`] = prevP4 + ti(durate, 'P4', s);
    prevP4 = ends[`P4${s}`];
  });

  const T = ends[`P4${sectors[numSectors - 1]}`];
  return T;
}

function allPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  arr.forEach((el, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    allPermutations(rest).forEach(p => result.push([el, ...p]));
  });
  return result;
}

function formatCostValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '');
}

/**
 * Transformă output-ul calcMAG într-un array activities[] standardizat.
 * Consumat de Gantt, PDF, și viitoarele componente React.
 */
function buildActivities(magResult) {
  const { nodes, T, sectors } = magResult;
  const procs = ['P1','P2','P3','P4'];
  const activities = [];

  procs.forEach(p => {
    sectors.forEach(s => {
      const key = `${p}${s}`;
      const n = nodes[key];
      activities.push({
        id: key,
        process: p,
        sector: s,
        duration: n.ti,
        earlyStart: n.t,
        earlyFinish: n.tt,
        lateFinish: n.tm,
        freeSlack: n.r,
        totalSlack: n.R,
        budget: n.B,
        workers: n.N,
        isCritical: n.isCritical
      });
    });
  });

  return {
    activities,
    totalDuration: T,
    totalBudget: activities.reduce((sum, a) => sum + a.budget, 0),
    criticalPath: activities.filter(a => a.isCritical).map(a => a.id),
    sectorOrder: sectors
  };
}
