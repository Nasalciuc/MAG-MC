import { useMAGStore } from '../../store/useMAGStore';

export function CostInfoBox() {
  const params = useMAGStore(s => s.params);
  const { nrMunc, productivitate, rata } = params;
  const rataCalc = (nrMunc * productivitate / 1000).toFixed(2).replace(/\.?0+$/, '');

  return (
    <div
      className="p-4 text-sm leading-relaxed rounded-r-xl"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--green)', color: 'var(--text2)' }}
    >
      <strong style={{ color: 'var(--green)' }}>💰 Cum se obține rata costului?</strong><br />
      Rata costului reprezintă costul unei brigăzi pentru executarea unui proces timp de o zi.
      <div
        className="my-2 p-2 rounded-lg font-mono text-sm"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.22)', color: 'var(--text)' }}
      >
        Rata = Nr. muncitori × Productivitate / 1000
      </div>
      <span className="font-mono" style={{ color: 'var(--yellow)' }}>
        {nrMunc} × {productivitate} / 1000 = {rataCalc} mii lei/zi/proces
      </span>
      {Math.abs(parseFloat(rataCalc) - rata) > 0.01 && (
        <div className="mt-1 text-xs" style={{ color: 'var(--yellow)' }}>
          ⚠ Rata introdusă ({rata}) diferă de cea calculată ({rataCalc})
        </div>
      )}
    </div>
  );
}
