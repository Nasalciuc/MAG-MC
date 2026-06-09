import { calcBudgetBreakdown } from '../../lib/budget';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';

interface Props {
  activityKey: string;
  B: number;
  onClose: () => void;
}

export function BudgetBreakdown({ activityKey, B, onClose }: Props) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const btr = tr.budget!;
  const breakdown = calcBudgetBreakdown(B);

  const rows: Array<{ label: string; value: number; bold?: boolean; color?: string }> = [
    { label: btr.salary, value: breakdown.salariu },
    { label: btr.materials, value: breakdown.materiale },
    { label: btr.machines, value: breakdown.masini },
    { label: btr.directCosts, value: breakdown.directe, bold: true },
    { label: btr.indirectCosts, value: breakdown.indirecte },
    { label: btr.productionTotal, value: breakdown.totalProductie, bold: true },
    { label: btr.profit, value: breakdown.profit },
    { label: btr.grandTotal, value: breakdown.total, bold: true, color: 'var(--green)' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-6 shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: 300, maxWidth: 380 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold" style={{ color: 'var(--accent2)', fontSize: '1rem' }}>
            {btr.breakdown} — {activityKey}
          </h3>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 rounded"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <tbody>
            {rows.map(row => (
              <tr key={row.label}>
                <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border)', color: row.color ?? 'var(--text2)', fontWeight: row.bold ? 700 : 400 }}>
                  {row.label}
                </td>
                <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', color: row.color ?? (row.bold ? 'var(--text)' : 'var(--text2)'), fontWeight: row.bold ? 700 : 400 }}>
                  {row.value.toFixed(2)} <span style={{ fontSize: '0.7rem' }}>mii lei</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
