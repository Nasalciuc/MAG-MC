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
