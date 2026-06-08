export interface Translations {
  title: string;
  subtitle: string;
  badge: string;
  inputTitle: string;
  preset: string;
  sectorCount: string;
  costRate: string;
  workers: string;
  productivity: string;
  calculate: string;
  tabs: { mag: string; gantt: string; network: string; ordine: string; tabel: string };
  summary: { optDuration: string; magDuration: string; totalBudget: string; optOrders: string; critActs: string };
  table: { activity: string; start: string; duration: string; finish: string; freeSlack: string; totalSlack: string; lateFinish: string; budget: string; workers: string; critical: string };
  days: string;
  from: string;
  permutations: string;
  activities: string;
  share: string;
  exportPdf: string;
  saveJson: string;
  loadJson: string;
  light: string;
  dark: string;
  criticalPath: string;
  totalBudgetLabel: string;
  optimal: string;
  worst: string;
  suboptimal: string;
  goldenRule: string;
  goldenRuleText: string;
  costHint: string;
  workersHint: string;
  productivityHint: string;
  customPreset: string;
  copySuccess: string;
  copyError: string;
  legend: { blue: string; gray: string; cream: string; critical: string };
}

export const ro: Translations = {
  title: 'MAG Calculator',
  subtitle: 'Matrice + Grafic-Rețea (CPM). Introduci duratele, obții automat toți parametrii MAG, drumul critic și bugetul.',
  badge: 'UTM · Management în Construcții',
  inputTitle: 'Date de intrare — Matricea duratelor (zile)',
  preset: 'Presetare',
  sectorCount: 'Nr. sectoare',
  costRate: 'Rata costului',
  workers: 'Nr. muncitori / brigadă',
  productivity: 'Productivitate (lei/muncitor/schimb)',
  calculate: '⚡ Calculează MAG complet',
  tabs: { mag: 'Grila MAG', gantt: 'Gantt Chart', network: 'Grafic-Rețea', ordine: 'Toate Ordinile', tabel: 'Tabel Parametri' },
  summary: { optDuration: 'Durată optimă (Matrice)', magDuration: 'Durată MAG', totalBudget: 'Buget total proiect', optOrders: 'Ordini optime', critActs: 'Activități critice' },
  table: { activity: 'Activitate', start: 't (start)', duration: 'ti (durată)', finish: 'tt (terminare)', freeSlack: 'r (rez. liberă)', totalSlack: 'R (rez. totală)', lateFinish: 'tm (term. max)', budget: 'B (mii lei)', workers: 'N', critical: 'Critic' },
  days: 'zile', from: 'din', permutations: 'permutări', activities: 'activități',
  share: '📋 Copiază link', exportPdf: '📄 Export PDF', saveJson: '💾 Salvează JSON', loadJson: '📂 Încarcă JSON',
  light: '☀️ Light', dark: '🌙 Dark',
  criticalPath: 'Drum critic',
  totalBudgetLabel: 'TOTAL BUGET',
  optimal: '✓ OPTIM', worst: 'Cel mai slab', suboptimal: 'Suboptim',
  goldenRule: 'Regula de aur',
  goldenRuleText: 'P2 și P3 pornesc numai după P1 pe acel sector. P4 pornește numai după ambele P2 și P3.',
  costHint: 'mii lei / zi / proces',
  workersHint: 'persoane',
  productivityHint: 'lei / muncitor / schimb',
  customPreset: 'Valori personalizate',
  copySuccess: '✅ Link copiat!',
  copyError: '❌ Eroare',
  legend: { blue: 'Rând albastru: t · ti · tt (start · durată · terminare)', gray: 'Rând mijloc: cod · B (buget) · N (muncitori)', cream: 'Rând crem: r · R · tm (rez. liberă · rez. totală · term. max)', critical: 'Nod critic (R = 0)' },
};
