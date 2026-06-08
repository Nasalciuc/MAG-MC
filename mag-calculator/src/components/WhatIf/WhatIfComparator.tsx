import { useState, useMemo } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { runCalculations } from '../../lib/cpm-engine';
import type { DurationsMap } from '../../lib/types';

export function WhatIfComparator() {
  const result = useMAGStore(s => s.result);
  const durations = useMAGStore(s => s.durations);
  const params = useMAGStore(s => s.params);
  const sectors = useMAGStore(s => s.sectors);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);

  const [altDurations, setAltDurations] = useState<DurationsMap>(() => ({ ...durations }));

  const altResult = useMemo(
    () => runCalculations(altDurations, params, sectors),
    [altDurations, params, sectors]
  );

  if (!result) return null;

  const origT = result.summary.minT;
  const altT = altResult.summary.minT;
  const diff = altT - origT;

  const keys = Object.keys(durations);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--green)' }}>{tr.whatIf.original}</h3>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
          {keys.map(k => (
            <div key={k} className="p-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--text2)' }}>{k}</div>
              <div style={{ color: 'var(--text)' }}>{durations[k]}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="text-xs" style={{ color: 'var(--text2)' }}>T optim</div>
          <div className="text-2xl font-bold font-mono" style={{ color: 'var(--green)' }}>{origT}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--accent2)' }}>{tr.whatIf.alternative}</h3>
        <div className="grid grid-cols-3 gap-2 text-center font-mono text-sm">
          {keys.map(k => {
            const changed = altDurations[k] !== durations[k];
            const better = altT < origT;
            return (
              <div key={k}>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={altDurations[k]}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    if (!isNaN(n) && n >= 1) setAltDurations(d => ({ ...d, [k]: n }));
                  }}
                  className="w-full p-2 rounded-lg text-center font-mono"
                  style={{
                    background: changed ? (better ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)') : 'var(--surface2)',
                    border: `1px solid ${changed ? (better ? 'var(--green)' : 'var(--red)') : 'var(--border)'}`,
                    color: 'var(--text)',
                  }}
                />
                <div className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{k}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-xl text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div className="text-xs" style={{ color: 'var(--text2)' }}>T optim</div>
          <div className="text-2xl font-bold font-mono" style={{ color: diff <= 0 ? 'var(--green)' : 'var(--red)' }}>{altT}</div>
          {diff !== 0 && (
            <div className="text-sm mt-1" style={{ color: diff < 0 ? 'var(--green)' : 'var(--red)' }}>
              {tr.whatIf.diff}: {diff > 0 ? '+' : ''}{diff} {diff < 0 ? tr.whatIf.better : tr.whatIf.worse}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
