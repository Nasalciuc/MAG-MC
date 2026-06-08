// ===== MAG APP — Orchestrare v2 =====

function runCalculations(durate, params, sectors) {
  const { rata, nrMunc, productivitate } = params;
  const perms = allPermutations(sectors);

  const orderResults = perms.map(order => {
    const T = calcMatrice(order, durate);
    return { order, T };
  });
  orderResults.sort((a, b) => a.T - b.T);
  const minT = orderResults[0].T;
  const maxT = Math.max(...orderResults.map(r => r.T));

  // Rotații ciclice UTM (123, 231, 312) — NU sunt top-3 optime din Matrice.
  // Cerință pedagogică a cursului UTM Management în Construcții.
  // Generalizat pentru N sectoare: toate rotațiile ciclice.
  const magOrders = [];
  for (let i = 0; i < sectors.length; i++) {
    magOrders.push([...sectors.slice(i), ...sectors.slice(0, i)]);
  }

  const magResults = magOrders.map(order =>
    calcMAG(order, durate, rata, nrMunc, productivitate)
  );

  const firstMAG = magResults[0];
  const totalBuget = Object.values(firstMAG.nodes).reduce((a, n) => a + n.B, 0);
  const critCount = Object.values(firstMAG.nodes).filter(n => n.isCritical).length;
  const optimalOrders = orderResults.filter(r => r.T === minT);
  const activityData = buildActivities(firstMAG);

  return {
    orderResults,
    magOrders,
    magResults,
    minT,
    maxT,
    activityData,
    sectors,
    summary: {
      minT,
      maxT,
      firstMAGT: firstMAG.T,
      totalBuget,
      critCount,
      optimalCount: optimalOrders.length,
      totalPerms: perms.length
    }
  };
}

