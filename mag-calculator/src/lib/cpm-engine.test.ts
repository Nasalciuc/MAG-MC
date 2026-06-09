import { describe, it, expect } from 'vitest';
import {
  ti, getSuccessors, calcMAG, calcMatrice, allPermutations,
  buildActivities, buildNetworkEdges, runCalculations,
} from './cpm-engine';
import type { DurationsMap } from './types';

const ANEXA2B: DurationsMap = {
  P1S1: 2, P1S2: 3, P1S3: 8,
  P2S1: 4, P2S2: 3, P2S3: 3,
  P3S1: 1, P3S2: 2, P3S3: 3,
  P4S1: 2, P4S2: 1, P4S3: 1,
};

describe('ti', () => {
  it('returns correct duration', () => {
    expect(ti(ANEXA2B, 'P1', 'S1')).toBe(2);
    expect(ti(ANEXA2B, 'P3', 'S3')).toBe(3);
    expect(ti(ANEXA2B, 'P4', 'S2')).toBe(1);
  });
});

describe('getSuccessors', () => {
  const sectors = ['S1', 'S2', 'S3'];

  it('P1S1 has 3 successors', () => {
    const s = getSuccessors('P1', 'S1', sectors);
    expect(s).toHaveLength(3);
    expect(s).toEqual([
      { proc: 'P1', sec: 'S2' },
      { proc: 'P2', sec: 'S1' },
      { proc: 'P3', sec: 'S1' },
    ]);
  });

  it('P4S3 (terminal) has 0 successors', () => {
    expect(getSuccessors('P4', 'S3', sectors)).toHaveLength(0);
  });

  it('P2S2 has 2 successors', () => {
    const s = getSuccessors('P2', 'S2', sectors);
    expect(s).toHaveLength(2);
  });

  it('P1S3 has 2 successors (no continuity)', () => {
    const s = getSuccessors('P1', 'S3', sectors);
    expect(s).toHaveLength(2);
  });
});

describe('allPermutations', () => {
  it('generates 6 permutations for 3 elements', () => {
    expect(allPermutations(['S1', 'S2', 'S3'])).toHaveLength(6);
  });

  it('generates 24 permutations for 4 elements', () => {
    expect(allPermutations(['S1', 'S2', 'S3', 'S4'])).toHaveLength(24);
  });

  it('generates 2 permutations for 2 elements', () => {
    expect(allPermutations(['S1', 'S2'])).toHaveLength(2);
  });

  it('generates 1 permutation for 1 element', () => {
    expect(allPermutations(['S1'])).toEqual([['S1']]);
  });
});

describe('calcMAG — Anexa 2b S1→S2→S3', () => {
  const result = calcMAG(['S1', 'S2', 'S3'], ANEXA2B, 30, 15);

  it('T = 17', () => expect(result.T).toBe(17));

  it('6 critical activities', () => {
    const count = Object.values(result.nodes).filter(n => n.isCritical).length;
    expect(count).toBe(6);
  });

  it('total budget = 990', () => {
    const total = Object.values(result.nodes).reduce((a, n) => a + n.B, 0);
    expect(total).toBe(990);
  });

  it('P1S1 node: t=0, ti=2, tt=2, tm=2, R=0, critical', () => {
    const n = result.nodes['P1S1'];
    expect(n.t).toBe(0);
    expect(n.ti).toBe(2);
    expect(n.tt).toBe(2);
    expect(n.tm).toBe(2);
    expect(n.R).toBe(0);
    expect(n.isCritical).toBe(true);
  });

  it('P4S3 terminal: t=16, tt=17, tm=17, R=0, critical', () => {
    const n = result.nodes['P4S3'];
    expect(n.t).toBe(16);
    expect(n.tt).toBe(17);
    expect(n.tm).toBe(17);
    expect(n.R).toBe(0);
    expect(n.isCritical).toBe(true);
  });

  it('P2S1 non-critical: R=4', () => {
    expect(result.nodes['P2S1'].R).toBe(4);
    expect(result.nodes['P2S1'].isCritical).toBe(false);
  });

  it('P3S1 non-critical: R=8', () => {
    expect(result.nodes['P3S1'].R).toBe(8);
  });
});

