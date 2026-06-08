import { useState, useRef } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { ExportImageBtn } from '../ExportImage';
import { buildNetworkEdges } from '../../lib/cpm-engine';
import type { NetworkEdge } from '../../lib/types';

const PROC_INDEX: Record<string, number> = { P1: 0, P2: 1, P3: 2, P4: 3 };
const NODE_W = 110, NODE_H = 62;
const GAP_X = 60, GAP_Y = 46;
const CELL_W = NODE_W + GAP_X;
const CELL_H = NODE_H + GAP_Y;
const PADDING = 50;

function nodePos(proc: string, sector: string, sectors: string[]) {
  const si = sectors.indexOf(sector);
  const pi = PROC_INDEX[proc];
  return { x: PADDING + si * CELL_W, y: PADDING + pi * CELL_H };
}

function nodeCenter(proc: string, sector: string, sectors: string[]) {
  const p = nodePos(proc, sector, sectors);
  return { x: p.x + NODE_W / 2, y: p.y + NODE_H / 2 };
}

function edgePath(edge: NetworkEdge, sectors: string[]): string {
  const [fromProc, fromSec] = [edge.from.slice(0, 2), edge.from.slice(2)];
  const [toProc, toSec] = [edge.to.slice(0, 2), edge.to.slice(2)];
  const fc = nodeCenter(fromProc, fromSec, sectors);
  const tc = nodeCenter(toProc, toSec, sectors);

  if (edge.type === 'continuity') {
    // Horizontal: right edge to left edge
    const x1 = fc.x + NODE_W / 2;
    const x2 = tc.x - NODE_W / 2;
    return `M ${x1} ${fc.y} L ${x2} ${tc.y}`;
  }

  // Technology: vertical with possible offset for skip connections
  const fromPi = PROC_INDEX[fromProc];
  const toPi = PROC_INDEX[toProc];
  const skip = Math.abs(toPi - fromPi) > 1;
  const offset = skip ? (fromProc === 'P1' && toProc === 'P3' ? -22 : 22) : 0;
  const x1 = fc.x + offset;
  const x2 = tc.x + offset;
  const y1 = fc.y + NODE_H / 2;
  const y2 = tc.y - NODE_H / 2;
  if (skip) {
    const mx = x1 + (offset > 0 ? 30 : -30);
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function NetworkDiagram() {
  const result = useMAGStore(s => s.result);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (!result) return null;

  const mag = result.magResults[0];
  const { nodes, sectors } = mag;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const edges = buildNetworkEdges(sectors);

  const svgW = PADDING * 2 + sectors.length * CELL_W - GAP_X + NODE_W;
  const svgH = PADDING * 2 + 4 * CELL_H - GAP_Y + NODE_H;

  const isEdgeHighlighted = (edge: NetworkEdge) =>
    hoveredNode ? (edge.from === hoveredNode || edge.to === hoveredNode) : false;

  const criticalEdges = new Set<string>();
  edges.forEach(e => {
    if (nodes[e.from]?.isCritical && nodes[e.to]?.isCritical) criticalEdges.add(`${e.from}-${e.to}`);
  });

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', maxWidth: svgW, height: 'auto', borderRadius: 12 }}>
        <defs>
          <marker id="arrow-tech" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--accent2)" />
          </marker>
          <marker id="arrow-cont" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--green)" />
          </marker>
          <marker id="arrow-crit" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--red)" />
          </marker>
          <marker id="arrow-hl" markerWidth={8} markerHeight={8} refX={6} refY={3} orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--yellow)" />
          </marker>
        </defs>

        <rect width={svgW} height={svgH} fill="var(--surface)" rx={12} />

        {/* Edges */}
        {edges.map((edge, i) => {
          const isCritEdge = criticalEdges.has(`${edge.from}-${edge.to}`);
          const isHl = isEdgeHighlighted(edge);
          const d = edgePath(edge, sectors);
          const color = isHl ? 'var(--yellow)' : isCritEdge ? 'var(--red)' : edge.type === 'continuity' ? 'var(--green)' : 'var(--accent2)';
          const marker = isHl ? 'url(#arrow-hl)' : isCritEdge ? 'url(#arrow-crit)' : edge.type === 'continuity' ? 'url(#arrow-cont)' : 'url(#arrow-tech)';

          return (
            <path
              key={i}
              d={d}
              stroke={color}
              strokeWidth={isHl ? 2.5 : isCritEdge ? 2 : 1.2}
              strokeDasharray={edge.type === 'continuity' ? '5,3' : undefined}
              fill="none"
              markerEnd={marker}
              opacity={hoveredNode && !isHl ? 0.25 : 1}
            />
          );
        })}

        {/* Nodes */}
        {procs.map(p => sectors.map(s => {
          const key = `${p}${s}`;
          const n = nodes[key];
          const pos = nodePos(p, s, sectors);
          const isCrit = n.isCritical;
          const isHovered = hoveredNode === key;

          return (
            <g
              key={key}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredNode(key)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <rect
                x={pos.x} y={pos.y}
                width={NODE_W} height={NODE_H}
                rx={8}
                fill={isHovered ? 'var(--surface2)' : 'var(--surface)'}
                stroke={isCrit ? 'var(--red)' : isHovered ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isCrit ? 2.5 : 1.5}
              />
              <text x={pos.x + NODE_W / 2} y={pos.y + 17} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="JetBrains Mono, monospace" fill={isCrit ? 'var(--red)' : 'var(--accent2)'}>
                {key}
              </text>
              <line x1={pos.x + 8} y1={pos.y + 24} x2={pos.x + NODE_W - 8} y2={pos.y + 24} stroke="var(--border)" strokeWidth={0.5} />
              <text x={pos.x + NODE_W / 2} y={pos.y + 37} textAnchor="middle" fontSize={9.5} fill="var(--text2)" fontFamily="JetBrains Mono, monospace">
                t={n.t}  tt={n.tt}
              </text>
              <text x={pos.x + NODE_W / 2} y={pos.y + 52} textAnchor="middle" fontSize={10} fontWeight={isCrit ? 700 : 500} fill={isCrit ? 'var(--red)' : 'var(--yellow)'} fontFamily="JetBrains Mono, monospace">
                R={n.R}
              </text>
            </g>
          );
        }))}
      </svg>

      <ExportImageBtn svgRef={svgRef} filename="mag-network.png" />
      <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ color: 'var(--text2)' }}>
        <span><span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--green)', verticalAlign: 'middle', marginRight: 4 }} />Continuitate brigadă</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--accent2)', verticalAlign: 'middle', marginRight: 4 }} />Tehnologic (P1→P2/P3, P2/P3→P4)</span>
        <span><span style={{ display: 'inline-block', width: 20, height: 2, background: 'var(--red)', verticalAlign: 'middle', marginRight: 4 }} />Drum critic</span>
      </div>
    </div>
  );
}
