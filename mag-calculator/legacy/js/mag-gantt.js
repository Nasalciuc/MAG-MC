// ===== MAG GANTT — Gantt Chart SVG renderer =====
// Dependințe: mag-core.js (buildActivities)
// Zero librării externe — SVG pur

const GANTT_COLORS = {
  P1: { fill: '#3b82f6', stroke: '#2563eb', label: 'P1' },
  P2: { fill: '#22c55e', stroke: '#16a34a', label: 'P2' },
  P3: { fill: '#f59e0b', stroke: '#d97706', label: 'P3' },
  P4: { fill: '#a855f7', stroke: '#9333ea', label: 'P4' }
};

const GANTT_CRITICAL_STROKE = '#ef4444';
const GANTT_CRITICAL_STROKE_WIDTH = 3;

/**
 * Generează SVG Gantt Chart complet.
 * @param {Object} activityData — output din buildActivities()
 * @param {Object} options — { width, barHeight, padding, labelWidth }
 * @returns {string} SVG string
 */
function renderGanttSVG(activityData, options) {
  const opts = Object.assign({
    width: 800,
    barHeight: 28,
    barGap: 4,
    padding: 40,
    labelWidth: 70,
    headerHeight: 30
  }, options || {});

  const { activities, totalDuration, criticalPath, sectorOrder } = activityData;
  const procs = ['P1', 'P2', 'P3', 'P4'];
  const numActivities = activities.length;
  const chartWidth = opts.width - opts.padding * 2 - opts.labelWidth;
  const chartHeight = numActivities * (opts.barHeight + opts.barGap) + opts.headerHeight;
  const totalHeight = chartHeight + opts.padding * 2;
  const pxPerDay = chartWidth / totalDuration;

  let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + opts.width + ' ' + totalHeight + '" class="gantt-svg">';

  // Background
  svg += '<rect width="' + opts.width + '" height="' + totalHeight + '" fill="var(--surface)" rx="12"/>';

  const ox = opts.padding + opts.labelWidth;
  const oy = opts.padding + opts.headerHeight;

  // Gridlines + day labels
  for (let d = 0; d <= totalDuration; d++) {
    const x = ox + d * pxPerDay;
    const isEven = d % 2 === 0;
    svg += '<line x1="' + x + '" y1="' + oy + '" x2="' + x + '" y2="' + (oy + numActivities * (opts.barHeight + opts.barGap)) + '" stroke="var(--border)" stroke-width="' + (isEven ? 1 : 0.5) + '" stroke-dasharray="' + (isEven ? '' : '2,2') + '"/>';
    if (isEven || totalDuration <= 20) {
      svg += '<text x="' + x + '" y="' + (oy - 8) + '" text-anchor="middle" fill="var(--text2)" font-size="10" font-family="\'JetBrains Mono\', monospace">' + d + '</text>';
    }
  }

  // Title "Zile →"
  svg += '<text x="' + (ox + chartWidth / 2) + '" y="' + (opts.padding - 5) + '" text-anchor="middle" fill="var(--text2)" font-size="11" font-family="\'Space Grotesk\', sans-serif">Zile \u2192</text>';

  // Bars
  activities.forEach(function(act, idx) {
    const y = oy + idx * (opts.barHeight + opts.barGap);
    const x = ox + act.earlyStart * pxPerDay;
    const w = act.duration * pxPerDay;
    const color = GANTT_COLORS[act.process];
    const isCrit = act.isCritical;

    // Label (left side)
    svg += '<text x="' + (opts.padding + opts.labelWidth - 8) + '" y="' + (y + opts.barHeight / 2 + 4) + '" text-anchor="end" fill="' + (isCrit ? GANTT_CRITICAL_STROKE : 'var(--text2)') + '" font-size="11" font-weight="' + (isCrit ? '700' : '400') + '" font-family="\'JetBrains Mono\', monospace">' + act.id + '</text>';

    // Bar
    svg += '<rect x="' + x + '" y="' + y + '" width="' + Math.max(w, 2) + '" height="' + opts.barHeight + '" rx="4" fill="' + color.fill + '" fill-opacity="0.8" stroke="' + (isCrit ? GANTT_CRITICAL_STROKE : color.stroke) + '" stroke-width="' + (isCrit ? GANTT_CRITICAL_STROKE_WIDTH : 1) + '">';
    svg += '<title>' + act.id + ': ziua ' + act.earlyStart + '\u2013' + act.earlyFinish + ' (' + act.duration + 'z)' + (isCrit ? ' \u2605 CRITIC' : '') + ' | R=' + act.totalSlack + ' | B=' + act.budget + ' mii lei</title>';
    svg += '</rect>';

    // Duration text inside bar (dacă bara e suficient de largă)
    if (w > 25) {
      svg += '<text x="' + (x + w / 2) + '" y="' + (y + opts.barHeight / 2 + 4) + '" text-anchor="middle" fill="white" font-size="10" font-weight="600" font-family="\'JetBrains Mono\', monospace" pointer-events="none">' + act.duration + '</text>';
    }
  });

  // Critical path indicator (bottom)
  const critY = oy + numActivities * (opts.barHeight + opts.barGap) + 8;
  svg += '<text x="' + opts.padding + '" y="' + (critY + 12) + '" fill="' + GANTT_CRITICAL_STROKE + '" font-size="11" font-weight="600" font-family="\'Space Grotesk\', sans-serif">\u2605 Drum critic: ' + criticalPath.join(' \u2192 ') + '</text>';

  // Legend (top right)
  const legendX = opts.width - opts.padding - 180;
  const legendY = opts.padding - 5;
  procs.forEach(function(p, i) {
    const lx = legendX + i * 45;
    svg += '<rect x="' + lx + '" y="' + (legendY - 10) + '" width="12" height="12" rx="2" fill="' + GANTT_COLORS[p].fill + '"/>';
    svg += '<text x="' + (lx + 16) + '" y="' + legendY + '" fill="var(--text2)" font-size="10" font-family="\'Space Grotesk\', sans-serif">' + p + '</text>';
  });

  svg += '</svg>';
  return svg;
}
