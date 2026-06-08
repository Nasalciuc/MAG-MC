import type { Preset } from './types';

export const MAG_PRESETS: Record<string, Preset> = {
  'anexa2b': {
    label: 'Anexa 2b (implicit)',
    sectors: ['S1', 'S2', 'S3'],
    durations: { P1S1: 2, P1S2: 3, P1S3: 8, P2S1: 4, P2S2: 3, P2S3: 3, P3S1: 1, P3S2: 2, P3S3: 3, P4S1: 2, P4S2: 1, P4S3: 1 },
    rata: 30, nrMunc: 15, productivitate: 2000,
  },
  'exemplu_manual': {
    label: 'Exemplu din manual',
    sectors: ['S1', 'S2', 'S3'],
    durations: { P1S1: 3, P1S2: 2, P1S3: 5, P2S1: 2, P2S2: 4, P2S3: 2, P3S1: 3, P3S2: 1, P3S3: 4, P4S1: 1, P4S2: 2, P4S3: 3 },
    rata: 25, nrMunc: 12, productivitate: 2000,
  },
  'durate_egale': {
    label: 'Durate egale (test)',
    sectors: ['S1', 'S2', 'S3'],
    durations: { P1S1: 3, P1S2: 3, P1S3: 3, P2S1: 2, P2S2: 2, P2S3: 2, P3S1: 2, P3S2: 2, P3S3: 2, P4S1: 1, P4S2: 1, P4S3: 1 },
    rata: 30, nrMunc: 15, productivitate: 2000,
  },
  '4_sectoare': {
    label: '4 Sectoare (avansat)',
    sectors: ['S1', 'S2', 'S3', 'S4'],
    durations: { P1S1: 2, P1S2: 3, P1S3: 4, P1S4: 2, P2S1: 3, P2S2: 2, P2S3: 3, P2S4: 1, P3S1: 1, P3S2: 2, P3S3: 2, P3S4: 3, P4S1: 2, P4S2: 1, P4S3: 1, P4S4: 2 },
    rata: 30, nrMunc: 15, productivitate: 2000,
  },
};

export const getPresetKeys = (): string[] => Object.keys(MAG_PRESETS);

export const getPreset = (key: string): Preset | null => MAG_PRESETS[key] ?? null;
