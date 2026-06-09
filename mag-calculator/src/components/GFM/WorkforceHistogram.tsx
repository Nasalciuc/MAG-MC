import { useMemo } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { calcGFM } from '../../lib/gfm';

export function WorkforceHistogram() {
  const result = useMAGStore(s => s.result);
  const params = useMAGStore(s => s.params);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const gtr = tr.gfm!;

  const gfm = useMemo(() => {
    if (!result) return null;
    return calcGFM(result.activityData.activities, result.activityData.totalDuration, params.nrMunc);
  }, [result, params.nrMunc]);

  if (!gfm || !result) return null;

  const { workersPerDay, N_max, N_med, K, verdict } = gfm;
  const isUniform = verdict === 'UNIFORM';
  const barColor = isUniform ? 'var(--green)' : 'var(--yellow)';
  const verdictColor = isUniform ? 'var(--green)' : 'var(--red)';

  const W = 600, H = 160, padL = 48, padB = 28, padT = 16, padR = 16;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barW = Math.max(2, chartW / workersPerDay.length - 1);
  const maxY = N_max > 0 ? N_max : 1;
  const avgY = H - padB - (N_med / maxY) * chartH;

  return (
    <div>
      {/* Summary cards */}
      <div className="flex flex-wrap gap-4 mb-5">
        {[
          { label: gtr.coefficient, value: K.toFixed(2), color: verdictColor },
          { label: gtr.maxWorkers, value: N_max, color: 'var(--accent2)' },
          { label: gtr.avgWorkers, value: N_med.toFixed(1), color: 'var(--accent2)' },
        ].map(c => (
          <div key={c.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', minWidth: 110 }}>
            <div className="text-xs uppercase font-semibold mb-1" style={{ color: 'var(--text2)' }}>{c.label}</div>
            <div className="font-mono text-2xl font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
        <div className="rounded-xl p-4 flex items-center" style={{ background: 'var(--surface2)', border: `2px solid ${verdictColor}` }}>
          <span className="font-semibold text-sm" style={{ color: verdictColor }}>
            {isUniform ? gtr.uniform : gtr.needsFlattening}
          </span>
        </div>
      </div>

      {/* Histogram SVG */}
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', borderRadius: 12 }}>
          <rect width={W} height={H} fill="var(--surface)" rx={12} />

          {/* Y grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(frac => {
            const y = H - padB - frac * chartH;
            const val = Math.round(frac * maxY);
            return (
              <g key={frac}>
                <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--border)" strokeWidth={0.5} />
                <text x={padL - 4} y={y + 4} textAnchor="end" fill="var(--text2)" fontSize={9} fontFamily="JetBrains Mono, monospace">{val}</text>
              </g>
            );
          })}

          {/* Bars */}
          {workersPerDay.map((w, i) => {
            const x = padL + (i / workersPerDay.length) * chartW;
            const barH2 = maxY > 0 ? (w / maxY) * chartH : 0;
            const y = H - padB - barH2;
            return (
              <g key={i}>
                <rect x={x} y={y} width={barW} height={barH2} fill={barColor} opacity={0.75} rx={1} />
                <title>Ziua {i + 1}: {w} muncitori</title>
              </g>
            );
          })}

          {/* N_med line */}
          <line x1={padL} y1={avgY} x2={W - padR} y2={avgY} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={W - padR - 2} y={avgY - 4} textAnchor="end" fill="var(--accent)" fontSize={9} fontFamily="JetBrains Mono, monospace">N̄={N_med.toFixed(1)}</text>

          {/* X axis label */}
          <text x={padL + chartW / 2} y={H - 4} textAnchor="middle" fill="var(--text2)" fontSize={9} fontFamily="Space Grotesk, sans-serif">
            {gtr.workersPerDay}
          </text>
        </svg>
      </div>

      <p className="text-xs mt-3 italic" style={{ color: 'var(--text2)' }}>
        K = N_max / N̄ = {N_max} / {N_med.toFixed(1)} = {K.toFixed(2)} — {gtr.verdict}: <span style={{ color: verdictColor, fontWeight: 600 }}>{isUniform ? gtr.uniform : gtr.needsFlattening}</span>
      </p>
    </div>
  );
}
