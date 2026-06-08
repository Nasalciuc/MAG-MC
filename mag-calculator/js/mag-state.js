// ===== MAG STATE — URL sharing, localStorage, JSON export/import =====

const MAG_STORAGE_KEY = 'mag-calculator-autosave';
const MAG_VERSION = '2.0';

/**
 * Serializează starea curentă într-un URL compact.
 * Format: ?m=2.3.8-4.3.3-1.2.3-2.1.1&r=30&n=15&p=2000&s=S1.S2.S3
 */
function stateToURL(durate, params, sectors) {
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const mParts = procs.map(function(p) {
    return sectors.map(function(s) { return durate[p + s]; }).join('.');
  }).join('-');

  const searchParams = new URLSearchParams();
  searchParams.set('m', mParts);
  searchParams.set('r', params.rata);
  searchParams.set('n', params.nrMunc);
  if (params.productivitate && params.productivitate !== 2000) {
    searchParams.set('p', params.productivitate);
  }
  if (sectors.length !== 3 || sectors[0] !== 'S1' || sectors[1] !== 'S2' || sectors[2] !== 'S3') {
    searchParams.set('s', sectors.join('.'));
  }

  return window.location.pathname + '?' + searchParams.toString();
}

/**
 * Parsează URL-ul curent și returnează starea, sau null dacă nu există parametri.
 */
function stateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const m = params.get('m');
  if (!m) return null;

  try {
    const sParam = params.get('s');
    const sectors = sParam ? sParam.split('.') : ['S1', 'S2', 'S3'];
    const procs = ['P1', 'P2', 'P3', 'P4'];
    const groups = m.split('-');
    if (groups.length !== 4) return null;

    const durate = {};
    groups.forEach(function(group, pi) {
      const vals = group.split('.').map(Number);
      if (vals.length !== sectors.length) throw new Error('Sector count mismatch');
      vals.forEach(function(v, si) {
        durate[procs[pi] + sectors[si]] = v;
      });
    });

    return {
      durate: durate,
      sectors: sectors,
      rata: Number(params.get('r')) || 30,
      nrMunc: Number(params.get('n')) || 15,
      productivitate: Number(params.get('p')) || 2000
    };
  } catch (e) {
    console.warn('MAG: URL state parse error', e);
    return null;
  }
}

/**
 * Copiază URL-ul de share în clipboard.
 */
async function copyShareURL(url) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

/**
 * Salvează starea în localStorage (auto-save la fiecare calcul).
 */
function autoSave(durate, params, sectors) {
  try {
    const data = {
      version: MAG_VERSION,
      saved: new Date().toISOString(),
      sectors: sectors,
      durate: durate,
      rata: params.rata,
      nrMunc: params.nrMunc,
      productivitate: params.productivitate || 2000
    };
    localStorage.setItem(MAG_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('MAG: auto-save failed', e);
  }
}

/**
 * Încarcă starea din localStorage. Returnează null dacă nu există sau e invalid.
 */
function autoLoad() {
  try {
    const raw = localStorage.getItem(MAG_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.durate || !data.sectors) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Exportă proiectul complet ca JSON string (pentru download).
 */
function exportJSON(durate, params, sectors, notes) {
  return JSON.stringify({
    version: MAG_VERSION,
    created: new Date().toISOString(),
    app: 'MAG Calculator UTM',
    sectors: sectors,
    durate: durate,
    rata: params.rata,
    nrMunc: params.nrMunc,
    productivitate: params.productivitate || 2000,
    notes: notes || ''
  }, null, 2);
}

/**
 * Importă proiect din JSON string. Returnează obiect stare sau null pe eroare.
 */
function importJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.durate || !data.sectors) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Descarcă un string ca fișier.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType || 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
