import { create } from 'zustand';
import type { DurationsMap, CalcParams, CalculationResult, TabName, Theme, Lang } from '../lib/types';
import { runCalculations } from '../lib/cpm-engine';
import { MAG_PRESETS } from '../lib/presets';
import { DEFAULT_SECTORS, MAG_STORAGE_KEY, MAG_VERSION } from '../lib/constants';

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
  calculate: () => void;
  setActiveTab: (tab: TabName) => void;
  toggleTheme: () => void;
  toggleLang: () => void;
  importState: (durations: DurationsMap, params: CalcParams, sectors: string[]) => void;
}

const getInitialTheme = (): Theme =>
  typeof window !== 'undefined' ? ((localStorage.getItem('mag-theme') as Theme) || 'dark') : 'dark';

const getInitialLang = (): Lang =>
  typeof window !== 'undefined' ? ((localStorage.getItem('mag-lang') as Lang) || 'ro') : 'ro';

export const useMAGStore = create<MAGState>((set, get) => ({
  sectors: DEFAULT_SECTORS,
  durations: { ...MAG_PRESETS['anexa2b'].durations },
  params: { rata: 30, nrMunc: 15, productivitate: 2000 },
  selectedPreset: 'anexa2b',
  result: null,
  activeTab: 'mag',
  theme: getInitialTheme(),
  lang: getInitialLang(),

  setSectors: (sectors) => {
    const { durations } = get();
    const procs = ['P1', 'P2', 'P3', 'P4'];
    const newDurations: DurationsMap = {};
    procs.forEach(p => {
      sectors.forEach(s => {
        const key = `${p}${s}`;
        newDurations[key] = key in durations ? durations[key] : (p === 'P4' ? 1 : p === 'P1' ? 3 : 2);
      });
    });
    set({ sectors, durations: newDurations });
  },

  setDuration: (key, value) =>
    set(state => ({ durations: { ...state.durations, [key]: value } })),

  setParam: (key, value) =>
    set(state => ({ params: { ...state.params, [key]: value } })),

  loadPreset: (key) => {
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

  calculate: () => {
    const { durations, params, sectors } = get();
    try {
      const result = runCalculations(durations, params, sectors);
      set({ result });
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
    set({ durations, params, sectors, selectedPreset: 'custom' });
    setTimeout(() => get().calculate(), 0);
  },
}));
