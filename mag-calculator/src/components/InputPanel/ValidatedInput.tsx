import { useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import { useMAGStore } from '../../store/useMAGStore';
import { t } from '../../i18n';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onValidChange: (val: number) => void;
  inputStyle?: CSSProperties;
}

export function ValidatedInput({ value, onValidChange, inputStyle, min = 1, max = 99, ...rest }: Props) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);
  const vtr = tr.validation;
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') { setError(vtr.numbersOnly); return; }
    const n = Number(raw);
    if (isNaN(n)) { setError(vtr.numbersOnly); return; }
    if (!Number.isInteger(n)) { setError(vtr.numbersOnly); return; }
    if (n < Number(min)) { setError(vtr.minValue); return; }
    if (n > Number(max)) { setError(vtr.maxValue); return; }
    setError(null);
    onValidChange(n);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        style={{
          ...inputStyle,
          border: error ? '2px solid var(--red)' : inputStyle?.border ?? '1px solid var(--border)',
        }}
        {...rest}
      />
      {error && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 10,
          background: 'var(--critical-bg)', border: '1px solid var(--red)',
          borderRadius: 6, padding: '2px 6px', fontSize: '0.65rem',
          color: 'var(--red)', whiteSpace: 'nowrap', marginTop: 2,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
