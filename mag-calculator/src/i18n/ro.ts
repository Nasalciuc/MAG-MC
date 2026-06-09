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
  summary: { optDuration: string; magDuration: string; totalBudget: string; optOrders: string; critActs: string; optimalOrder?: string };
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
  narration: { mag: string; gantt: string; network: string; ordine: string; tabel: string };
  onboarding: { step1: string; step2: string; step3: string; step4: string; step5: string; skip: string; next: string; done: string };
  keyboard: { title: string; calculate: string; tabs: string; theme: string; lang: string; undo: string; redo: string; close: string };
  stepByStep: { title: string; forward: string; backward: string; reserves: string; critical: string; next: string; prev: string; play: string; explain: string };
  whatIf: { title: string; original: string; alternative: string; diff: string; better: string; worse: string };
  timeline: { play: string; pause: string; reset: string; day: string; speed: string };
  quiz: { title: string; start: string; score: string; correct: string; wrong: string; tryAgain: string; question: string; qCriticalPath: string; qOptimalT: string; qOptimalOrder: string; qReserve: string; complete: string };
  miniCharts?: { critical: string; durationsPerProc: string; ordersT: string };
  poster: { generate: string; title: string };
  sounds: { toggle: string };
  exportPng: string;
  moreActions: string;
  install: string;
  showBudget: string;
  iterations?: string;
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
  summary: { optDuration: 'Durată optimă (MAG)', magDuration: 'Durată MAG', totalBudget: 'Buget total proiect', optOrders: 'Ordini optime', critActs: 'Activități critice', optimalOrder: 'Ordinea optimă' },
  table: { activity: 'Activitate', start: 't (start)', duration: 'ti (durată)', finish: 'tt (terminare)', freeSlack: 'r (rez. liberă)', totalSlack: 'R (rez. totală)', lateFinish: 'tm (term. max)', budget: 'B (mii lei)', workers: 'N', critical: 'Critic' },
  days: 'zile', from: 'din', permutations: 'permutări', activities: 'activități',
  share: '📋 Copiază link', exportPdf: '📄 Export PDF', saveJson: '💾 Salvează JSON', loadJson: '📂 Încarcă JSON',
  light: '☀️ Light', dark: '🌙 Dark',
  criticalPath: 'Drum critic',
  totalBudgetLabel: 'TOTAL BUGET',
  optimal: '✓ OPTIM', worst: 'Cel mai slab', suboptimal: 'Suboptim',
  goldenRule: 'Regula de aur',
  goldenRuleText: 'P2 și P3 pornesc numai după P1 pe acel sector. P4 pornește numai după ambele P2 și P3. Se calculează cele 3 iterații standard (S1-S2-S3, S3-S2-S1, S1-S3-S2); cea optimă e marcată.',
  costHint: 'mii lei / zi / proces',
  workersHint: 'persoane',
  productivityHint: 'lei / muncitor / schimb',
  customPreset: 'Valori personalizate',
  copySuccess: '✅ Link copiat!',
  copyError: '❌ Eroare',
  legend: { blue: 'Rând albastru: t · ti · tt (start · durată · terminare)', gray: 'Rând mijloc: cod · B (buget) · N (muncitori)', cream: 'Rând crem: r · R · tm (rez. liberă · rez. totală · term. max)', critical: 'Nod critic (R = 0)' },
  narration: {
    mag: 'Nodurile roșii formează drumul critic — orice întârziere pe ele întârzie tot proiectul.',
    gantt: 'Barele paralele (P2/P3) arată suprapunerea proceselor. Cu cât mai dese, cu atât mai eficient.',
    network: 'Săgețile arată dependențele. Calea roșie de la start la finish e drumul critic.',
    ordine: 'Verde = ordinea optimă. Compară diferența între cea mai bună și cea mai proastă ordine.',
    tabel: 'Hover pe headerele coloanelor pentru explicații detaliate ale fiecărui parametru.',
  },
  onboarding: {
    step1: 'Aici introduci duratele proceselor pe fiecare sector',
    step2: 'Selectează o presetare sau completează manual',
    step3: 'Apasă pentru a calcula toți parametrii MAG',
    step4: 'Rezultatele apar aici — carduri sumar cu metrici cheie',
    step5: 'Navighează între vizualizări: Grila MAG, Gantt, Grafic-Rețea și mai multe',
    skip: 'Sări peste', next: 'Următorul', done: 'Gata!',
  },
  keyboard: {
    title: 'Scurtături tastatură',
    calculate: 'Enter — Calculează', tabs: '1-5 — Schimbă tab',
    theme: 'D — Dark/Light', lang: 'L — RO/EN',
    undo: 'Ctrl+Z — Anulează', redo: 'Ctrl+Y — Refă',
    close: 'Esc — Închide',
  },
  stepByStep: {
    title: 'Pas cu Pas', forward: 'Pas 1: Forward Pass',
    backward: 'Pas 2: Backward Pass', reserves: 'Pas 3: Calculul Rezervelor',
    critical: 'Pas 4: Drumul Critic', next: 'Pasul următor',
    prev: 'Pasul anterior', play: '▶ Redare automată',
    explain: 'Explicație',
  },
  whatIf: {
    title: 'Comparator What-If', original: 'Original', alternative: 'Alternativă',
    diff: 'Diferență', better: 'Mai bine', worse: 'Mai rău',
  },
  timeline: { play: '▶ Play', pause: '⏸ Pause', reset: '⏮ Reset', day: 'Ziua', speed: 'Viteză' },
  quiz: {
    title: 'Quiz Mode', start: '🎯 Începe Quiz',
    score: 'Scor', correct: 'Corect!', wrong: 'Greșit!',
    tryAgain: 'Încearcă din nou', question: 'Întrebarea',
    qCriticalPath: 'Care e drumul critic?',
    qOptimalT: 'Cât e durata optimă?',
    qOptimalOrder: 'Care ordine e optimă?',
    qReserve: 'Cât e rezerva totală R pentru',
    complete: 'Quiz complet!',
  },
  miniCharts: { critical: 'Critice', durationsPerProc: 'Durate/P', ordersT: 'Ordini T' },
  poster: { generate: '📐 Poster A3', title: 'MAG Calculator — Poster' },
  sounds: { toggle: '🔊 Sunet' },
  exportPng: '📸 Export PNG',
  moreActions: 'Mai multe...',
  install: '📲 Instalează',
  showBudget: 'Calculează și bugetul (N, B în celule)',
  iterations: 'iterații',
};
