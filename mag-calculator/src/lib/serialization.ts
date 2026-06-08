import type { DurationsMap, CalcParams, ProjectData } from './types';
import { MAG_VERSION } from './constants';

export function stateToURL(durate: DurationsMap, params: CalcParams, sectors: string[]): string {
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const mParts = procs.map(p => sectors.map(s => durate[`${p}${s}`]).join('.')).join('-');
  const sp = new URLSearchParams();
  sp.set('m', mParts);
  sp.set('r', String(params.rata));
  sp.set('n', String(params.nrMunc));
  if (params.productivitate !== 2000) sp.set('p', String(params.productivitate));
  if (sectors.length !== 3 || sectors.join('.') !== 'S1.S2.S3') sp.set('s', sectors.join('.'));
  return window.location.pathname + '?' + sp.toString();
}

export function stateFromURL(): Partial<ProjectData> | null {
  const sp = new URLSearchParams(window.location.search);
  const m = sp.get('m');
  if (!m) return null;
  try {
    const sectors = sp.get('s') ? sp.get('s')!.split('.') : ['S1', 'S2', 'S3'];
    const procs = ['P1', 'P2', 'P3', 'P4'];
    const groups = m.split('-');
    if (groups.length !== 4) return null;
    const durate: DurationsMap = {};
    groups.forEach((group, pi) => {
      const vals = group.split('.').map(Number);
      if (vals.length !== sectors.length) throw new Error('mismatch');
      vals.forEach((v, si) => { durate[`${procs[pi]}${sectors[si]}`] = v; });
    });
    return {
      durate, sectors,
      rata: Number(sp.get('r')) || 30,
      nrMunc: Number(sp.get('n')) || 15,
      productivitate: Number(sp.get('p')) || 2000,
    };
  } catch {
    return null;
  }
}

export async function copyShareURL(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

export function exportJSON(durate: DurationsMap, params: CalcParams, sectors: string[], notes = ''): string {
  const data: ProjectData = {
    version: MAG_VERSION,
    created: new Date().toISOString(),
    app: 'MAG Calculator UTM',
    sectors, durate,
    rata: params.rata,
    nrMunc: params.nrMunc,
    productivitate: params.productivitate,
    notes,
  };
  return JSON.stringify(data, null, 2);
}

export function importJSON(jsonString: string): Partial<ProjectData> | null {
  try {
    const data = JSON.parse(jsonString) as Partial<ProjectData>;
    if (!data.durate || !data.sectors) return null;
    return data;
  } catch {
    return null;
  }
}

export function downloadFile(content: string, filename: string, mimeType = 'application/json'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
