import { useRef, useState, useCallback } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { GANTT_COLORS } from '../../lib/constants';
import type { Activity } from '../../lib/types';
import { ExportImageBtn } from '../ExportImage';
import { useTimelinePlay } from '../../hooks/useTimelinePlay';

export function GanttChart() {
  const result = useMAGStore(s => s.result);
  const setDuration = useMAGStore(s => s.setDuration);
  const calculate = useMAGStore(s => s.calculate);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragPreview, setDragPreview] = useState<{ id: string; duration: number } | null>(null);

  const barH = 26, barGap = 4, labelW = 68, headerH = 28, padding = 36;
  const chartW = 700;

  const handleDragStart = useCallback((e: React.MouseEvent, act: Activity, pxPerDay: number) => {
    e.preventDefault();
    const startX = e.clientX;
    const origDuration = act.duration;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const daysDelta = Math.round(dx / pxPerDay);
      const newDur = Math.max(1, origDuration + daysDelta);
      setDragPreview({ id: act.id, duration: newDur });
    };

    const onUp = (me: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const dx = me.clientX - startX;
      const daysDelta = Math.round(dx / pxPerDay);
      const newDur = Math.max(1, origDuration + daysDelta);
      if (newDur !== origDuration) {
        setDuration(act.id, newDur);
        calculate();
      }
      setDragPreview(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [setDuration, calculate]);

  if (!result) return null;

  const { activities, totalDuration, criticalPath } = result.activityData;
  const { isPlaying, currentDay, play, pause, reset } = useTimelinePlay(totalDuration);
  const procs = ['P1', 'P2', 'P3', 'P4'];

  const pxPerDay = (chartW - padding * 2 - labelW) / totalDuration;
  const numActs = activities.length;
  const svgH = padding * 2 + headerH + numActs * (barH + barGap);
  const ox = padding + labelW;
  const oy = padding + headerH;

  const gridLines = Array.from({ length: totalDuration + 1 }, (_, d) => d);
  const playX = ox + currentDay * pxPerDay;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef} viewBox={`0 0 ${chartW} ${svgH}`} style={{ width: '100%', maxWidth: chartW, height: 'auto', borderRadius: 12 }}>
        <rect width={chartW} height={svgH} fill="var(--surface)" rx={12} />

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

        {procs.map((p, i) => (
          <g key={p} transform={`translate(${chartW - padding - 180 + i * 44}, ${padding - 6})`}>
            <rect y={-10} width={12} height={12} rx={2} fill={GANTT_COLORS[p].fill} />
            <text x={16} fill="var(--text2)" fontSize={9} fontFamily="Space Grotesk, sans-serif">{p}</text>
          </g>
        ))}

        {currentDay > 0 && (
          <line x1={playX} y1={oy} x2={playX} y2={oy + numActs * (barH + barGap)} stroke="var(--red)" strokeWidth={2} strokeDasharray="4,4" />
        )}

        {activities.map((act: Activity, idx: number) => {
          const y = oy + idx * (barH + barGap);
          const duration = dragPreview?.id === act.id ? dragPreview.duration : act.duration;
          const x = ox + act.earlyStart * pxPerDay;
          const w = Math.max(duration * pxPerDay, 2);
          const color = GANTT_COLORS[act.process];
          const isCrit = act.isCritical;
          const isFuture = act.earlyStart > currentDay;
          const opacity = currentDay > 0 && isFuture ? 0.3 : 0.85;

          return (
            <g key={act.id}>
              <text x={ox - 8} y={y + barH / 2 + 4} textAnchor="end" fill={isCrit ? 'var(--red)' : 'var(--text2)'} fontSize={10} fontWeight={isCrit ? 700 : 400} fontFamily="JetBrains Mono, monospace">
                {act.id}
              </text>
              <rect
                className="gantt-bar-hover"
                x={x} y={y} width={w} height={barH} rx={4}
                fill={color.fill} fillOpacity={opacity}
                stroke={isCrit ? 'var(--red)' : color.stroke}
                strokeWidth={isCrit ? 2.5 : 1}
                style={{ cursor: 'col-resize' }}
                onMouseDown={e => handleDragStart(e, act, pxPerDay)}
              >
                <title>{act.id}: ziua {act.earlyStart}–{act.earlyStart + duration} ({duration}z){isCrit ? ' ★ CRITIC' : ''}</title>
              </rect>
              {w > 22 && (
                <text x={x + w / 2} y={y + barH / 2 + 4} textAnchor="middle" fill="white" fontSize={9} fontWeight={600} fontFamily="JetBrains Mono, monospace" pointerEvents="none">
                  {duration}
                </text>
              )}
            </g>
          );
        })}

        <text x={padding} y={oy + numActs * (barH + barGap) + 18} fill="var(--red)" fontSize={10} fontWeight={600} fontFamily="Space Grotesk, sans-serif">
          ★ Drum critic: {criticalPath.join(' → ')}
        </text>
      </svg>

      <div className="flex flex-wrap gap-2 mt-2 items-center">
        <button onClick={isPlaying ? pause : play} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isPlaying ? tr.timeline.pause : tr.timeline.play}
        </button>
        <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
          {tr.timeline.reset}
        </button>
        <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
          {tr.timeline.day}: {Math.floor(currentDay)} / {totalDuration}
        </span>
        <span className="text-xs" style={{ color: 'var(--text2)' }}>↔ Trage bara pentru a modifica durata</span>
        <ExportImageBtn svgRef={svgRef} filename="mag-gantt.png" />
      </div>
    </div>
  );
}
