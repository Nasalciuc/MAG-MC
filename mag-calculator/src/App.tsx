import { useEffect, useState } from 'react';
import { useMAGStore } from './store/useMAGStore';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { SummaryCards } from './components/Results/SummaryCards';
import { TabNavigation } from './components/Results/TabNavigation';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const theme = useMAGStore(s => s.theme);
  const result = useMAGStore(s => s.result);
  const calculate = useMAGStore(s => s.calculate);
  const { showModal, setShowModal } = useKeyboardShortcuts();
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window !== 'undefined' && !localStorage.getItem('mag-onboarding-done')
  );

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  useEffect(() => {
    calculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.15,
          zIndex: 0,
        }}
      />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 py-8 sm:px-8">
        <Header />
        <InputPanel />
        {result && (
          <div id="results-section">
            <SummaryCards />
            <TabNavigation />
          </div>
        )}
      </div>

      <KeyboardShortcuts open={showModal} onClose={() => setShowModal(false)} />
      {showOnboarding && (
        <Onboarding onComplete={() => {
          localStorage.setItem('mag-onboarding-done', 'true');
          setShowOnboarding(false);
        }} />
      )}
    </div>
  );
}
