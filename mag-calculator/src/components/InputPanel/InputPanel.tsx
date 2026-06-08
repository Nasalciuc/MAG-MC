import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import { MAG_PRESETS } from '../../lib/presets';
import { DurationMatrix } from './DurationMatrix';
import { ParametersPanel } from './ParametersPanel';

export function InputPanel() {
  const lang = useMAGStore(s => s.lang);
  const selectedPreset = useMAGStore(s => s.selectedPreset);
  const sectors = useMAGStore(s => s.sectors);
  const loadPreset = useMAGStore(s => s.loadPreset);
  const setSectors = useMAGStore(s => s.setSectors);
  const tr = t(lang);

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value, 10);
    const newSectors = Array.from({ length: count }, (_, i) => `S${i + 1}`);
    setSectors(newSectors);
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: '0.9rem',
    padding: '0.6rem 1rem',
    width: '100%',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8 mb-6 glass-panel"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >1</span>
        <span className="font-semibold text-lg" style={{ color: 'var(--accent2)' }}>
          {tr.inputTitle}
        </span>
      </div>

      {/* Preset + sector count row */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
            {tr.preset}
          </label>
          <select
            style={selectStyle}
            value={selectedPreset}
            onChange={e => loadPreset(e.target.value)}
          >
            <option value="custom">{tr.customPreset}</option>
            {Object.entries(MAG_PRESETS).map(([key, p]) => (
              <option key={key} value={key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 0 120px' }}>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text2)' }}>
            {tr.sectorCount}
          </label>
          <select
            style={{ ...selectStyle, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}
            value={sectors.length}
            onChange={handleSectorChange}
          >
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Matrix + Params */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <DurationMatrix />
        <ParametersPanel />
      </div>
    </div>
  );
}
