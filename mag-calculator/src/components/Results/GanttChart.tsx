import { useMAGStore } from '../../store/useMAGStore';
import { GANTT_COLORS } from '../../lib/constants';
import type { Activity } from '../../lib/types';

export function GanttChart() {
  const result = useMAGStore(s => s.result);
  if (!result) return null;

  const { activities, totalDuration, criticalPath } = result.activityData;
  const procs = ['P1', 'P2', 'P3', 'P4'];

  const barH = 26, barGap = 4, labelW = 68, headerH = 28, padding = 36;
  const chartW = 700;
  const pxPerDay = (chartW - padding * 2 - labelW) / totalDuration;
  const numActs = activities.length;
  const svgH = padding * 2 + headerH + numActs * (barH + barGap);
  const ox = padding + labelW;
  const oy = padding + headerH;

  const gridLines = Array.from({ length: totalDuration + 1 }, (_, d) => d);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${chartW} ${svgH}`} style={{ width: '100%', maxWidth: chartW, height: 'auto', borderRadius: 12 }}>
        <rect width={chartW} height={svgH} fill="var(--surface)" rx={12} />

        {/* Day labels + grid */}
        {gridLines.map(d => {
          const x = ox + d * pxPerDay;
          return (
            <g key={d}>
              <line x1={x} y1={oy} x2={x} y2={oy + numActs * (barH + barGap)} stroke="var(--border)" strokeWidth={d % 2 === 0 ? 1 : 0.5} strokeDasharray={d % 2 !== 0 ? '2,2' : undefined} />
              {(d % 2 === 0 || totalDuration <= 20) && (
                <text x={x} y={oy - 8} textAnchor="middle" fill="var(--text2)" fontSize={9} fontFamily="JetBrains Mono, monospace">{d}</text>
              )}
            </g>
          );
        })}

        <text x={ox + (chartW - padding * 2 - labelW) / 2} y={padding - 6} textAnchor="middle" fill="var(--text2)" fontSize={10} fontFamily="Space Grotesk, sans-serif">Zile →</text>

        {/* Legend */}
        {procs.map((p, i) => (
          <g key={p} transform={`translate(${chartW - padding - 180 + i * 44}, ${padding - 6})`}>
            <rect y={-10} width={12} height={12} rx={2} fill={GANTT_COLORS[p].fill} />
            <text x={16} fill="var(--text2)" fontSize={9} fontFamily="Space Grotesk, sans-serif">{p}</text>
          </g>
        ))}

        {/* Bars */}
        {activities.map((act: Activity, idx: number) => {
          const y = oy + idx * (barH + barGap);
          const x = ox + act.earlyStart * pxPerDay;
          const w = Math.max(act.duration * pxPerDay, 2);
          const color = GANTT_COLORS[act.process];
          const isCrit = act.isCritical;

          return (
            <g key={act.id}>
              <text x={ox - 8} y={y + barH / 2 + 4} textAnchor="end" fill={isCrit ? 'var(--red)' : 'var(--text2)'} fontSize={10} fontWeight={isCrit ? 700 : 400} fontFamily="JetBrains Mono, monospace">
                {act.id}
              </text>
              <rect
                x={x} y={y} width={w} height={barH} rx={4}
                fill={color.fill} fillOpacity={0.85}
                stroke={isCrit ? 'var(--red)' : color.stroke}
                strokeWidth={isCrit ? 2.5 : 1}
              >
                <title>{act.id}: ziua {act.earlyStart}–{act.earlyFinish} ({act.duration}z){isCrit ? ' ★ CRITIC' : ''} | R={act.totalSlack} | B={act.budget} mii lei</title>
              </rect>
              {w > 22 && (
                <text x={x + w / 2} y={y + barH / 2 + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight={600} fontFamily="JetBrains Mono, monospace" pointerEvents="none">
                  {act.duration}
                </text>
              )}
            </g>
          );
        })}

        {/* Critical path label */}
        <text
          x={padding}
          y={oy + numActs * (barH + barGap) + 18}
          fill="var(--red)"
          fontSize={10}
          fontWeight={600}
          fontFamily="Space Grotesk, sans-serif"
        >
          ★ Drum critic: {criticalPath.join(' → ')}
        </text>
      </svg>
    </div>
  );
}
