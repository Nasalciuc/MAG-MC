import { useMAGStore } from '../../../store/useMAGStore';
import { t } from '../../../i18n';
import { MAGNode } from './MAGNode';

export function MAGGrid() {
  const result = useMAGStore(s => s.result);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);

  if (!result) return null;

  const procs = ['P1', 'P2', 'P3', 'P4'];

  return (
    <div>
      {/* Legend */}
      <div
        className="flex flex-wrap gap-4 p-4 rounded-xl mb-4"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
      >
        {([
          { color: '#1e3a5f', border: '#2563eb', text: tr.legend.blue },
          { color: '#1a2235', border: '#2a3a55', text: tr.legend.gray },
          { color: '#2a1f0e', border: '#92400e', text: tr.legend.cream },
          { color: 'rgba(220,38,38,0.1)', border: 'var(--red)', text: tr.legend.critical },
        ] as const).map(item => (
          <div key={item.text} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text2)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: item.color, border: `2px solid ${item.border}`, flexShrink: 0 }} />
            {item.text}
          </div>
        ))}
      </div>

      {/* MAG grids for each cyclic rotation */}
      {result.magResults.map((magResult, ri) => {
        const { nodes, T, sectors } = magResult;
        const critPath: string[] = [];
        procs.forEach(p => sectors.forEach(s => {
          if (nodes[`${p}${s}`].isCritical) critPath.push(`${p}${s}`);
        }));
        const totalBuget = Object.values(nodes).reduce((a, n) => a + n.B, 0);

        return (
          <div key={ri} className="mb-10">
            <div
              className="text-base font-bold px-4 py-2 mb-3 rounded-r-lg"
              style={{ background: 'var(--surface2)', borderLeft: '3px solid var(--accent)', color: 'var(--accent2)' }}
            >
              📊 MAG — Ordinea {sectors.join(' → ')} &nbsp;|&nbsp; T = <strong>{T} {tr.days}</strong> &nbsp;|&nbsp; Buget = <strong>{totalBuget} mii lei</strong>
            </div>
            <div
              className="p-3 rounded-xl mb-3 text-sm"
              style={{ background: 'var(--critical-bg)', border: '1px solid rgba(220,38,38,0.4)' }}
            >
              <strong style={{ color: 'var(--red)' }}>{tr.criticalPath}:</strong>{' '}
              <span style={{ color: 'var(--text)' }}>{critPath.join(' → ')}</span>
            </div>
            <div
              className="overflow-x-auto"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `80px repeat(${procs.length}, minmax(110px, 1fr))`,
                  gap: 8,
                  alignItems: 'start',
                  minWidth: procs.length * 120 + 90,
                }}
              >
                <div />
                {procs.map(p => (
                  <div
                    key={p}
                    className="text-center text-xs font-bold uppercase tracking-wider px-2 py-2 rounded-lg"
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
                  >
                    {p}
                  </div>
                ))}
                {sectors.map(s => (
                  <>
                    <div
                      key={`label-${s}`}
                      className="flex items-center justify-center text-sm font-bold"
                      style={{ minHeight: 110, color: 'var(--accent2)' }}
                    >
                      {s}
                    </div>
                    {procs.map((p, pi) => (
                      <MAGNode
                        key={`${p}${s}`}
                        node={nodes[`${p}${s}`]}
                        nodeKey={`${p}${s}`}
                        animDelay={pi * 0.05 + sectors.indexOf(s) * 0.03}
                      />
                    ))}
                  </>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
