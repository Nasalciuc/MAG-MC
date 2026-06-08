import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { CostInfoBox } from './CostInfoBox';
import type { CalcParams } from '../../lib/types';

export function ParametersPanel() {
  const lang = useMAGStore(s => s.lang);
  const params = useMAGStore(s => s.params);
  const setParam = useMAGStore(s => s.setParam);
  const calculate = useMAGStore(s => s.calculate);
  const tr = t(lang);

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '1.1rem',
    fontWeight: 600,
    textAlign: 'center',
    padding: '0.65rem 1rem',
    width: '100%',
    outline: 'none',
  };

  const handleChange = <K extends keyof CalcParams>(key: K, val: string) => {
    if (val === '') return;
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      setParam(key, n as CalcParams[K]);
      calculate();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
          {tr.costRate}
        </label>
        <input
          type="number" min={1} max={9999} step={1}
          value={params.rata}
          onChange={e => handleChange('rata', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && calculate()}
          aria-label={tr.costRate}
          style={inputStyle}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{tr.costHint}</div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
          {tr.workers}
        </label>
        <input
          type="number" min={1} max={999} step={1}
          value={params.nrMunc}
          onChange={e => handleChange('nrMunc', e.target.value)}
          onKeyDown={e => e.key === 'Enter' && calculate()}
          aria-label={tr.workers}
          style={inputStyle}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{tr.workersHint}</div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
          {tr.productivity}
        </label>
        <input
          type="number" min={100} max={99999} step={1}
          value={params.productivitate}
          onChange={e => {
            handleChange('productivitate', e.target.value);
          }}
          aria-label={tr.productivity}
          style={inputStyle}
        />
        <div className="text-xs mt-1" style={{ color: 'var(--text2)' }}>{tr.productivityHint}</div>
      </div>

      <CostInfoBox />

      <div
        className="mt-2 p-4 rounded-xl text-sm leading-relaxed"
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)' }}
      >
        <strong style={{ color: 'var(--accent2)' }}>{tr.goldenRule}:</strong><br />
        {tr.goldenRuleText}
      </div>

      <button
        id="onboarding-calculate"
        onClick={() => {
          calculate();
          setTimeout(() => {
            const el = document.getElementById('results-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              el.classList.remove('results-flash');
              void el.offsetWidth;
              el.classList.add('results-flash');
            }
          }, 50);
        }}
        className="w-full py-4 rounded-xl font-bold text-lg text-white mt-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 btn-shimmer"
        style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(59,130,246,0.3)', letterSpacing: '0.02em' }}
      >
        {tr.calculate}
      </button>
    </div>
  );
}
