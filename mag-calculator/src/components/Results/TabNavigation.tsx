import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import type { TabName } from '../../lib/types';
import { MAGGrid } from './MAGGrid/MAGGrid';
import { GanttChart } from './GanttChart';
import { NetworkDiagram } from './NetworkDiagram';
import { OrdersTable } from './OrdersTable';
import { ParameterTable } from './ParameterTable';

export function TabNavigation() {
  const lang = useMAGStore(s => s.lang);
  const activeTab = useMAGStore(s => s.activeTab);
  const setActiveTab = useMAGStore(s => s.setActiveTab);
  const result = useMAGStore(s => s.result);
  const tr = t(lang);

  if (!result) return null;

  const tabs: Array<{ id: TabName; label: string }> = [
    { id: 'mag', label: tr.tabs.mag },
    { id: 'gantt', label: tr.tabs.gantt },
    { id: 'network', label: tr.tabs.network },
    { id: 'ordine', label: tr.tabs.ordine },
    { id: 'tabel', label: tr.tabs.tabel },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' && idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
    if (e.key === 'ArrowLeft' && idx > 0) setActiveTab(tabs[idx - 1].id);
  };

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 mb-0 overflow-x-auto"
        role="tablist"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            tabIndex={0}
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={e => handleKeyDown(e, idx)}
            className="px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab.id ? 'var(--surface2)' : 'transparent',
              borderColor: activeTab === tab.id ? 'var(--border)' : 'transparent',
              borderBottomColor: activeTab === tab.id ? 'var(--surface2)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent2)' : 'var(--text2)',
              cursor: 'pointer',
              position: 'relative',
              bottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        key={activeTab}
        className="rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 glass-panel tab-content-animated"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none' }}
        role="tabpanel"
      >
        {activeTab === 'mag' && <MAGGrid />}
        {activeTab === 'gantt' && <GanttChart />}
        {activeTab === 'network' && <NetworkDiagram />}
        {activeTab === 'ordine' && <OrdersTable />}
        {activeTab === 'tabel' && <ParameterTable />}

        {tr.narration[activeTab as keyof typeof tr.narration] && (
          <p className="text-sm italic mt-5 leading-relaxed" style={{ color: 'var(--text2)' }}>
            💡 {tr.narration[activeTab as keyof typeof tr.narration]}
          </p>
        )}
      </div>
    </div>
  );
}
