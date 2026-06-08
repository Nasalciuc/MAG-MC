// ===== MAG RENDER — Funcții de rendering (returnează string HTML, zero DOM access) =====

function renderMagNode(node, key) {
  const isCrit = node.isCritical;
  const critClass = isCrit ? ' critical' : '';

  const topRow = `
    <div class="mag-row-top">
      <div class="mag-cell label">t</div>
      <div class="mag-cell label">ti</div>
      <div class="mag-cell label">tt</div>
    </div>
    <div class="mag-row-top" style="border-top:1px solid rgba(255,255,255,0.05)">
      <div class="mag-cell${isCrit ? ' critical-val' : ''}">${node.t}</div>
      <div class="mag-cell">${node.ti}</div>
      <div class="mag-cell${isCrit ? ' critical-val' : ''}">${node.tt}</div>
    </div>
  `;

  const midRow = `
    <div class="mag-row-mid">
      <div class="mag-cell cod">${key}</div>
      <div class="mag-cell budget">${node.B}</div>
      <div class="mag-cell">${node.N}</div>
    </div>
    <div class="mag-row-mid" style="border-top:1px solid rgba(255,255,255,0.05)">
      <div class="mag-cell label">cod</div>
      <div class="mag-cell label">B(mii lei)</div>
      <div class="mag-cell label">N</div>
    </div>
  `;

  const botRow = `
    <div class="mag-row-bot">
      <div class="mag-cell label">r</div>
      <div class="mag-cell label">R</div>
      <div class="mag-cell label">tm</div>
    </div>
    <div class="mag-row-bot" style="border-top:1px solid rgba(255,255,255,0.05)">
      <div class="mag-cell r-val">${node.r}</div>
      <div class="mag-cell${isCrit ? ' critical-val' : ' r-val'}">${node.R}</div>
      <div class="mag-cell">${node.tm}</div>
    </div>
  `;

  return `<div class="mag-node${critClass}">${topRow}${midRow}${botRow}</div>`;
}

function renderMAGGrid(result, label) {
  const { nodes, T, sectors } = result;
  const procs = ['P1','P2','P3','P4'];

  const critPath = [];
  procs.forEach(p => sectors.forEach(s => {
    if (nodes[`${p}${s}`].isCritical) critPath.push(`${p}${s}`);
  }));

  const totalBuget = Object.values(nodes).reduce((a, n) => a + n.B, 0);

  let html = `
    <div class="mag-section">
      <div class="mag-title">📊 MAG — Ordinea ${sectors.join(' → ')} &nbsp;|&nbsp; T = <strong>${T} zile</strong> &nbsp;|&nbsp; Buget total = <strong>${totalBuget} mii lei</strong></div>
      <div class="critical-path-info">
        <strong>Drum critic:</strong> ${critPath.join(' → ')}
      </div>
      <div class="mag-grid-outer">
        <div></div>
        ${procs.map(p => `<div class="mag-col-header">${p}</div>`).join('')}
        ${sectors.map(s => `
          <div class="mag-row-label">${s}</div>
          ${procs.map(p => renderMagNode(nodes[`${p}${s}`], `${p}${s}`)).join('')}
        `).join('')}
      </div>
    </div>
  `;
  return html;
}

function renderTabelParametri(result) {
  const { nodes, T, sectors } = result;
  const procs = ['P1','P2','P3','P4'];
  let totalB = 0;

  let rows = '';
  procs.forEach(p => sectors.forEach(s => {
    const n = nodes[`${p}${s}`];
    totalB += n.B;
    rows += `
      <tr class="${n.isCritical ? 'critical-row' : ''}">
        <td>${p}${s}</td>
        <td>${n.t}</td>
        <td>${n.ti}</td>
        <td>${n.tt}</td>
        <td class="r-val">${n.r}</td>
        <td class="${n.isCritical ? 'critical-val' : ''}">${n.R}</td>
        <td>${n.tm}</td>
        <td style="color:var(--green)">${n.B}</td>
        <td>${n.N}</td>
        <td class="${n.isCritical ? 'crit-mark' : ''}">${n.isCritical ? 'DA ✓' : '—'}</td>
      </tr>
    `;
  }));

  return `
    <div class="full-table-wrap">
      <table class="full-table">
        <thead>
          <tr>
            <th>Activitate</th>
            <th>t (start)</th>
            <th>ti (durată)</th>
            <th>tt (terminare)</th>
            <th>r (rez. liberă)</th>
            <th>R (rez. totală)</th>
            <th>tm (term. max)</th>
            <th>B (mii lei)</th>
            <th>N</th>
            <th>Critic</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="7" style="text-align:right">TOTAL BUGET</td>
            <td>${totalB}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}
