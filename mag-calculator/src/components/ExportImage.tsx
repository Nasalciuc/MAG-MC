import { exportSVGAsPNG } from '../lib/svg-export';
import { useMAGStore } from '../store/useMAGStore';
import { t } from '../i18n';

interface Props { svgRef: React.RefObject<SVGSVGElement | null>; filename: string; }

export function ExportImageBtn({ svgRef, filename }: Props) {
  const lang = useMAGStore(s => s.lang);
  const tr = t(lang);

  return (
    <button
      onClick={() => svgRef.current && exportSVGAsPNG(svgRef.current, filename)}
      className="text-xs px-3 py-1.5 rounded-lg mt-2"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}
    >
      {tr.exportPng}
    </button>
  );
}