describe('calcMatrice', () => {
  it('S1→S2→S3: T=17', () => expect(calcMatrice(['S1', 'S2', 'S3'], ANEXA2B)).toBe(17));
  it('S1→S3→S2: T=17', () => expect(calcMatrice(['S1', 'S3', 'S2'], ANEXA2B)).toBe(17));
  it('S2→S1→S3: T=17', () => expect(calcMatrice(['S2', 'S1', 'S3'], ANEXA2B)).toBe(17));
  it('S3→S2→S1: T=20 (worst)', () => expect(calcMatrice(['S3', 'S2', 'S1'], ANEXA2B)).toBe(20));
});

describe('cross-functional: calcMAG.T === calcMatrice for all 6 perms', () => {
  allPermutations(['S1', 'S2', 'S3']).forEach(order => {
    it(`order ${order.join('→')}`, () => {
      expect(calcMAG(order, ANEXA2B, 30, 15).T).toBe(calcMatrice(order, ANEXA2B));
    });
  });
});

describe('buildActivities', () => {
  it('produces 12 activities for 3 sectors', () => {
    const mag = calcMAG(['S1', 'S2', 'S3'], ANEXA2B, 30, 15);
    const data = buildActivities(mag);
    expect(data.activities).toHaveLength(12);
    expect(data.totalDuration).toBe(17);
    expect(data.totalBudget).toBe(990);
    expect(data.criticalPath).toHaveLength(6);
  });
});

describe('buildNetworkEdges', () => {
  it('produces 20 edges for 3 sectors', () => {
    expect(buildNetworkEdges(['S1', 'S2', 'S3'])).toHaveLength(20);
  });

  it('produces 28 edges for 4 sectors', () => {
    // 4 procs × 3 continuity gaps = 12; 4 tech edges per sector × 4 sectors = 16; total = 28
    expect(buildNetworkEdges(['S1', 'S2', 'S3', 'S4'])).toHaveLength(28);
  });
});

describe('N sectors generalization', () => {
  const durate4: DurationsMap = {
    P1S1: 2, P1S2: 3, P1S3: 4, P1S4: 2,
    P2S1: 3, P2S2: 2, P2S3: 3, P2S4: 1,
    P3S1: 1, P3S2: 2, P3S3: 2, P3S4: 3,
    P4S1: 2, P4S2: 1, P4S3: 1, P4S4: 2,
  };

  it('4 sectors: calcMAG runs and has 16 nodes', () => {
    const result = calcMAG(['S1', 'S2', 'S3', 'S4'], durate4, 30, 15);
    expect(result.T).toBeGreaterThan(0);
    expect(Object.keys(result.nodes)).toHaveLength(16);
  });

  it('4 sectors: calcMAG.T === calcMatrice', () => {
    const order = ['S1', 'S2', 'S3', 'S4'];
    expect(calcMAG(order, durate4, 30, 15).T).toBe(calcMatrice(order, durate4));
  });

  it('2 sectors works', () => {
    const d2: DurationsMap = { P1S1: 3, P1S2: 4, P2S1: 2, P2S2: 3, P3S1: 1, P3S2: 2, P4S1: 2, P4S2: 1 };
    const result = calcMAG(['S1', 'S2'], d2, 30, 15);
    expect(result.T).toBeGreaterThan(0);
    expect(Object.keys(result.nodes)).toHaveLength(8);
  });
});

describe('runCalculations', () => {
  it('Anexa 2b: 3 optimal orders out of 6', () => {
    const result = runCalculations(ANEXA2B, { rata: 30, nrMunc: 15, productivitate: 2000 }, ['S1', 'S2', 'S3']);
    expect(result.summary.optimalCount).toBe(3);
    expect(result.summary.minT).toBe(17);
    expect(result.summary.totalBuget).toBe(990);
  });
});

describe('Quiz Engine', () => {
  it('generates 5 questions with valid correctIndex', async () => {
    const { generateQuiz } = await import('./quiz-engine');
    const result = runCalculations(ANEXA2B, { rata: 30, nrMunc: 15, productivitate: 2000 }, ['S1', 'S2', 'S3']);
    const quiz = generateQuiz(result);
    expect(quiz.length).toBe(5);
    quiz.forEach(q => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    });
  });
});
