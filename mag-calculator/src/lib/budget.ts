import type { BudgetBreakdown, BudgetConfig } from './types';

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  materialeRatio: 0.40,
  masiniRatio: 0.10,
  indirecteRatio: 0.125,
  profitRatio: 0.06,
};

/**
 * Descompune bugetul unei activități în categorii.
 * Salariu = B (dat de engine); materiale și mașini = proporții din salariu.
 * Indirecte = % din totalul direct; profit = % din totalul producție.
 */
export function calcBudgetBreakdown(
  B: number,
  config: BudgetConfig = DEFAULT_BUDGET_CONFIG
): BudgetBreakdown {
  const salariu = B;
  const materiale = Math.round(salariu * config.materialeRatio * 100) / 100;
  const masini = Math.round(salariu * config.masiniRatio * 100) / 100;
  const directe = Math.round((salariu + materiale + masini) * 100) / 100;
  const indirecte = Math.round(directe * config.indirecteRatio * 100) / 100;
  const totalProductie = Math.round((directe + indirecte) * 100) / 100;
  const profit = Math.round(totalProductie * config.profitRatio * 100) / 100;
  const total = Math.round((totalProductie + profit) * 100) / 100;

  return { salariu, materiale, masini, directe, indirecte, totalProductie, profit, total };
}
