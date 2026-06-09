import { useState, useMemo, useEffect } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { generateSteps } from '../../lib/step-solver';
import type { SolverStep } from '../../lib/types';

const TYPE_LABELS: Record<SolverStep['type'], keyof ReturnType<typeof t>['stepByStep']> = {
  forward: 'forward',
  backward: 'backward',
  reserve: 'reserves',
  critical: 'critical',
};

export function StepByStep() {
  const result = useMAGStore(s => s.result);
  const durations = useMAGStore(s => s.durations);
  const params = useMAGStore(s => s.params);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const [stepIdx, setStepIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const steps = useMemo(() => {
    if (!result) return [];
    const order = result.magResults[0].sectors;
    return generateSteps(order, durations, params.rata, params.nrMunc);
  }, [result, durations, params]);

  useEffect(() => {
    if (!autoPlay || steps.length === 0) return;
    const timer = setInterval(() => {
      setStepIdx(i => (i < steps.length - 1 ? i + 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [autoPlay, steps.length]);

  const activityToStepIndex = useMemo(() => {
    const map: Record<string, number> = {};
    steps.forEach((step, idx) => {
      if (!(step.nodeId in map)) map[step.nodeId] = idx;
    });
    return map;
  }, [steps]);

  if (!result || steps.length === 0) return null;

  const current = steps[stepIdx];
  const activeNodes = new Set(steps.slice(0, stepIdx + 1).map(s => s.nodeId));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button
          onClick={() => setStepIdx(i => Math.max(0, i - 1))}
          disabled={stepIdx === 0}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer', opacity: stepIdx === 0 ? 0.5 : 1 }}
        >
          ← {tr.stepByStep.prev}
        </button>
        <button
          onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={stepIdx >= steps.length - 1}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--accent)', border: 'none', color: 'white', cursor: 'pointer', opacity: stepIdx >= steps.length - 1 ? 0.5 : 1 }}
        >
          {tr.stepByStep.next} →
        </button>
        <button
          onClick={() => setAutoPlay(a => !a)}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
        >
          {autoPlay ? '⏸' : tr.stepByStep.play}
        </button>
        <span className="text-sm ml-auto" style={{ color: 'var(--text2)' }}>
          {stepIdx + 1} / {steps.length}
        </span>
      </div>

      <div className="w-full h-2 rounded-full mb-4" style={{ background: 'var(--surface2)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${((stepIdx + 1) / steps.length) * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      <div
        className="p-4 rounded-xl mb-4"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      >
        <div className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--accent2)' }}>
          {tr.stepByStep[TYPE_LABELS[current.type]]}
        </div>
        <div className="font-mono text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{current.nodeId}</div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{current.explanation}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {result.magResults[0].sectors.flatMap(s =>
          ['P1', 'P2', 'P3', 'P4'].map(p => {
            const key = `${p}${s}`;
            const active = activeNodes.has(key);
            const isCrit = current.type === 'critical' && current.nodeId === key;
            return (
              <div
                key={key}
                onClick={() => setStepIdx(activityToStepIndex[key] ?? 0)}
                className="px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all"
                style={{
                  background: isCrit ? 'var(--critical-bg)' : active ? 'var(--bleu)' : 'var(--surface2)',
                  border: `2px solid ${isCrit ? 'var(--red)' : active ? 'var(--accent)' : 'var(--border)'}`,
                  color: isCrit ? 'var(--red)' : active ? 'var(--accent2)' : 'var(--text2)',
                  opacity: active ? 1 : 0.35,
                  cursor: 'pointer',
                }}
              >
                {key}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
