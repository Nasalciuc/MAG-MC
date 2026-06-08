// ===== MAG DOM — Funcții de citire/scriere DOM =====
// Dependință: formatCostValue() din mag-core.js

function getDurate() {
  const d = {};
  const erori = [];

  ['P1','P2','P3','P4'].forEach(p => {
    ['S1','S2','S3'].forEach(s => {
      const input = document.getElementById(`d_${p}${s}`);
      const raw = input.value.trim();
      const val = Number(raw);

      // Duratele trebuie să fie completate, întregi și >= 1.
      // Nu folosim parseInt, deoarece parseInt("2.5") ar transforma greșit valoarea în 2.
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
    alert(`⚠️ Completează toate duratele cu valori întregi ≥ 1.
Lipsesc sau sunt incorecte: ${erori.join(', ')}`);
    return null;
  }

  return d;
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
  if (!nrMuncInput || !costCalcText) return;

  const productivitate = 2000; // lei / muncitor / schimb
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
    const names = ['mag','ordine','tabel'];
    t.classList.toggle('active', names[i] === name);
  });
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
}
