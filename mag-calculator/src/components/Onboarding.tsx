import { useState } from 'react';
import { useMAGStore } from '../store/useMAGStore';
import { t } from '../i18n';

interface Props { onComplete: () => void; }

const STEP_TARGETS = [
  '#onboarding-matrix',
  '#onboarding-preset',
  '#onboarding-calculate',
  '#results-section',
  '#onboarding-tabs',
];

export function Onboarding({ onComplete }: Props) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const [step, setStep] = useState(0);

  const texts = [tr.onboarding.step1, tr.onboarding.step2, tr.onboarding.step3, tr.onboarding.step4, tr.onboarding.step5];
  const target = document.querySelector(STEP_TARGETS[step]);
  const rect = target?.getBoundingClientRect();

  const handleNext = () => {
    if (step < texts.length - 1) setStep(s => s + 1);
    else onComplete();
  };

  const tooltipStyle: React.CSSProperties = rect
    ? { top: Math.min(rect.bottom + 12, window.innerHeight - 160), left: Math.max(16, Math.min(rect.left, window.innerWidth - 320)), maxWidth: 300 }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: 300 };

  return (
    <div className="fixed inset-0 z-[100]" style={{ pointerEvents: 'auto' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
      {rect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            border: '2px solid var(--accent)',
          }}
        />
      )}
      <div
        className="absolute rounded-xl p-4 shadow-xl"
        style={{ ...tooltipStyle, background: 'var(--surface)', border: '1px solid var(--border)', zIndex: 101 }}
      >
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text)' }}>{texts[step]}</p>
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text2)' }}>{step + 1} / {texts.length}</span>
          <div className="flex gap-2">
            <button
              onClick={onComplete}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
            >
              {tr.onboarding.skip}
            </button>
            <button
              onClick={handleNext}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white"
              style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer' }}
            >
              {step < texts.length - 1 ? tr.onboarding.next : tr.onboarding.done}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
