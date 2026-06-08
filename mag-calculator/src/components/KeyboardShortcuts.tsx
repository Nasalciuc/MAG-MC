import { useMAGStore } from '../store/useMAGStore';
import { t } from '../i18n';

interface Props { open: boolean; onClose: () => void; }

export function KeyboardShortcuts({ open, onClose }: Props) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  if (!open) return null;

  const shortcuts = [
    { key: 'Enter', desc: tr.keyboard.calculate },
    { key: '1-5', desc: tr.keyboard.tabs },
    { key: 'D', desc: tr.keyboard.theme },
    { key: 'L', desc: tr.keyboard.lang },
    { key: 'Ctrl+Z', desc: tr.keyboard.undo },
    { key: 'Ctrl+Y', desc: tr.keyboard.redo },
    { key: '?', desc: tr.keyboard.title },
    { key: 'Esc', desc: tr.keyboard.close },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative rounded-2xl p-6 max-w-sm w-full mx-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--accent2)' }}>
          ⌨️ {tr.keyboard.title}
        </h3>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.key} className="flex justify-between text-sm gap-4">
              <kbd className="font-mono px-2 py-0.5 rounded text-xs shrink-0" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                {s.key}
              </kbd>
              <span style={{ color: 'var(--text2)', textAlign: 'right' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
