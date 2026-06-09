import { useState, useEffect, useRef, useMemo } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import type { CalcSummary } from '../../lib/types';
import { MiniCharts } from '../MiniCharts';
import { calcGFM } from '../../lib/gfm';

interface StatCardProps {
  label: string;
  value: number | string;
  unit: string;
  critical?: boolean;
}

function StatCard({ label, value, unit, critical }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 text-center"
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${critical ? 'var(--red)' : 'var(--border)'}`,
      }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
        {label}
      </div>
      <div className="font-mono text-3xl font-bold leading-none" style={{ color: critical ? 'var(--red)' : 'var(--accent2)' }}>
        {value}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{unit}</div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export function SummaryCards() {
  const result = useMAGStore(s => s.result);
  const params = useMAGStore(s => s.params);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const prevResultRef = useRef(result);

  if (result !== prevResultRef.current) {
    prevResultRef.current = result;
    if (!showSkeleton) {
      setShowSkeleton(true);
    }
  }

  useEffect(() => {
    if (showSkeleton) {
      const timer = setTimeout(() => setShowSkeleton(false), 200);
      return () => clearTimeout(timer);
    }
  }, [showSkeleton]);

  if (!result) return null;
  const s: CalcSummary = result.summary;
  const sectors = result.sectors;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const gfm = useMemo(() => calcGFM(result.activityData.activities, result.activityData.totalDuration, params.nrMunc), [result, params.nrMunc]);

  if (showSkeleton) {
    return (
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <>
    <MiniCharts />
    <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      <StatCard label={tr.summary.optDuration} value={s.minT} unit={tr.days} />
      <StatCard label={`${tr.summary.magDuration} (${sectors.join('→')})`} value={s.firstMAGT} unit={tr.days} />
      <StatCard label={tr.summary.totalBudget} value={s.totalBuget} unit="mii lei" />
      <StatCard label={tr.summary.optOrders} value={s.optimalCount} unit={`${tr.from} ${s.totalPerms} ${tr.permutations}`} />
      <StatCard label={tr.summary.critActs} value={s.critCount} unit={`${tr.from} ${sectors.length * 4} ${tr.activities}`} critical />
      <StatCard label={tr.gfm?.coefficient ?? 'K'} value={gfm.K.toFixed(2)} unit={gfm.uniform ? '✅ Uniform' : '⚠️ Neuniform'} critical={!gfm.uniform} />
    </div>
    </>
  );
}
