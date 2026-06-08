/**
 * Rezolvă CSS custom properties din SVG pentru export PNG.
 * CSS vars (var(--accent)) nu funcționează în canvas drawImage.
 */
export function resolveCSVarsInSVG(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const computed = getComputedStyle(document.documentElement);

  function resolveValue(val: string): string {
    const match = val.match(/var\(--([^)]+)\)/);
    if (!match) return val;
    return computed.getPropertyValue(`--${match[1]}`).trim() || val;
  }

  clone.querySelectorAll('*').forEach(el => {
    const htmlEl = el as SVGElement;
    const attrs = ['fill', 'stroke', 'color', 'stop-color'];
    attrs.forEach(attr => {
      const val = htmlEl.getAttribute(attr);
      if (val && val.includes('var(')) {
        htmlEl.setAttribute(attr, resolveValue(val));
      }
    });
    if (htmlEl.style) {
      ['fill', 'stroke', 'color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const val = htmlEl.style.getPropertyValue(prop);
        if (val && val.includes('var(')) {
          htmlEl.style.setProperty(prop, resolveValue(val));
        }
      });
    }
  });

  return clone;
}

/**
 * Exportă un element SVG ca PNG.
 */
export async function exportSVGAsPNG(svgEl: SVGSVGElement, filename: string): Promise<void> {
  const resolved = resolveCSVarsInSVG(svgEl);
  const svgData = new XMLSerializer().serializeToString(resolved);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const scale = 2;
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(pngBlob => {
      if (!pngBlob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pngBlob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');

    URL.revokeObjectURL(url);
  };
  img.src = url;
}
