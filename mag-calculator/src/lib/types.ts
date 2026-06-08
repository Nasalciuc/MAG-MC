// ===== Tipuri MAG Calculator =====

export type DurationsMap = Record<string, number>;

export interface CalcParams {
  rata: number;
  nrMunc: number;
  productivitate: number;
}

export interface MAGNode {
  t: number;
  ti: number;
  tt: number;
  tm: number;
  r: number;
  R: number;
  B: number;
  N: number;
  isCritical: boolean;
}

export interface MAGResult {
  nodes: Record<string, MAGNode>;
  T: number;
  sectors: string[];
}

export interface Activity {
  id: string;
  process: string;
  sector: string;
  duration: number;
  earlyStart: number;
  earlyFinish: number;
  lateFinish: number;
  freeSlack: number;
  totalSlack: number;
  budget: number;
  workers: number;
  isCritical: boolean;
}

export interface ActivityData {
  activities: Activity[];
  totalDuration: number;
  totalBudget: number;
  criticalPath: string[];
  sectorOrder: string[];
}

export interface OrderResult {
  order: string[];
  T: number;
}

export interface Successor {
  proc: string;
  sec: string;
}

export interface CalculationResult {
  orderResults: OrderResult[];
  magOrders: string[][];
  magResults: MAGResult[];
  minT: number;
  maxT: number;
  activityData: ActivityData;
  sectors: string[];
  summary: CalcSummary;
}

export interface CalcSummary {
  minT: number;
  maxT: number;
  firstMAGT: number;
  totalBuget: number;
  critCount: number;
  optimalCount: number;
  totalPerms: number;
}

export interface Preset {
  label: string;
  sectors: string[];
  durations: DurationsMap;
  rata: number;
  nrMunc: number;
  productivitate: number;
}

export type TabName = 'mag' | 'gantt' | 'network' | 'ordine' | 'tabel';
export type Theme = 'dark' | 'light';
export type Lang = 'ro' | 'en';

export interface ProjectData {
  version: string;
  created: string;
  app: string;
  sectors: string[];
  durate: DurationsMap;
  rata: number;
  nrMunc: number;
  productivitate: number;
  notes: string;
}

export interface NetworkEdge {
  from: string;
  to: string;
  type: 'continuity' | 'technology';
}
