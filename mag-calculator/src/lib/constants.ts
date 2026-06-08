export const PROCESSES = ['P1', 'P2', 'P3', 'P4'] as const;
export const DEFAULT_SECTORS = ['S1', 'S2', 'S3'];
export const MAG_VERSION = '3.0';
export const MAG_STORAGE_KEY = 'mag-calculator-autosave';

export const GANTT_COLORS: Record<string, { fill: string; stroke: string }> = {
  P1: { fill: '#3b82f6', stroke: '#2563eb' },
  P2: { fill: '#22c55e', stroke: '#16a34a' },
  P3: { fill: '#f59e0b', stroke: '#d97706' },
  P4: { fill: '#a855f7', stroke: '#9333ea' },
};

export const PARAM_TOOLTIPS: Record<string, string> = {
  t: 'Termenul minim de începere (Early Start) — cel mai devreme moment la care activitatea poate începe',
  ti: 'Durata activității în zile',
  tt: 'Termenul minim de terminare (Early Finish) = t + ti',
  tm: 'Termenul maxim de terminare (Late Finish) — cel mai târziu moment fără a întârzia proiectul',
  r: 'Rezerva liberă — cât poate întârzia fără a afecta succesorii direcți',
  R: 'Rezerva totală — cât poate întârzia fără a afecta durata totală. R=0 → activitate critică!',
  B: 'Bugetul activității = durata × rata costului (mii lei)',
  N: 'Numărul de muncitori per brigadă',
};

export const PROCESS_LABELS: Record<string, string> = {
  P1: 'P1 (conducător)',
  P2: 'P2 (‖ P3, după P1)',
  P3: 'P3 (‖ P2, după P1)',
  P4: 'P4 (după P2 ȘI P3)',
};
