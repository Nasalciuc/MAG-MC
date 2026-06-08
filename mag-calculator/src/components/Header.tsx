import { useMAGStore } from '../store/useMAGStore';
import { t } from '../i18n';
import { useShareURL } from '../hooks/useShareURL';
import { exportJSON, importJSON, downloadFile } from '../lib/serialization';

const btnStyle: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text2)',
  fontSize: '0.78rem',
  fontWeight: 600,
  padding: '0.4rem 0.8rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.2s',
};

export function Header() {
  const lang = useMAGStore(s => s.lang);
  const theme = useMAGStore(s => s.theme);
  const toggleTheme = useMAGStore(s => s.toggleTheme);
  const toggleLang = useMAGStore(s => s.toggleLang);
  const result = useMAGStore(s => s.result);
  const durations = useMAGStore(s => s.durations);
  const params = useMAGStore(s => s.params);
  const sectors = useMAGStore(s => s.sectors);
  const importState = useMAGStore(s => s.importState);
  const tr = t(lang);
  const { shareURL, copied } = useShareURL();

  const handleExportPdf = async () => {
    if (!result) return;
    const { exportPDF } = await import('../lib/pdf');
    await exportPDF(result);
  };

  const handleSaveJson = () => {
    downloadFile(exportJSON(durations, params, sectors), 'mag-proiect.json');
  };

  const handleLoadJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = importJSON(ev.target?.result as string);
        if (!data || !data.sectors || !data.durate) { alert('Fișier JSON invalid.'); return; }
        importState(data.durate, {
          rata: data.rata ?? 30,
          nrMunc: data.nrMunc ?? 15,
          productivitate: data.productivitate ?? 2000,
        }, data.sectors);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="text-center py-10 pb-6">
      <div
        className="inline-block text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
        style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', color: '#93c5fd', border: '1px solid #3b82f6' }}
      >
        {tr.badge}
      </div>
      <h1
        className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
        style={{ background: 'linear-gradient(135deg,#60a5fa,#93c5fd,#dbeafe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1.1 }}
      >
        {tr.title}
      </h1>
      <p className="text-base max-w-xl mx-auto leading-relaxed mb-6" style={{ color: 'var(--text2)' }}>
        {tr.subtitle}
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        <button style={btnStyle} onClick={toggleTheme}>{theme === 'dark' ? tr.light : tr.dark}</button>
        <button style={btnStyle} onClick={toggleLang}>{lang === 'ro' ? 'EN 🌐' : 'RO 🌐'}</button>
        <button style={btnStyle} onClick={shareURL}>{copied ? tr.copySuccess : tr.share}</button>
        <button style={btnStyle} onClick={handleExportPdf}>{tr.exportPdf}</button>
        <button style={btnStyle} onClick={handleSaveJson}>{tr.saveJson}</button>
        <button style={btnStyle} onClick={handleLoadJson}>{tr.loadJson}</button>
      </div>
    </header>
  );
}
