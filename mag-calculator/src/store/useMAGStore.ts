import { create } from 'zustand';
import type { DurationsMap, CalcParams, CalculationResult, TabName, Theme, Lang } from '../lib/types';
import { runCalculations } from '../lib/cpm-engine';
import { MAG_PRESETS } from '../lib/presets';
import { DEFAULT_SECTORS, MAG_STORAGE_KEY, MAG_VERSION } from '../lib/constants';
import { createHistoryManager } from '../lib/history';

const historyMgr = createHistoryManager();

interface MAGState {
  sectors: string[];
  durations: DurationsMap;
  params: CalcParams;
  selectedPreset: string;
  result: CalculationResult | null;
  activeTab: TabName;
  theme: Theme;
  lang: Lang;

  setSectors: (sectors: string[]) => void;
  setDuration: (key: string, value: number) => void;
  setParam: <K extends keyof CalcParams>(key: K, value: CalcParams[K]) => void;
  loadPreset: (key: string) => void;
  calculate: (celebrate?: boolean) => void;
  setActiveTab: (tab: TabName) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  importState: (durations: DurationsMap, params: CalcParams, sectors: string[]) => void;
  undo: () => void;
  redo: () => void;
}

const getInitialTheme = (): Theme =>
  typeof window !== 'undefined' ? ((localStorage.getItem('mag-theme') as Theme) || 'dark') : 'dark';

const getInitialLang = (): Lang =>
  typeof window !== 'undefined' ? ((localStorage.getItem('mag-lang') as Lang) || 'ro') : 'ro';

function getInitialState(): Pick<MAGState, 'sectors' | 'durations' | 'params' | 'selectedPreset'> {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(MAG_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.version === MAG_VERSION && data.sectors && data.durate) {
          return {
            sectors: data.sectors,
            durations: data.durate,
            params: { rata: data.rata ?? 30, nrMunc: data.nrMunc ?? 15, productivitate: data.productivitate ?? 2000 },
            selectedPreset: 'custom',
          };
        }
      }
    } catch { /* ignore */ }
  }
  return {
    sectors: DEFAULT_SECTORS,
    durations: { ...MAG_PRESETS['anexa2b'].durations },
    params: { rata: 30, nrMunc: 15, productivitate: 2000 },
    selectedPreset: 'anexa2b',
  };
}

export const useMAGStore = create<MAGState>((set, get) => ({
  ...getInitialState(),
  result: null,
  activeTab: 'mag',
  theme: getInitialTheme(),
  lang: getInitialLang(),

  setSectors: (sectors) => {
    const { durations, params, sectors: prevSectors } = get();
    historyMgr.push({ ...durations }, { ...params }, [...prevSectors]);
    const procs = ['P1', 'P2', 'P3', 'P4'];
    const newDurations: DurationsMap = {};
    procs.forEach(p => {
      sectors.forEach(s => {
        const key = `${p}${s}`;
        newDurations[key] = key in durations ? durations[key] : (p === 'P4' ? 1 : p === 'P1' ? 3 : 2);
      });
    });
    set({ sectors, durations: newDurations });
    setTimeout(() => get().calculate(), 0);
  },

  setDuration: (key, value) => {
    const { durations, params, sectors } = get();
    historyMgr.push({ ...durations }, { ...params }, [...sectors]);
    set(state => ({ durations: { ...state.durations, [key]: value } }));
  },

  setParam: (key, value) => {
    const { durations, params, sectors } = get();
    historyMgr.push({ ...durations }, { ...params }, [...sectors]);
    set(state => {
      const newParams = { ...state.params, [key]: value };
      if (key === 'nrMunc' || key === 'productivitate') {
        newParams.rata = (newParams.nrMunc * newParams.productivitate) / 1000;
      }
      return { params: newParams };
    });
  },

  loadPreset: (key) => {
    const { durations, params, sectors } = get();
    historyMgr.push({ ...durations }, { ...params }, [...sectors]);
    const preset = MAG_PRESETS[key];
    if (!preset) return;
    set({
      selectedPreset: key,
      sectors: [...preset.sectors],
      durations: { ...preset.durations },
      params: { rata: preset.rata, nrMunc: preset.nrMunc, productivitate: preset.productivitate },
    });
    setTimeout(() => get().calculate(), 0);
  },

  calculate: (celebrate = false) => {
    const { durations, params, sectors } = get();
    try {
      const result = runCalculations(durations, params, sectors);
      set({ result });
      if (celebrate) {
        import('../lib/confetti').then(({ fireConfetti }) => {
          const canvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
          if (canvas) fireConfetti(canvas);
        });
        import('../lib/sounds').then(({ playSuccess }) => playSuccess());
      }
      try {
        localStorage.setItem(MAG_STORAGE_KEY, JSON.stringify({
          version: MAG_VERSION, saved: new Date().toISOString(),
          sectors, durate: durations,
          rata: params.rata, nrMunc: params.nrMunc, productivitate: params.productivitate,
        }));
      } catch { /* ignore */ }
    } catch (err) {
      console.error('Calculation error:', err);
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('mag-theme', next);
    set({ theme: next });
  },

  toggleLang: () => {
    const next = get().lang === 'ro' ? 'en' : 'ro';
    localStorage.setItem('mag-lang', next);
    set({ lang: next });
  },

  importState: (durations, params, sectors) => {
    const s = get();
    historyMgr.push({ ...s.durations }, { ...s.params }, [...s.sectors]);
    set({ durations, params, sectors, selectedPreset: 'custom' });
    setTimeout(() => get().calculate(), 0);
  },

  undo: () => {
    const entry = historyMgr.undo();
    if (!entry) return;
    set({ durations: { ...entry.durations }, params: { ...entry.params }, sectors: [...entry.sectors], selectedPreset: 'custom' });
    get().calculate();
  },

  redo: () => {
    const entry = historyMgr.redo();
    if (!entry) return;
    set({ durations: { ...entry.durations }, params: { ...entry.params }, sectors: [...entry.sectors], selectedPreset: 'custom' });
    get().calculate();
  },
}));
