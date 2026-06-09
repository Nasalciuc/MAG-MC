import { useState } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';
import type { TabName } from '../../lib/types';
import { MAGGrid } from './MAGGrid/MAGGrid';
import { GanttChart } from './GanttChart';
import { NetworkDiagram } from './NetworkDiagram';
import { OrdersTable } from './OrdersTable';
import { ParameterTable } from './ParameterTable';
import { StepByStep } from '../StepByStep/StepByStep';
import { WhatIfComparator } from '../WhatIf/WhatIfComparator';
import { WorkforceHistogram } from '../GFM/WorkforceHistogram';
import { AOADiagram } from '../AOA/AOADiagram';

export function TabNavigation() {
  const lang = useMAGStore(s => s.lang);
  const activeTab = useMAGStore(s => s.activeTab);
  const setActiveTab = useMAGStore(s => s.setActiveTab);
  const result = useMAGStore(s => s.result);
  const tr = t(lang);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!result) return null;

  const primaryTabs: Array<{ id: TabName; label: string }> = [
    { id: 'mag', label: tr.tabs.mag },
    { id: 'gantt', label: tr.tabs.gantt },
    { id: 'network', label: tr.tabs.network },
    { id: 'ordine', label: tr.tabs.ordine },
  ];

  const secondaryTabs: Array<{ id: TabName; label: string }> = [
    { id: 'tabel', label: tr.tabs.tabel },
    { id: 'steps', label: tr.stepByStep.title },
    { id: 'whatif', label: tr.whatIf.title },
    { id: 'gfm', label: tr.gfm?.title ?? 'GFM' },
    { id: 'aoa', label: tr.aoa?.title ?? 'AOA' },
  ];

  const allTabs = [...primaryTabs, ...secondaryTabs];
  const activeInSecondary = secondaryTabs.some(t => t.id === activeTab);
  const activeSecondaryLabel = secondaryTabs.find(t => t.id === activeTab)?.label;

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' && idx < primaryTabs.length - 1) setActiveTab(allTabs[idx + 1].id);
    if (e.key === 'ArrowLeft' && idx > 0) setActiveTab(allTabs[idx - 1].id);
    if (e.key === 'Escape') setDropdownOpen(false);
  };

  const narrationKey = activeTab as keyof typeof tr.narration;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--surface2)' : 'transparent',
    borderColor: active ? 'var(--border)' : 'transparent',
    borderBottomColor: active ? 'var(--surface2)' : 'transparent',
    color: active ? 'var(--accent2)' : 'var(--text2)',
    cursor: 'pointer',
    position: 'relative',
    bottom: -1,
  });

  return (
    <div>
      <div
        id="onboarding-tabs"
        className="flex gap-1 mb-0 overflow-x-auto"
        role="tablist"
        style={{ borderBottom: '1px solid var(--border)', paddingBottom: 0 }}
      >
        {primaryTabs.map((tab, idx) => (
          <button
            key={tab.id}
            role="tab"
            tabIndex={0}
            aria-selected={activeTab === tab.id}
            onClick={() => { setActiveTab(tab.id); setDropdownOpen(false); }}
            onKeyDown={e => handleKeyDown(e, idx)}
            className="px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-all whitespace-nowrap"
            style={tabStyle(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}

        {/* Dropdown "Mai multe" */}
        <div style={{ position: 'relative' }}>
          <button
            role="tab"
            aria-selected={activeInSecondary}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen(o => !o)}
            className="px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-all whitespace-nowrap"
            style={tabStyle(activeInSecondary)}
          >
            {activeInSecondary ? activeSecondaryLabel : '⋯ ' + (tr.moreActions ?? 'Mai multe')} ▾
          </button>

          {dropdownOpen && (
            <div
              role="listbox"
              className="absolute left-0 top-full mt-1 rounded-xl shadow-lg z-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: 170 }}
            >
              {secondaryTabs.map(tab => (
                <button
                  key={tab.id}
                  role="option"
                  aria-selected={activeTab === tab.id}
                  onClick={() => { setActiveTab(tab.id); setDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    background: activeTab === tab.id ? 'var(--surface2)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent2)' : 'var(--text2)',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 glass-panel"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none' }}
        role="tabpanel"
        onClick={() => dropdownOpen && setDropdownOpen(false)}
      >
        <div key={activeTab} className="tab-content-animated">
          {activeTab === 'mag' && <MAGGrid />}
          {activeTab === 'gantt' && <GanttChart />}
          {activeTab === 'network' && <NetworkDiagram />}
          {activeTab === 'ordine' && <OrdersTable />}
          {activeTab === 'tabel' && <ParameterTable />}
          {activeTab === 'steps' && <StepByStep />}
          {activeTab === 'whatif' && <WhatIfComparator />}
          {activeTab === 'gfm' && <WorkforceHistogram />}
          {activeTab === 'aoa' && <AOADiagram />}
        </div>

        {tr.narration[narrationKey] && (
          <p className="text-sm italic mt-5 leading-relaxed" style={{ color: 'var(--text2)' }}>
            💡 {tr.narration[narrationKey]}
          </p>
        )}
      </div>
    </div>
  );
}
