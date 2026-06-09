import React from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { PROCESS_LABELS } from '../../lib/constants';
import { ValidatedInput } from './ValidatedInput';

function heatmapBg(val: number, allVals: number[]): string {
  if (allVals.length === 0) return 'var(--surface2)';
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  if (min === max) return 'var(--surface2)';
  const ratio = (val - min) / (max - min);
  const r = Math.round(34 + ratio * (239 - 34));
  const g = Math.round(197 - ratio * (197 - 68));
  return `rgba(${r}, ${g}, 94, 0.12)`;
}

export function DurationMatrix() {
  const sectors = useMAGStore(s => s.sectors);
  const durations = useMAGStore(s => s.durations);
  const setDuration = useMAGStore(s => s.setDuration);
  const calculate = useMAGStore(s => s.calculate);
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const allVals = Object.values(durations).filter(v => typeof v === 'number' && !isNaN(v));

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    padding: '0.55rem 0.3rem',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      id="onboarding-matrix"
      className="grid gap-2"
      style={{ gridTemplateColumns: `auto repeat(${sectors.length}, 1fr)` }}
    >
      {/* Header row */}
      <div />
      {sectors.map(s => (
        <div key={s} className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text2)' }}>
          {s}
        </div>
      ))}

      {/* Data rows */}
      {procs.map(p => (
        <React.Fragment key={p}>
          <div className="text-sm font-semibold py-1 pr-2 flex items-center" style={{ color: 'var(--accent2)', whiteSpace: 'nowrap' }}>
            {PROCESS_LABELS[p]}
          </div>
          {sectors.map(s => {
            const k = `${p}${s}`;
            return (
              <ValidatedInput
                key={k}
                id={`d_${k}`}
                value={durations[k] ?? 1}
                min={1}
                max={99}
                step={1}
                onValidChange={v => { setDuration(k, v); calculate(); }}
                onKeyDown={e => e.key === 'Enter' && calculate()}
                aria-label={`Durata ${p} pe ${s}`}
                inputStyle={{ ...inputStyle, background: heatmapBg(durations[k] ?? 0, allVals) }}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}
