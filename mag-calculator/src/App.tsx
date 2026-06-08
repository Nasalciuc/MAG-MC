import { useEffect } from 'react';
import { useMAGStore } from './store/useMAGStore';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel/InputPanel';
import { SummaryCards } from './components/Results/SummaryCards';
import { TabNavigation } from './components/Results/TabNavigation';

export default function App() {
  const theme = useMAGStore(s => s.theme);
  const result = useMAGStore(s => s.result);
  const calculate = useMAGStore(s => s.calculate);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light' : '';
  }, [theme]);

  useEffect(() => {
    calculate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Grid background */}
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
          <>
            <SummaryCards />
            <TabNavigation />
          </>
        )}
      </div>
    </div>
  );
}