function renderResults(data) {
  const { orderResults, magOrders, magResults, minT, maxT, activityData, sectors, summary: s } = data;

  // Summary cards
  document.getElementById('summaryCards').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Durată optimă (Matrice)</div>
      <div class="stat-value">${s.minT}</div>
      <div class="stat-unit">zile</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Durată MAG (${sectors.join('→')})</div>
      <div class="stat-value">${s.firstMAGT}</div>
      <div class="stat-unit">zile</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Buget total proiect</div>
      <div class="stat-value">${s.totalBuget}</div>
      <div class="stat-unit">mii lei</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ordini optime (Matrice)</div>
      <div class="stat-value">${s.optimalCount}</div>
      <div class="stat-unit">din ${s.totalPerms} permutări</div>
    </div>
    <div class="stat-card critical-stat">
      <div class="stat-label">Activități critice (MAG)</div>
      <div class="stat-value">${s.critCount}</div>
      <div class="stat-unit">din ${sectors.length * 4} activități</div>
    </div>
  `;

  // MAG grids
  document.getElementById('magGrids').innerHTML = magResults.map((r, i) =>
    renderMAGGrid(r, magOrders[i].join('→'))
  ).join('');

  // Gantt chart
  const ganttEl = document.getElementById('ganttContent');
  if (ganttEl) {
    ganttEl.innerHTML = renderGanttSVG(activityData, { width: Math.max(ganttEl.clientWidth || 800, 600) });
  }

  // Orders table cu spark bars
  document.getElementById('ordersContent').innerHTML = `
    <div class="formula-box">
      <span>start(Pi)</span> = max peste k : [ sfârşit_predecesor(k) − durată_proprie_cumulată_înainte_de_k ]<br>
      P4 pe fiecare sector: predecesor = <span>max(sfârşit P2, sfârşit P3)</span> pe acel sector
    </div>
    <div class="orders-table-wrap">
      <table class="orders-table" role="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">T (zile)</th>
            <th scope="col">Grafic</th>
            <th scope="col">Ordinea sectoarelor</th>
            <th scope="col">vs. optim</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          ${orderResults.map((r, i) => `
            <tr class="${r.T === minT ? 'optimal-row' : ''}">
              <td>${i+1}</td>
              <td>${r.T}</td>
              <td>${renderSparkBar(r.T, minT, maxT)}</td>
              <td>${r.order.join(' → ')}</td>
              <td>${r.T === minT ? '—' : `+${r.T - minT} zile`}</td>
              <td>${r.T === minT ? '<span class="opt-badge">✓ OPTIM</span>' : (r.T === maxT ? '✗ Cel mai slab' : '~ Suboptim')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Tabel parametri — generalizat pentru N rotații ciclice
  let tabelHTML = '';
  magResults.forEach((mr, i) => {
    const marginStyle = i === 0 ? 'margin-bottom:0.8rem' : 'margin: 1.5rem 0 0.8rem';
    tabelHTML += `<h3 style="font-size:1rem; color:var(--accent2); ${marginStyle};">Parametri MAG — Ordinea ${magOrders[i].join('→')}</h3>`;
    tabelHTML += renderTabelParametri(mr);
  });
  document.getElementById('tabelContent').innerHTML = tabelHTML;

  document.getElementById('results').style.display = 'block';
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function calculate() {
  const sectors = getSectors();
  const durate = getDurateN(sectors);
  if (!durate) return;

  const params = getParams();
  if (!params) return;

  const prodInput = document.getElementById('productivitate');
  params.productivitate = prodInput ? (Number(prodInput.value) || 2000) : 2000;

  const data = runCalculations(durate, params, sectors);
  renderResults(data);

  autoSave(durate, params, sectors);

  window._lastCalcData = data;
  window._lastDurate = durate;
  window._lastParams = params;
  window._lastSectors = sectors;
}

// ===== INIT =====
window.addEventListener('load', function() {
  loadTheme();
  setupKeyboard();

  const urlState = stateFromURL();
  const savedState = autoLoad();
  const initState = urlState || savedState;

  if (initState && initState.sectors) {
    const sectorSelect = document.getElementById('sectorCount');
    if (sectorSelect) sectorSelect.value = initState.sectors.length;

    rebuildDurationMatrix(initState.sectors);

    Object.entries(initState.durate).forEach(([key, val]) => {
      const input = document.getElementById('d_' + key);
      if (input) input.value = val;
    });
    if (initState.rata) document.getElementById('rata').value = initState.rata;
    if (initState.nrMunc) document.getElementById('nrMunc').value = initState.nrMunc;
    if (initState.productivitate) {
      const prodInput = document.getElementById('productivitate');
      if (prodInput) prodInput.value = initState.productivitate;
    }
  }

  updateCostInfo();

  document.getElementById('nrMunc').addEventListener('input', updateCostInfo);

  const prodInput = document.getElementById('productivitate');
  if (prodInput) prodInput.addEventListener('input', updateCostInfo);

  const sectorSelect = document.getElementById('sectorCount');
  if (sectorSelect) {
    sectorSelect.addEventListener('change', function() {
      rebuildDurationMatrix(getSectors());
    });
  }

  // Preset selector
  const presetSelect = document.getElementById('presetSelect');
  if (presetSelect) {
    presetSelect.addEventListener('change', function() {
      const key = presetSelect.value;
      if (key === 'custom') return;
      const preset = getPreset(key);
      if (!preset) return;

      if (sectorSelect) sectorSelect.value = preset.sectors.length;
      rebuildDurationMatrix(preset.sectors);
      Object.entries(preset.durations).forEach(([k, v]) => {
        const input = document.getElementById('d_' + k);
        if (input) input.value = v;
      });
      document.getElementById('rata').value = preset.rata;
      document.getElementById('nrMunc').value = preset.nrMunc;
      if (prodInput) prodInput.value = preset.productivitate;
      updateCostInfo();
      calculate();
    });
  }

  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async function() {
      const sectors = getSectors();
      const durate = getDurateN(sectors);
      if (!durate) return;
      const params = getParams();
      if (!params) return;
      params.productivitate = prodInput ? (Number(prodInput.value) || 2000) : 2000;
      const url = window.location.origin + stateToURL(durate, params, sectors);
      const ok = await copyShareURL(url);
      shareBtn.textContent = ok ? '✅ Link copiat!' : '❌ Eroare';
      setTimeout(function() { shareBtn.textContent = '📋 Copiază link'; }, 2000);
    });
  }

  // Export PDF
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', function() {
      if (window._lastCalcData) exportPDF(window._lastCalcData);
      else alert('Calculează mai întâi pentru a exporta.');
    });
  }

  // Export JSON
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', function() {
      if (window._lastDurate && window._lastParams) {
        const json = exportJSON(window._lastDurate, window._lastParams, window._lastSectors);
        downloadFile(json, 'mag-proiect.json', 'application/json');
      } else {
        alert('Calculează mai întâi pentru a salva.');
      }
    });
  }

  // Import JSON
  const importJsonBtn = document.getElementById('importJsonBtn');
  if (importJsonBtn) {
    importJsonBtn.addEventListener('click', function() {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          const data = importJSON(ev.target.result);
          if (!data) { alert('Fișier JSON invalid.'); return; }
          if (sectorSelect) sectorSelect.value = data.sectors.length;
          rebuildDurationMatrix(data.sectors);
          Object.entries(data.durate).forEach(([k, v]) => {
            const input = document.getElementById('d_' + k);
            if (input) input.value = v;
          });
          document.getElementById('rata').value = data.rata;
          document.getElementById('nrMunc').value = data.nrMunc;
          if (prodInput) prodInput.value = data.productivitate || 2000;
          updateCostInfo();
          calculate();
        };
        reader.readAsText(file);
      });
      fileInput.click();
    });
  }

  // Theme toggle
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  calculate();
});
