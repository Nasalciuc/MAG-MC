import { useState, useEffect } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';

function SparkBar({ value, min, max }: { value: number; min: number; max: number }) {
  const fill = value === min ? 'var(--green)' : value === max ? 'var(--red)' : 'var(--yellow)';
  const w = Math.max(4, 60 * (value - min + 1) / (max - min + 1));
  return (
    <svg width={60} height={14} style={{ verticalAlign: 'middle' }}>
      <rect x={0} y={2} width={60} height={10} rx={3} fill="var(--surface2)" stroke="var(--border)" strokeWidth={0.5} />
      <rect x={0} y={2} width={w} height={10} rx={3} fill={fill} opacity={0.7} />
    </svg>
  );
}

export function OrdersTable() {
  const result = useMAGStore(s => s.result);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const [animating, setAnimating] = useState(false);
  const [revealIdx, setRevealIdx] = useState(-1);
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    if (!animating || !result) return;
    setShowTable(false);
    setRevealIdx(0);
    const timer = setInterval(() => {
      setRevealIdx(i => {
        if (i >= result.orderResults.length - 1) {
          clearInterval(timer);
          setTimeout(() => { setShowTable(true); setAnimating(false); }, 500);
          return i;
        }
        return i + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [animating, result]);

  if (!result) return null;
  const { orderResults, minT, maxT } = result;

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setAnimating(true)}
          disabled={animating}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: animating ? 'wait' : 'pointer', opacity: animating ? 0.6 : 1 }}
        >
          ▶ Animează ordini
        </button>
      </div>

      {!showTable && revealIdx >= 0 && (
        <div className="space-y-2 mb-4">
          {orderResults.slice(0, revealIdx + 1).map((r, i) => (
            <div
              key={i}
              className="p-3 rounded-xl font-mono text-sm flex justify-between items-center tab-content-animated"
              style={{
                background: r.T === minT ? 'rgba(34,197,94,0.1)' : 'var(--surface2)',
                border: `1px solid ${r.T === minT ? 'var(--green)' : 'var(--border)'}`,
                textDecoration: r.T === maxT ? 'line-through' : 'none',
                opacity: r.T === maxT ? 0.5 : 1,
              }}
            >
              <span>{r.order.join(' → ')}</span>
              <span style={{ color: r.T === minT ? 'var(--green)' : 'var(--text)', fontWeight: r.T === minT ? 700 : 400 }}>
                T = {r.T} {tr.days}
              </span>
            </div>
          ))}
        </div>
      )}

      {showTable && (
        <>
          <div
            className="p-3 mb-4 rounded-r-lg font-mono text-sm leading-relaxed"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--yellow)', color: 'var(--text2)' }}
          >
            <span style={{ color: 'var(--yellow)' }}>t(nod)</span> = max(sfârșit proces precedent pe același sector, sfârșit același proces pe sectorul anterior)<br />
            P4 pe fiecare sector: predecesor tehnologic = <span style={{ color: 'var(--yellow)' }}>max(sfârșit P2, sfârșit P3)</span> pe acel sector. &nbsp; tt = t + ti.
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }} role="table">
              <thead>
                <tr>
                  {['#', 'T (zile)', 'Grafic', 'Ordinea sectoarelor', 'vs. optim', 'Status'].map(h => (
                    <th key={h} scope="col" style={{ background: 'var(--surface2)', color: 'var(--text2)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.8rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orderResults.map((r, i) => (
                  <tr key={i} style={{ background: r.T === minT ? 'rgba(34,197,94,0.05)' : undefined }}>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', color: r.T === minT ? 'var(--green)' : undefined, fontWeight: r.T === minT ? 700 : 400 }}>{r.T}</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      <SparkBar value={r.T} min={minT} max={maxT} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace' }}>{r.order.join(' → ')}</td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.T === minT ? '—' : `+${r.T - minT} ${tr.days}`}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                      {r.T === minT ? (
                        <span style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 99, padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 600 }}>
                          {tr.optimal}
                        </span>
                      ) : r.T === maxT ? `✗ ${tr.worst}` : `~ ${tr.suboptimal}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
