import type { MAGResult } from '../../../lib/types';
import { useMAGStore } from '../../../store/useMAGStore';

interface Props { result: MAGResult }

export function AcademicMatrixSVG({ result }: Props) {
  const showBudget = useMAGStore(s => s.showBudget);
  const { nodes, sectors } = result;
  const procs = ['P1', 'P2', 'P3', 'P4'];

  // Layout constants — identice cu HTML
  const Wc = 96, Hc = 66, GX = 60, GY = 54, LEFT = 54, TOP = 42, BOT = 54;
  const cols = 4, rows = sectors.length;
  const mw = Wc / 3, mh = Hc / 3;
  const colX = (c: number) => LEFT + c * (Wc + GX);
  const rowY = (r: number) => TOP + r * (Hc + GY);
  const W = colX(cols - 1) + Wc + 24;
  const H = rowY(rows - 1) + Hc + BOT;
  const cx = (c: number, ci: number) => colX(c) + ci * mw + mw / 2;
  const cy = (r: number, ri: number) => rowY(r) + ri * mh + mh / 2;

  return (
    <div style={{ background: '#fdfdfb', borderRadius: 10, padding: '14px 10px', overflowX: 'auto', marginTop: '0.6rem' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: '100%', fontFamily: "'JetBrains Mono', monospace" }}>
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M1 1L8 5L1 9" fill="none" stroke="#3b82f6" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* Process headers P1-P4 */}
        {procs.map((p, c) => (
          <text key={p} x={colX(c) + Wc / 2} y={TOP - 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="#1f5fa8">{p}</text>
        ))}

        {/* Sector labels */}
        {sectors.map((s, r) => (
          <text key={s} x={LEFT - 18} y={rowY(r) + Hc / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="#222">{s}</text>
        ))}

        {/* Continuity arrows (vertical) */}
        {procs.map((_, c) =>
          Array.from({ length: rows - 1 }, (__, r) => {
            const x = colX(c) + Wc / 2;
            return <line key={`cv-${c}-${r}`} x1={x} y1={rowY(r) + Hc} x2={x} y2={rowY(r + 1) - 1} stroke="#3b82f6" strokeWidth={1.4} markerEnd="url(#ah)" />;
          })
        )}

        {/* Technological arrows */}
        {Array.from({ length: rows }, (_, r) => {
          const ym = rowY(r) + Hc / 2;
          return (
            <g key={`th-${r}`}>
              {/* P1→P2, P3→P4 adjacent */}
              {([[0, 1], [2, 3]] as [number, number][]).map(([cs, ct]) => (
                <line key={`adj-${r}-${cs}`} x1={colX(cs) + Wc} y1={ym} x2={colX(ct) - 1} y2={ym} stroke="#3b82f6" strokeWidth={1.4} markerEnd="url(#ah)" />
              ))}
              {/* P1→P3, P2→P4 skip routes (under row) */}
              {([[0, 2, 16], [1, 3, 32]] as [number, number, number][]).map(([cs, ct, d]) => {
                const sx = colX(cs) + Wc * 0.72, tx = colX(ct) + Wc * 0.28;
                const yb = rowY(r) + Hc, lane = yb + d;
                return <polyline key={`skip-${r}-${cs}`} points={`${sx},${yb} ${sx},${lane} ${tx},${lane} ${tx},${yb + 1}`} fill="none" stroke="#3b82f6" strokeWidth={1.4} markerEnd="url(#ah)" />;
              })}
            </g>
          );
        })}

        {/* Cells */}
        {sectors.map((s, r) =>
          procs.map((p, c) => {
            const key = `${p}${s}`;
            const n = nodes[key];
            const x = colX(c), y = rowY(r);
            const crit = n.isCritical;
            const num = r * cols + c + 1;

            return (
              <g key={key}>
                <rect x={x} y={y} width={Wc} height={Hc} fill="#ffffff" stroke={crit ? '#d62828' : '#333'} strokeWidth={crit ? 2.2 : 1} />
                <line x1={x} y1={y + mh} x2={x + Wc} y2={y + mh} stroke="#cfcfcf" strokeWidth={0.7} />
                <line x1={x} y1={y + 2 * mh} x2={x + Wc} y2={y + 2 * mh} stroke="#cfcfcf" strokeWidth={0.7} />
                <line x1={x + mw} y1={y} x2={x + mw} y2={y + Hc} stroke="#cfcfcf" strokeWidth={0.7} />
                <line x1={x + 2 * mw} y1={y} x2={x + 2 * mw} y2={y + Hc} stroke="#cfcfcf" strokeWidth={0.7} />

                {/* Top row: nr | N? | B? */}
                <text x={cx(c, 0)} y={cy(r, 0)} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700} fill={crit ? '#d62828' : '#111'}>{num}</text>
                {showBudget && (
                  <>
                    <text x={cx(c, 1)} y={cy(r, 0)} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#555">{n.N}</text>
                    <text x={cx(c, 2)} y={cy(r, 0)} textAnchor="middle" dominantBaseline="central" fontSize={9} fill="#1d8a4e">{n.B}</text>
                  </>
                )}

                {/* Mid row: t ti tt */}
                <text x={cx(c, 0)} y={cy(r, 1)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#111">{n.t}</text>
                <text x={cx(c, 1)} y={cy(r, 1)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#777">{n.ti}</text>
                <text x={cx(c, 2)} y={cy(r, 1)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#111">{n.tt}</text>

                {/* Bottom row: R r tm */}
                <text x={cx(c, 0)} y={cy(r, 2)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill={crit ? '#d62828' : '#111'}>{n.R}</text>
                <text x={cx(c, 1)} y={cy(r, 2)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#777">{n.r}</text>
                <text x={cx(c, 2)} y={cy(r, 2)} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#111">{n.tm}</text>
              </g>
            );
          })
        )}
      </svg>

      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem', color: '#555', textAlign: 'center', marginTop: 6 }}>
        celulă: nr.{showBudget ? ' · N | B' : ''} · t ti tt · R r tm &nbsp;|&nbsp; chenar roșu = activitate critică
      </div>
    </div>
  );
}
