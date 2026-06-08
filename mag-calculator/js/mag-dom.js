// ===== MAG DOM — Funcții de citire/scriere DOM =====
// Dependință: formatCostValue() din mag-core.js

function getDurate() {
  return getDurateN(['S1','S2','S3']);
}

function getParams() {
  const rataInput = document.getElementById('rata');
  const nrMuncInput = document.getElementById('nrMunc');

  const rataRaw = rataInput.value.trim();
  const nrMuncRaw = nrMuncInput.value.trim();

  const rata = Number(rataRaw);
  const nrMunc = Number(nrMuncRaw);

  const erori = [];

  if (rataRaw === '' || !Number.isFinite(rata) || rata <= 0) {
    erori.push('rata costului');
    rataInput.style.borderColor = 'var(--red)';
  } else {
    rataInput.style.borderColor = 'var(--border)';
  }

  if (nrMuncRaw === '' || !Number.isInteger(nrMunc) || nrMunc < 1) {
    erori.push('numărul de muncitori');
    nrMuncInput.style.borderColor = 'var(--red)';
  } else {
    nrMuncInput.style.borderColor = 'var(--border)';
  }

  if (erori.length > 0) {
    alert(`⚠️ Completează corect: ${erori.join(', ')}.`);
    return null;
  }

  return { rata, nrMunc };
}

function updateCostInfo() {
  const nrMuncInput = document.getElementById('nrMunc');
  const costCalcText = document.getElementById('costCalcText');
  const prodInput = document.getElementById('productivitate');
  if (!nrMuncInput || !costCalcText) return;

  const productivitate = prodInput ? (Number(prodInput.value) || 2000) : 2000;
  const nrMunc = Number(nrMuncInput.value);

  if (!Number.isFinite(nrMunc) || nrMunc <= 0) {
    costCalcText.textContent = 'Completează numărul de muncitori pentru a calcula rata costului.';
    return;
  }

  const rataCalculata = nrMunc * productivitate / 1000;
  costCalcText.textContent = `${nrMunc} × ${productivitate} / 1000 = ${formatCostValue(rataCalculata)} mii lei/zi/proces`;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t, i) => {
    const names = ['mag','gantt','ordine','tabel'];
    t.classList.toggle('active', names[i] === name);
  });
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
}

// ---------------------------------------------------------------------------
// Dark/Light mode toggle
// ---------------------------------------------------------------------------
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('mag-theme', next);

  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
}

function loadTheme() {
  const saved = localStorage.getItem('mag-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = saved === 'dark' ? '☀️ Light' : '🌙 Dark';
  }
}

// ---------------------------------------------------------------------------
// Sectoare dinamice
// ---------------------------------------------------------------------------
function getSectors() {
  const select = document.getElementById('sectorCount');
  if (!select) return ['S1', 'S2', 'S3'];
  const count = parseInt(select.value, 10);
  const sectors = [];
  for (let i = 1; i <= count; i++) sectors.push('S' + i);
  return sectors;
}

function rebuildDurationMatrix(sectors) {
  const grid = document.getElementById('matrixGrid');
  if (!grid) return;

  const procs = ['P1', 'P2', 'P3', 'P4'];
  const labels = {
    P1: 'P1 (conducător)',
    P2: 'P2 (‖ P3, după P1)',
    P3: 'P3 (‖ P2, după P1)',
    P4: 'P4 (după P2 ȘI P3)'
  };

  let html = '<div></div>';
  sectors.forEach(s => {
    html += `<div class="header-cell">${s}</div>`;
  });

  procs.forEach(p => {
    html += `<div class="row-label">${labels[p]}</div>`;
    sectors.forEach(s => {
      const id = `d_${p}${s}`;
      const existing = document.getElementById(id);
      const val = existing ? existing.value : (p === 'P1' ? 3 : p === 'P4' ? 1 : 2);
      html += `<input type="number" id="${id}" value="${val}" min="1" max="99" aria-label="Durata ${p} pe ${s}">`;
    });
  });

  grid.style.gridTemplateColumns = `auto repeat(${sectors.length}, 1fr)`;
  grid.innerHTML = html;
}

// ---------------------------------------------------------------------------
// Citire durate generalizată (N sectoare)
// ---------------------------------------------------------------------------
function getDurateN(sectors) {
  const d = {};
  const erori = [];
  const procs = ['P1', 'P2', 'P3', 'P4'];

  procs.forEach(p => {
    sectors.forEach(s => {
      const input = document.getElementById(`d_${p}${s}`);
      if (!input) {
        erori.push(`${p}/${s} (input lipsă)`);
        d[`${p}${s}`] = NaN;
        return;
      }
      const raw = input.value.trim();
      const val = Number(raw);

      // Duratele trebuie să fie completate, întregi și >= 1.
      if (raw === '' || !Number.isInteger(val) || val < 1) {
        erori.push(`${p} / ${s}`);
        input.style.borderColor = 'var(--red)';
        d[`${p}${s}`] = NaN;
      } else {
        input.style.borderColor = 'var(--border)';
        d[`${p}${s}`] = val;
      }
    });
  });

  if (erori.length > 0) {
    alert(`⚠️ Completează toate duratele cu valori întregi ≥ 1.\nLipsesc sau sunt incorecte: ${erori.join(', ')}`);
    return null;
  }
  return d;
}

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------
function setupKeyboard() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      calculate();
    }
    if (e.target.classList.contains('tab')) {
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const idx = tabs.indexOf(e.target);
      if (e.key === 'ArrowRight' && idx < tabs.length - 1) {
        tabs[idx + 1].focus();
        tabs[idx + 1].click();
      }
      if (e.key === 'ArrowLeft' && idx > 0) {
        tabs[idx - 1].focus();
        tabs[idx - 1].click();
      }
    }
  });
}
