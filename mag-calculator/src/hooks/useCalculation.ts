import { useMAGStore } from '../store/useMAGStore';

export function useCalculation() {
  const result = useMAGStore(s => s.result);
  return {
    result,
    isCalculated: result !== null,
    firstMAG: result?.magResults[0] ?? null,
    activityData: result?.activityData ?? null,
    summary: result?.summary ?? null,
  };
}
