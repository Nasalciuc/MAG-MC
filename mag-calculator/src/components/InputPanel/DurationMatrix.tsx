import { useMAGStore } from '../../store/useMAGStore';
import { PROCESS_LABELS } from '../../lib/constants';

export function DurationMatrix() {
  const sectors = useMAGStore(s => s.sectors);
  const durations = useMAGStore(s => s.durations);
  const setDuration = useMAGStore(s => s.setDuration);
  const calculate = useMAGStore(s => s.calculate);
  const procs = ['P1', 'P2', 'P3', 'P4'];

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

  const handleChange = (key: string, val: string) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) {
      setDuration(key, n);
      calculate();
    }
  };

  return (
    <div
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
        <>
          <div key={`label-${p}`} className="text-sm font-semibold py-1 pr-2 flex items-center" style={{ color: 'var(--accent2)', whiteSpace: 'nowrap' }}>
            {PROCESS_LABELS[p]}
          </div>
          {sectors.map(s => {
            const key = `${p}${s}`;
            return (
              <input
                key={key}
                type="number"
                id={`d_${key}`}
                min={1}
                max={99}
                value={durations[key] ?? ''}
                onChange={e => handleChange(key, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && calculate()}
                aria-label={`Durata ${p} pe ${s}`}
                style={inputStyle}
              />
            );
          })}
        </>
      ))}
    </div>
  );
}
