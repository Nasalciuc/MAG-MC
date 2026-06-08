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
  if (si < 2) succs.push({ proc: p, sec: sectors[si + 1] });
  if (p === 'P1') {
    succs.push({ proc: 'P2', sec: s });
    succs.push({ proc: 'P3', sec: s });
  }
  if (p === 'P2' || p === 'P3') succs.push({ proc: 'P4', sec: s });
  return succs;
}

// Formula: start(Pi) = max k [ predEnds[k] - durată_proprie_cumulată_înainte_de_k ]
function calcStart(proc, predEnds, sectors, durate) {
  // formula: start = max over all sectors k of [ predEnds[k] - cumulative_own_before_k ]
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
function calcMAG(order, durate, rata, nrMunc) {
  // order = ['S1','S2','S3'] sau alta permutare
  const sectors = order; // [sec1, sec2, sec3]
  const procs = ['P1','P2','P3','P4'];

  // nodes: dict cu t, ti, tt, tm, r, R, B, N, isCritical
  const nodes = {};

  // Calculam t (start) si tt (terminare) pentru fiecare nod
  // Reguli:
  // P1: porneste la 0 pe primul sector, continuu pe celelalte
  // P2: predecesor = P1 pe acelasi sector; continuitate brigada = tt P2 pe sectorul anterior
  // P3: la fel cu P2
  // P4: predecesor = max(tt P2, tt P3) pe acelasi sector; continuitate brigada = tt P4 pe sectorul anterior

  // P1
  for (let i = 0; i < 3; i++) {
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
  for (let i = 0; i < 3; i++) {
    const s = sectors[i];
    const key = `P2${s}`;
    // constrangere tehnologica: dupa P1 pe acelasi sector
    const tech = nodes[`P1${s}`].tt;
    // constrangere continuitate brigada: dupa P2 pe sectorul anterior
    const cont = i > 0 ? nodes[`P2${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P2', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // P3
  for (let i = 0; i < 3; i++) {
    const s = sectors[i];
    const key = `P3${s}`;
    const tech = nodes[`P1${s}`].tt;
    const cont = i > 0 ? nodes[`P3${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P3', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // P4
  for (let i = 0; i < 3; i++) {
    const s = sectors[i];
    const key = `P4${s}`;
    const tech = Math.max(nodes[`P2${s}`].tt, nodes[`P3${s}`].tt);
    const cont = i > 0 ? nodes[`P4${sectors[i-1]}`].tt : 0;
    const t = Math.max(tech, cont);
    const dur = ti(durate, 'P4', s);
    nodes[key] = { t, ti: dur, tt: t + dur };
  }

  // Durata totala
  const T = nodes[`P4${sectors[2]}`].tt;

  // ===== MERS ÎNAPOI CPM CORECT =====
  // tm = termen maxim de TERMINARE
  // Formula: tm(curent) = min peste succesori de [ tm(succ) - ti(succ) ]
  // Adică: cel mai târziu moment la care activitatea curentă poate termina
  // fără să întârzie startul maxim al niciunui succesor.

  procs.forEach(p => sectors.forEach(s => { nodes[`${p}${s}`].tm = undefined; }));

  // Parcurgere topologică inversă: P4→P3→P2→P1, sectoare invers
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
      // Nodul final P4 pe ultimul sector
      nodes[key].tm = T;
    } else {
      // tm_curent = min( tm_succ - ti_succ ) pentru fiecare succesor
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

    // Rezerva totală R = tm - tt
    n.R = n.tm - n.tt;

    // Rezerva liberă r = min(t_real_succesor) - tt
    if (succs.length === 0) {
      n.r = T - n.tt;
    } else {
      const minTSucc = Math.min(...succs.map(suc => nodes[`${suc.proc}${suc.sec}`].t));
      n.r = minTSucc - n.tt;
    }

    // Elimină erori numerice de virgulă mobilă
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

  // Start P1 = 0, flux continuu
  const starts = {};
  const ends = {};

  // P1
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

  const T = ends[`P4${sectors[2]}`];
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
