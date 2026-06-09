import { useMemo } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { buildAOAGraph } from '../../lib/aoa-builder';

export function AOADiagram() {
  const result = useMAGStore(s => s.result);
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const atr = tr.aoa!;

  const graph = useMemo(() => {
    if (!result) return null;
    return buildAOAGraph(result.magResults[0]);
  }, [result]);

  if (!graph || !result) return null;

  const { events, arcs, T } = graph;
  const realArcs = arcs.filter(a => !a.isDummy);
  const dummyArcs = arcs.filter(a => a.isDummy);

  // Layout: place events on a timeline by earliestTime
  const W = 700, H = 220, padX = 60, padY = 60;
  const chartW = W - padX * 2;
  const R = 18;

  const eventX = (e: typeof events[0]) => padX + (T > 0 ? (e.earliestTime / T) * chartW : 0);
  const evtY = (_e: typeof events[0], i: number) => padY + (i % 2 === 0 ? 0 : 70);

  const evtMap = new Map(events.map((e, i) => [e.id, { ...e, x: eventX(e), y: evtY(e, i) }]));

  return (
    <div>
      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
          {atr.events}: <strong style={{ color: 'var(--accent2)' }}>{events.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
          {atr.realArcs}: <strong style={{ color: 'var(--green)' }}>{realArcs.length}</strong>
        </span>
        <span className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}>
          {atr.dummyArcs}: <strong style={{ color: 'var(--yellow)' }}>{dummyArcs.length}</strong>
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', borderRadius: 12 }}>
          <defs>
            <marker id="aoa-arrow" markerWidth={7} markerHeight={7} refX={5} refY={2.5} orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="var(--accent2)" />
            </marker>
            <marker id="aoa-arrow-crit" markerWidth={7} markerHeight={7} refX={5} refY={2.5} orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="var(--red)" />
            </marker>
            <marker id="aoa-arrow-dummy" markerWidth={7} markerHeight={7} refX={5} refY={2.5} orient="auto">
              <path d="M0,0 L0,5 L7,2.5 z" fill="var(--yellow)" />
            </marker>
          </defs>

          <rect width={W} height={H} fill="var(--surface)" rx={12} />

          {/* Arcs */}
          {arcs.map((arc, i) => {
            const from = evtMap.get(arc.from);
            const to = evtMap.get(arc.to);
            if (!from || !to) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.01) return null;
            const nx = dx / len, ny = dy / len;
            const x1 = from.x + nx * R;
            const y1 = from.y + ny * R;
            const x2 = to.x - nx * (R + 4);
            const y2 = to.y - ny * (R + 4);
            const color = arc.isDummy ? 'var(--yellow)' : arc.isCritical ? 'var(--red)' : 'var(--accent2)';
            const marker = arc.isDummy ? 'url(#aoa-arrow-dummy)' : arc.isCritical ? 'url(#aoa-arrow-crit)' : 'url(#aoa-arrow)';
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2 - 12;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color} strokeWidth={arc.isDummy ? 1 : arc.isCritical ? 2 : 1.5}
                  strokeDasharray={arc.isDummy ? '4,3' : undefined}
                  markerEnd={marker} />
                {!arc.isDummy && arc.activity && (
                  <text x={mx} y={my} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill={color}>{arc.activity}({arc.duration})</text>
                )}
              </g>
            );
          })}

          {/* Events */}
          {events.map((evt) => {
            const pos = evtMap.get(evt.id)!;
            const color = evt.isCritical ? 'var(--red)' : 'var(--accent)';
            return (
              <g key={evt.id}>
                <circle cx={pos.x} cy={pos.y} r={R} fill="var(--surface2)" stroke={color} strokeWidth={evt.isCritical ? 2.5 : 1.5} />
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={color}>{evt.id}</text>
                <text x={pos.x} y={pos.y + R + 13} textAnchor="middle" fontSize={8} fill="var(--text2)" fontFamily="JetBrains Mono, monospace">
                  {evt.earliestTime}/{evt.latestTime}
                </text>
                <title>{atr.eventNumber} {evt.id}: t_e={evt.earliestTime}, t_l={evt.latestTime}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: 'var(--text2)' }}>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--red)', verticalAlign: 'middle', marginRight: 4 }} />
          {result.activityData.criticalPath.slice(0, 6).join(', ')}{result.activityData.criticalPath.length > 6 ? '…' : ''}
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--yellow)', verticalAlign: 'middle', marginRight: 4, borderTop: '2px dashed var(--yellow)' }} />
          {atr.dummyArcs}
        </span>
      </div>
      <p className="text-xs mt-1 italic" style={{ color: 'var(--text2)' }}>
        Format nod: t_e / t_l (earliest / latest time)
      </p>
    </div>
  );
}
