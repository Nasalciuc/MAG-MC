# MAG Calculator — Management în Construcții (UTM)

Calculator web pentru **Matricea Duratelor** + **Grafic-Rețea (CPM)**.
Aplicație educațională pentru cursul UTM *Management în Construcții*.

**Repository:** [github.com/Nasalciuc/MAG-MC](https://github.com/Nasalciuc/MAG-MC)

## Funcționalități

- Matrice durate: **4 procese (P1–P4) × N sectoare** (implicit 3)
- Toate permutările de ordini cu identificare optimă
- MAG complet (CPM): `t`, `ti`, `tt`, `tm`, `r`, `R`, `B`, `N`, drum critic
- **5 vizualizări:** Grila MAG, Gantt, Diagramă Rețea, Comparație Ordini, Tabel Parametri
- Preset-uri (Anexa 2b, exemple curs)
- Export PDF
- Mod întunecat / luminos
- Interfață **RO / EN**
- Partajare prin URL (parametri serializați)
- Teste automate pentru motorul CPM (Vitest)

## Cum rulezi (versiunea principală — React)

```bash
npm install
npm run dev
```

Build producție:

```bash
npm run build
npm run preview
```

Teste:

```bash
npm run test
```

## Deploy (Vercel)

Proiectul include `vercel.json` pentru Vite. Din acest folder:

```bash
npx vercel
```

Sau conectează repository-ul în [Vercel](https://vercel.com) cu **Root Directory** = `mag-calculator`.

## Versiune legacy (HTML, fără build)

Folderul `legacy/` conține versiunea standalone Nivel 2. Deschide `legacy/index.html` direct în browser — nu necesită npm sau server.

## Stack tehnic (v3.0)

| Tehnologie | Rol |
|------------|-----|
| React 18 | UI |
| TypeScript | Tipizare |
| Vite | Build & dev server |
| Zustand | State management |
| Tailwind CSS | Stiluri |
| Vitest | Teste unitare |

## Structura proiectului

```
mag-calculator/
├── src/
│   ├── lib/              ← motor CPM, tipuri, preset-uri, PDF, serializare
│   ├── store/            ← Zustand (useMAGStore)
│   ├── i18n/             ← ro.ts, en.ts
│   ├── hooks/
│   ├── components/       ← Header, InputPanel, Results (MAG, Gantt, Rețea, etc.)
│   ├── App.tsx
│   └── main.tsx
├── legacy/               ← versiune HTML standalone (Nivel 2)
├── public/
├── index.html            ← entry Vite
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
└── README.md
```

## Procese simulate

| Proces | Rol | Dependențe |
|--------|-----|------------|
| P1 | Conducător | Pornire pe primul sector |
| P2 | Paralel cu P3 | După P1 pe același sector |
| P3 | Paralel cu P2 | După P1 pe același sector |
| P4 | Final | După P2 **și** P3 pe același sector |

## Notă pedagogică

Tab-ul **Grila MAG** afișează 3 rotații ciclice fixe (S1→S2→S3, S2→S3→S1, S3→S1→S2),
**nu** cele mai bune 3 ordini din Matrice. Aceasta este o cerință a cursului UTM.

## Valori verificate (Anexa 2b)

| Parametru | Valoare |
|-----------|---------|
| Durate P1 | 2, 3, 8 |
| Durate P2 | 4, 3, 3 |
| Durate P3 | 1, 2, 3 |
| Durate P4 | 2, 1, 1 |
| Rata | 30 mii lei |
| Muncitori | 15 |
| **T optim** | **17 zile** |
| **Buget** | **990 mii lei** |
| Activități critice | 6 / 12 |
