// ===== MAG APP — Orchestrare =====
// Dependințe (în ordine): mag-core.js, mag-render.js, mag-dom.js

function runCalculations(durate, params) {
  const { rata, nrMunc } = params;

  const sectors = ['S1','S2','S3'];
  const perms = allPermutations(sectors);

  // Calculeaza toate ordinile (Matrice)
  const orderResults = perms.map(order => {
    const T = calcMatrice(order, durate);
    return { order, T };
  });
  orderResults.sort((a, b) => a.T - b.T);
  const minT = orderResults[0].T;

  // Rotații ciclice UTM (123, 231, 312) — NU sunt top-3 optime din Matrice.
  // Cerință pedagogică a cursului UTM Management în Construcții.
  const magOrders = [
    ['S1','S2','S3'],
    ['S2','S3','S1'],
    ['S3','S1','S2']
  ];
  const magResults = magOrders.map(order => calcMAG(order, durate, rata, nrMunc));

  const optimalOrders = orderResults.filter(r => r.T === minT);
  const firstMAG = magResults[0];
  const totalBuget = Object.values(firstMAG.nodes).reduce((a, n) => a + n.B, 0);
  const critCount = Object.values(firstMAG.nodes).filter(n => n.isCritical).length;
  const maxT = Math.max(...orderResults.map(r => r.T));

  return {
    orderResults,
    magOrders,
    magResults,
    summary: {
      minT,
      maxT,
      firstMAGT: firstMAG.T,
      totalBuget,
      critCount,
      optimalCount: optimalOrders.length
    }
  };
}

function renderResults(data) {
  const { orderResults, magOrders, magResults, summary } = data;
  const { minT, maxT, firstMAGT, totalBuget, critCount, optimalCount } = summary;

  document.getElementById('summaryCards').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Durată optimă (Matrice)</div>
      <div class="stat-value">${minT}</div>
      <div class="stat-unit">zile</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Durată MAG (S1→S2→S3)</div>
      <div class="stat-value">${firstMAGT}</div>
      <div class="stat-unit">zile</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Buget total proiect</div>
      <div class="stat-value">${totalBuget}</div>
      <div class="stat-unit">mii lei</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ordini optime (Matrice)</div>
      <div class="stat-value">${optimalCount}</div>
      <div class="stat-unit">din 6 permutări</div>
    </div>
    <div class="stat-card critical-stat">
      <div class="stat-label">Activități critice (MAG)</div>
      <div class="stat-value">${critCount}</div>
      <div class="stat-unit">din 12 activități</div>
    </div>
  `;

  // MAG grids
  document.getElementById('magGrids').innerHTML = magResults.map((r, i) =>
    renderMAGGrid(r, magOrders[i].join('→'))
  ).join('');

  // Orders table
  document.getElementById('ordersContent').innerHTML = `
    <div class="formula-box">
      <span>start(Pi)</span> = max peste k : [ sfârşit_predecesor(k) − durată_proprie_cumulată_înainte_de_k ]<br>
      P4 pe fiecare sector: predecesor = <span>max(sfârşit P2, sfârşit P3)</span> pe acel sector
    </div>
    <div class="orders-table-wrap">
      <table class="orders-table">
        <thead>
          <tr>
            <th>#</th>
            <th>T (zile)</th>
            <th>Ordinea sectoarelor</th>
            <th>vs. optim</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${orderResults.map((r, i) => `
            <tr class="${r.T === minT ? 'optimal-row' : ''}">
              <td>${i+1}</td>
              <td>${r.T}</td>
              <td>${r.order.join(' → ')}</td>
              <td>${r.T === minT ? '—' : `+${r.T - minT} zile`}</td>
              <td>${r.T === minT ? '<span class="opt-badge">✓ OPTIM</span>' : (r.T === maxT ? '✗ Cel mai slab' : '~ Suboptim')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Tabel parametri
  document.getElementById('tabelContent').innerHTML = `
    <h3 style="font-size:1rem; color:var(--accent2); margin-bottom:0.8rem;">Parametri MAG — Ordinea S1→S2→S3</h3>
    ${renderTabelParametri(magResults[0])}
    <h3 style="font-size:1rem; color:var(--accent2); margin: 1.5rem 0 0.8rem;">Parametri MAG — Ordinea S2→S3→S1</h3>
    ${renderTabelParametri(magResults[1])}
    <h3 style="font-size:1rem; color:var(--accent2); margin: 1.5rem 0 0.8rem;">Parametri MAG — Ordinea S3→S1→S2</h3>
    ${renderTabelParametri(magResults[2])}
  `;

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function calculate() {
  var durate = getDurate();
  if (!durate) return;
  var params = getParams();
  if (!params) return;
  renderResults(runCalculations(durate, params));
}

// Auto-calculeaza la incarcare cu valorile default (V11)
window.addEventListener('load', function() {
  updateCostInfo();
  document.getElementById('nrMunc').addEventListener('input', updateCostInfo);
  calculate();
});
