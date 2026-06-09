import type { MAGNode as MAGNodeType } from '../../../lib/types';
import { useMAGStore } from '../../../store/useMAGStore';

interface Props {
  node: MAGNodeType;
  nodeKey: string;
  animDelay?: number;
}

const cellBase: React.CSSProperties = {
  padding: '0.4rem 0.3rem',
  textAlign: 'center',
  fontSize: '0.85rem',
  fontWeight: 600,
  borderRight: '1px solid var(--border)',
  lineHeight: 1.3,
};

const labelCell: React.CSSProperties = {
  ...cellBase,
  fontSize: '0.65rem',
  fontWeight: 400,
  color: 'var(--text2)',
  fontFamily: 'Space Grotesk, sans-serif',
};

const lastCell: React.CSSProperties = { borderRight: 'none' };

export function MAGNode({ node, nodeKey, animDelay = 0 }: Props) {
  const showBudget = useMAGStore(s => s.showBudget);
  const isCrit = node.isCritical;
  const critStyle = isCrit ? { color: 'var(--red)', fontWeight: 800 } : {};
  const yStyle = { color: 'var(--yellow)', fontWeight: 600 };
  const greenStyle = { color: 'var(--green)' };

  const rowGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' };
  const botGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' };

  return (
    <div
      className={`mag-node-animate rounded-xl overflow-hidden font-mono mag-node-hover${isCrit ? ' critical-pulse' : ''}`}
      style={{
        border: `2px solid ${isCrit ? 'var(--critical)' : 'var(--border)'}`,
        boxShadow: isCrit ? '0 0 12px rgba(220,38,38,0.3)' : undefined,
        background: 'var(--surface)',
        minWidth: 110,
        animationDelay: `${animDelay}s`,
        transition: 'transform 0.15s',
      }}
    >
      {/* Blue row — labels */}
      <div style={{ ...rowGrid, background: 'var(--bleu)' }}>
        <div style={{ ...labelCell }}>t</div>
        <div style={{ ...labelCell }}>ti</div>
        <div style={{ ...labelCell, ...lastCell }}>tt</div>
      </div>
      {/* Blue row — values */}
      <div style={{ ...rowGrid, background: 'var(--bleu)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ ...cellBase, ...critStyle }}>{node.t}</div>
        <div style={{ ...cellBase }}>{node.ti}</div>
        <div style={{ ...cellBase, ...critStyle, ...lastCell }}>{node.tt}</div>
      </div>

      {/* Gray row — values */}
      <div style={{ ...rowGrid, background: 'var(--surface2)' }}>
        {showBudget ? (
          <>
            <div style={{ ...cellBase, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em' }}>{nodeKey}</div>
            <div style={{ ...cellBase, ...greenStyle }}>{node.B}</div>
            <div style={{ ...cellBase, ...lastCell }}>{node.N}</div>
          </>
        ) : (
          <>
            <div style={{ ...cellBase }} />
            <div style={{ ...cellBase, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.05em' }}>{nodeKey}</div>
            <div style={{ ...cellBase, ...lastCell }} />
          </>
        )}
      </div>
      {/* Gray row — labels */}
      <div style={{ ...rowGrid, background: 'var(--surface2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {showBudget ? (
          <>
            <div style={{ ...labelCell }}>cod</div>
            <div style={{ ...labelCell }}>B(mii lei)</div>
            <div style={{ ...labelCell, ...lastCell }}>N</div>
          </>
        ) : (
          <div style={{ ...labelCell, gridColumn: '1 / -1' }}>cod</div>
        )}
      </div>

      {/* Cream row — labels */}
      <div style={{ ...botGrid, background: 'var(--crem)', borderTop: '1px solid var(--border)' }}>
        <div style={{ ...labelCell }}>r</div>
        <div style={{ ...labelCell }}>R</div>
        <div style={{ ...labelCell, ...lastCell }}>tm</div>
      </div>
      {/* Cream row — values */}
      <div style={{ ...botGrid, background: 'var(--crem)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ ...cellBase, ...yStyle }}>{node.r}</div>
        <div style={{ ...cellBase, ...(isCrit ? critStyle : yStyle), ...(!isCrit ? {} : {}) }}>{node.R}</div>
        <div style={{ ...cellBase, ...lastCell }}>{node.tm}</div>
      </div>
    </div>
  );
}
