import { useState } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { PARAM_TOOLTIPS } from '../../lib/constants';
import { BudgetBreakdown } from '../Budget/BudgetBreakdown';
import type { MAGResult } from '../../lib/types';

function TooltipTh({ paramKey, label }: { paramKey: string; label: string }) {
  const tip = PARAM_TOOLTIPS[paramKey];
  return (
    <th scope="col" style={{ background: 'var(--surface2)', color: 'var(--text2)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.7rem 0.8rem', border: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
      {tip ? <abbr title={tip} style={{ cursor: 'help', textDecoration: 'underline dotted var(--text2)', textUnderlineOffset: 2 }}>{label}</abbr> : label}
    </th>
  );
}

function SingleTable({ magResult, title }: { magResult: MAGResult; title: string }) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const { nodes, sectors } = magResult;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  let totalB = 0;
  const rows: JSX.Element[] = [];
  const [budgetModal, setBudgetModal] = useState<{ key: string; B: number } | null>(null);

  procs.forEach(p => {
    sectors.forEach(s => {
      const n = nodes[`${p}${s}`];
      totalB += n.B;
      rows.push(
        <tr key={`${p}${s}`} style={{ background: n.isCritical ? 'rgba(220,38,38,0.07)' : undefined }}>
          {[
            `${p}${s}`, n.t, n.ti, n.tt, n.r, n.R, n.tm,
          ].map((v, ci) => (
            <td key={ci} style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', textAlign: 'center', color: ci === 4 || ci === 5 ? 'var(--yellow)' : n.isCritical && (ci === 0 || ci === 5) ? 'var(--red)' : undefined, fontWeight: n.isCritical && ci === 5 ? 700 : undefined }}>
              {v}
            </td>
          ))}
          <td style={{ padding: 0, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setBudgetModal({ key: `${p}${s}`, B: n.B })}
              style={{ background: 'none', border: 'none', padding: '0.6rem 0.8rem', width: '100%', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', textAlign: 'center', color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline dotted' }}
              title={tr.budget.clickToExpand}
              aria-label={`${tr.budget.breakdown} ${p}${s}`}
            >
              {n.B}
            </button>
          </td>
          <td style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', textAlign: 'center' }}>
            {n.N}
          </td>
          <td style={{ padding: '0.6rem 0.8rem', border: '1px solid var(--border)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: n.isCritical ? 'var(--red)' : undefined, fontWeight: n.isCritical ? 700 : undefined }}>
            {n.isCritical ? 'DA ✓' : '—'}
          </td>
        </tr>
      );
    });
  });

  return (
    <div className="mb-6">
      {budgetModal && (
        <BudgetBreakdown activityKey={budgetModal.key} B={budgetModal.B} onClose={() => setBudgetModal(null)} />
      )}
      <h3 style={{ fontSize: '1rem', color: 'var(--accent2)', marginBottom: '0.8rem' }}>{title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} role="table">
          <thead>
            <tr>
              <TooltipTh paramKey="" label={tr.table.activity} />
              <TooltipTh paramKey="t" label={tr.table.start} />
              <TooltipTh paramKey="ti" label={tr.table.duration} />
              <TooltipTh paramKey="tt" label={tr.table.finish} />
              <TooltipTh paramKey="r" label={tr.table.freeSlack} />
              <TooltipTh paramKey="R" label={tr.table.totalSlack} />
              <TooltipTh paramKey="tm" label={tr.table.lateFinish} />
              <TooltipTh paramKey="B" label={tr.table.budget} />
              <TooltipTh paramKey="N" label={tr.table.workers} />
              <TooltipTh paramKey="" label={tr.table.critical} />
            </tr>
          </thead>
          <tbody>{rows}</tbody>
          <tfoot>
            <tr>
              <td colSpan={7} style={{ padding: '0.6rem 0.8rem', background: 'var(--surface2)', fontWeight: 700, color: 'var(--green)', textAlign: 'right', border: '1px solid var(--border)' }}>
                {tr.totalBudgetLabel}
              </td>
              <td style={{ padding: '0.6rem 0.8rem', background: 'var(--surface2)', fontWeight: 700, color: 'var(--green)', border: '1px solid var(--border)', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>
                {totalB}
              </td>
              <td colSpan={2} style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function ParameterTable() {
  const result = useMAGStore(s => s.result);
  if (!result) return null;

  return (
    <div>
      {result.magResults.map((mr, i) => (
        <SingleTable
          key={i}
          magResult={mr}
          title={`Parametri MAG — Ordinea ${result.magOrders[i].join('→')}`}
        />
      ))}
    </div>
  );
}
