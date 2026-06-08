import type { HistoryEntry, DurationsMap, CalcParams } from './types';

const MAX_HISTORY = 50;

export function createHistoryManager() {
  let entries: HistoryEntry[] = [];
  let index = -1;

  return {
    push(durations: DurationsMap, params: CalcParams, sectors: string[]) {
      entries = entries.slice(0, index + 1);
      entries.push({
        durations: { ...durations },
        params: { ...params },
        sectors: [...sectors],
        timestamp: Date.now(),
      });
      if (entries.length > MAX_HISTORY) entries.shift();
      index = entries.length - 1;
    },

    undo(): HistoryEntry | null {
      if (index <= 0) return null;
      index--;
      return { ...entries[index] };
    },

    redo(): HistoryEntry | null {
      if (index >= entries.length - 1) return null;
      index++;
      return { ...entries[index] };
    },

    canUndo: () => index > 0,
    canRedo: () => index < entries.length - 1,
  };
}
