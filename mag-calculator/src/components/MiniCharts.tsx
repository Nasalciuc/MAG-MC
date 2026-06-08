import { useMAGStore } from '../store/useMAGStore';

function PieChart({ crit, total }: { crit: number; total: number }) {
  const pct = total > 0 ? crit / total : 0;
  const r = 16;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={40} height={40} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={20} cy={20} r={r} fill="none" stroke="var(--red)" strokeWidth={6}
        strokeDasharray={`${pct * circ} ${circ}`}
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

function BarChart({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <svg width={60} height={40} viewBox="0 0 60 40">
      {values.map((v, i) => {
        const h = (v / max) * 30;
        return (
          <g key={labels[i]}>
            <rect x={i * 14 + 2} y={38 - h} width={10} height={h} rx={2} fill="var(--accent)" opacity={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

function SparkLine({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * 58 + 1},${38 - ((v - min) / range) * 30}`).join(' ');
  return (
    <svg width={60} height={40} viewBox="0 0 60 40">
      <polyline points={pts} fill="none" stroke="var(--green)" strokeWidth={2} />
      {values.map((v, i) => (
        <circle key={i} cx={(i / (values.length - 1 || 1)) * 58 + 1} cy={38 - ((v - min) / range) * 30} r={2} fill={v === min ? 'var(--green)' : v === max ? 'var(--red)' : 'var(--accent)'} />
      ))}
    </svg>
  );
}

export function MiniCharts() {
  const result = useMAGStore(s => s.result);
  if (!result) return null;

  const { summary, orderResults, activityData } = result;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const procTotals = procs.map(p =>
    activityData.activities.filter(a => a.process === p).reduce((s, a) => s + a.duration, 0)
  );
  const orderTs = orderResults.map(r => r.T);

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center">
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <PieChart crit={summary.critCount} total={result.sectors.length * 4} />
        <span className="text-xs" style={{ color: 'var(--text2)' }}>Critice</span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <BarChart values={procTotals} labels={procs} />
        <span className="text-xs" style={{ color: 'var(--text2)' }}>Durate/P</span>
      </div>
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <SparkLine values={orderTs} />
        <span className="text-xs" style={{ color: 'var(--text2)' }}>Ordini T</span>
      </div>
    </div>
  );
}
