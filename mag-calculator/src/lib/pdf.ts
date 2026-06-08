// Lazy-loaded PDF export (loads jsPDF from CDN)
import type { CalculationResult } from './types';

let jsPDFLoaded = false;

function loadJsPDF(): Promise<{ jsPDF: new (...args: unknown[]) => unknown }> {
  return new Promise((resolve, reject) => {
    if (jsPDFLoaded && (window as unknown as Record<string, unknown>)['jspdf']) {
      resolve((window as unknown as Record<string, unknown>)['jspdf'] as { jsPDF: new (...args: unknown[]) => unknown });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => {
      jsPDFLoaded = true;
      resolve((window as unknown as Record<string, unknown>)['jspdf'] as { jsPDF: new (...args: unknown[]) => unknown });
    };
    script.onerror = () => reject(new Error('Nu s-a putut încărca jsPDF.'));
    document.head.appendChild(script);
  });
}

interface JsPDFDoc {
  setFontSize(size: number): void;
  setFont(name: string, style: string): void;
  text(text: string, x: number, y: number): void;
  addPage(): void;
  save(filename: string): void;
  internal: { pageSize: { getWidth(): number; getHeight(): number } };
}

export async function exportPDF(calcData: CalculationResult): Promise<boolean> {
  try {
    const mod = await loadJsPDF();
    const JsPDF = mod.jsPDF as new (orientation: string, unit: string, format: string) => JsPDFDoc;
    const doc = new JsPDF('landscape', 'mm', 'a4');
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('MAG Calculator — Rezultate', margin, y); y += 10;

    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    const s = calcData.summary;
    doc.text(`Durata optima: ${s.minT} zile | Buget: ${s.totalBuget} mii lei | Critice: ${s.critCount}/${calcData.sectors.length * 4} | Ordini optime: ${s.optimalCount}/${s.totalPerms}`, margin, y);
    y += 10;

    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Comparatie ordini', margin, y); y += 7;

    calcData.orderResults.forEach((r, idx) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', r.T === calcData.minT ? 'bold' : 'normal');
      doc.text(`${idx + 1}. ${r.order.join('>')}  T=${r.T}  ${r.T === calcData.minT ? 'OPTIM' : r.T === calcData.maxT ? 'Cel mai slab' : 'Suboptim'}`, margin, y);
      y += 4.5;
    });

    y += 5;
    const result0 = calcData.magResults[0];
    doc.setFontSize(12); doc.setFont('helvetica', 'bold');
    doc.text('Parametri MAG — ' + result0.sectors.join('>'), margin, y); y += 7;

    doc.setFontSize(8);
    ['P1', 'P2', 'P3', 'P4'].forEach(p => {
      result0.sectors.forEach(sec => {
        const n = result0.nodes[`${p}${sec}`];
        doc.setFont('helvetica', n.isCritical ? 'bold' : 'normal');
        doc.text(`${p}${sec}  t=${n.t} ti=${n.ti} tt=${n.tt} R=${n.R} B=${n.B}${n.isCritical ? ' CRITIC' : ''}`, margin, y);
        y += 3.8;
        if (y > pageH - margin) { doc.addPage(); y = margin; }
      });
    });

    doc.setFontSize(8); doc.setFont('helvetica', 'italic');
    doc.text(`Generat de MAG Calculator UTM — ${new Date().toLocaleDateString('ro-RO')}`, margin, pageH - 5);
    doc.save('mag-rezultate.pdf');
    return true;
  } catch (err) {
    alert('Eroare PDF: ' + (err as Error).message);
    return false;
  }
}

export async function exportPosterA3(calcData: CalculationResult): Promise<boolean> {
  try {
    const mod = await loadJsPDF();
    const JsPDF = mod.jsPDF as new (orientation: string, unit: string, format: string) => JsPDFDoc;
    const doc = new JsPDF('landscape', 'mm', 'a3');
    const margin = 20;
    let y = margin;

    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('MAG Calculator — Poster A3', margin, y); y += 12;

    const s = calcData.summary;
    const mag = calcData.magResults[0];
    doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    doc.text(`T optim: ${s.minT} zile | Buget: ${s.totalBuget} mii lei | Critice: ${s.critCount} | Ordini optime: ${s.optimalCount}/${s.totalPerms}`, margin, y);
    y += 10;

    doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('Drum critic: ' + calcData.activityData.criticalPath.join(' → '), margin, y);
    y += 10;

    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Parametri MAG — ' + mag.sectors.join(' → '), margin, y); y += 6;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    ['P1', 'P2', 'P3', 'P4'].forEach(p => {
      mag.sectors.forEach(sec => {
        const n = mag.nodes[`${p}${sec}`];
        doc.text(`${p}${sec}  t=${n.t} ti=${n.ti} tt=${n.tt} R=${n.R} B=${n.B} N=${n.N}${n.isCritical ? ' ★' : ''}`, margin, y);
        y += 4;
      });
    });

    y += 6;
    doc.setFontSize(10); doc.setFont('helvetica', 'bold');
    doc.text('Toate ordinele:', margin, y); y += 6;
    doc.setFontSize(8);
    calcData.orderResults.forEach((r, i) => {
      doc.text(`${i + 1}. ${r.order.join('→')}  T=${r.T}`, margin, y);
      y += 4;
    });

    doc.setFontSize(8); doc.setFont('helvetica', 'italic');
    doc.text(`MAG Calculator UTM — ${new Date().toLocaleDateString('ro-RO')}`, margin, doc.internal.pageSize.getHeight() - 10);
    doc.save('mag-poster-a3.pdf');
    return true;
  } catch (err) {
    alert('Eroare Poster: ' + (err as Error).message);
    return false;
  }
}
