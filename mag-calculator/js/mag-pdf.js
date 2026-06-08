// ===== MAG PDF — Export PDF via jsPDF (încărcat lazy de pe CDN) =====

let jsPDFLoaded = false;

/**
 * Încarcă jsPDF de pe CDN dacă nu e deja încărcat.
 */
function loadJsPDF() {
  return new Promise(function(resolve, reject) {
    if (jsPDFLoaded && window.jspdf) {
      resolve(window.jspdf);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      jsPDFLoaded = true;
      resolve(window.jspdf);
    };
    script.onerror = function() {
      reject(new Error('Nu s-a putut încărca jsPDF. Verifică conexiunea la internet.'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Exportă rezultatele curente ca PDF.
 * @param {Object} calcData — output din runCalculations()
 */
async function exportPDF(calcData) {
  try {
    const jspdfModule = await loadJsPDF();
    const jsPDF = jspdfModule.jsPDF;
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MAG Calculator \u2014 Rezultate', margin, y);
    y += 10;

    // Summary
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const s = calcData.summary;
    doc.text('Durata optima: ' + s.minT + ' zile | Buget: ' + s.totalBuget + ' mii lei | Activitati critice: ' + s.critCount + '/' + (calcData.sectors ? calcData.sectors.length * 4 : 12) + ' | Ordini optime: ' + s.optimalCount + '/' + s.totalPerms, margin, y);
    y += 10;

    // Orders table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparatie toate ordinile', margin, y);
    y += 7;

    doc.setFontSize(9);
    const colW = [10, 20, 50, 25, 30];
    const headers = ['#', 'T (zile)', 'Ordine sectoare', 'vs. optim', 'Status'];
    headers.forEach(function(h, i) {
      const x = margin + colW.slice(0, i).reduce(function(a, b) { return a + b; }, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(h, x, y);
    });
    y += 5;

    const minT = calcData.minT;
    const maxT = calcData.maxT;

    calcData.orderResults.forEach(function(r, idx) {
      doc.setFont('helvetica', 'normal');
      const vals = [
        String(idx + 1),
        String(r.T),
        r.order.join(' > '),
        r.T === minT ? '-' : '+' + (r.T - minT),
        r.T === minT ? 'OPTIM' : (r.T === maxT ? 'Cel mai slab' : 'Suboptim')
      ];
      vals.forEach(function(v, i) {
        const x = margin + colW.slice(0, i).reduce(function(a, b) { return a + b; }, 0);
        if (r.T === minT) doc.setFont('helvetica', 'bold');
        doc.text(v, x, y);
        doc.setFont('helvetica', 'normal');
      });
      y += 4.5;
    });

    y += 8;

    // Parameter table for first MAG order
    const result0 = calcData.magResults[0];
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Parametri MAG \u2014 Ordinea ' + result0.sectors.join('>'), margin, y);
    y += 7;

    doc.setFontSize(8);
    const tHeaders = ['Activ.', 't', 'ti', 'tt', 'tm', 'r', 'R', 'B', 'N', 'Critic'];
    const tColW = [16, 12, 12, 12, 12, 12, 12, 18, 12, 15];
    tHeaders.forEach(function(h, i) {
      doc.setFont('helvetica', 'bold');
      doc.text(h, margin + tColW.slice(0, i).reduce(function(a, b) { return a + b; }, 0), y);
    });
    y += 4;

    const procs = ['P1','P2','P3','P4'];
    procs.forEach(function(p) {
      result0.sectors.forEach(function(sec) {
        const n = result0.nodes[p + sec];
        doc.setFont('helvetica', n.isCritical ? 'bold' : 'normal');
        const vals = [p + sec, n.t, n.ti, n.tt, n.tm, n.r, n.R, n.B, n.N, n.isCritical ? 'DA' : '-'];
        vals.forEach(function(v, i) {
          doc.text(String(v), margin + tColW.slice(0, i).reduce(function(a, b) { return a + b; }, 0), y);
        });
        y += 3.8;
        if (y > pageH - margin) {
          doc.addPage();
          y = margin;
        }
      });
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Generat de MAG Calculator UTM \u2014 ' + new Date().toLocaleDateString('ro-RO'), margin, pageH - 5);

    doc.save('mag-rezultate.pdf');
    return true;
  } catch (err) {
    alert('Eroare la export PDF: ' + err.message);
    return false;
  }
}
