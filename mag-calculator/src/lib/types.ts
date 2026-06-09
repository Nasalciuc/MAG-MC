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

export type TabName = 'mag' | 'gantt' | 'network' | 'ordine' | 'tabel' | 'steps' | 'whatif' | 'gfm' | 'aoa' | 'quiz';
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

// ===== NIVEL 4 TYPES =====

export interface SolverStep {
  nodeId: string;
  type: 'forward' | 'backward' | 'reserve' | 'critical';
  values: Record<string, number>;
  explanation: string;
}

export interface HistoryEntry {
  durations: DurationsMap;
  params: CalcParams;
  sectors: string[];
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  type: 'critical-path' | 'optimal-t' | 'optimal-order' | 'reserve-value' | 'budget';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ===== SPRINT 5 TYPES =====

export interface GFMResult {
  workersPerDay: number[];
  N_max: number;
  N_med: number;
  K: number;
  uniform: boolean;
  verdict: 'UNIFORM' | 'NEEDS_FLATTENING';
}

export interface BudgetBreakdown {
  salariu: number;
  materiale: number;
  masini: number;
  directe: number;
  indirecte: number;
  totalProductie: number;
  profit: number;
  total: number;
}

export interface BudgetConfig {
  materialeRatio: number;
  masiniRatio: number;
  indirecteRatio: number;
  profitRatio: number;
}

export interface AOAEvent {
  id: number;
  earliestTime: number;
  latestTime: number;
  isCritical: boolean;
}

export interface AOAArc {
  from: number;
  to: number;
  activity?: string;
  duration: number;
  isDummy: boolean;
  isCritical: boolean;
}

export interface AOAGraph {
  events: AOAEvent[];
  arcs: AOAArc[];
  T: number;
}

export interface CriticalPathInfo {
  allCriticalNodes: string[];
  longestChain: string[];
  parallelCriticalBranches: string[][];
}
