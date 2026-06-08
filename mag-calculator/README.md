# MAG Calculator — Management în Construcții (UTM)

Calculator web pentru Matricea Duratelor + Grafic-Rețea (CPM).
Aplicație educațională pentru cursul UTM Management în Construcții.

## Funcționalități
- Matrice durate 4 procese × 3 sectoare
- Toate 6 permutări de ordini cu identificare optimă
- MAG complet (CPM): t, ti, tt, tm, r, R, B, N, drum critic
- 3 vizualizări: Grila MAG, Comparație Ordini, Tabel Parametri

## Cum rulezi
Deschide `index.html` în browser. Nu necesită server, npm sau build.

## Structura proiectului simulat
| Proces | Rol | Dependențe |
|--------|-----|------------|
| P1 | Conducător | Pornire pe primul sector |
| P2 | Paralel cu P3 | După P1 pe același sector |
| P3 | Paralel cu P2 | După P1 pe același sector |
| P4 | Final | După P2 ȘI P3 pe același sector |

## Structura fișierelor
```
mag-calculator/
├── index.html          ← shell HTML
├── css/
│   └── styles.css      ← stiluri (dark theme, componente MAG)
├── js/
│   ├── mag-core.js     ← logică pură: ti, getSuccesors, calcStart, calcMAG, calcMatrice, allPermutations, formatCostValue
│   ├── mag-render.js   ← rendering: renderMagNode, renderMAGGrid, renderTabelParametri
│   ├── mag-dom.js      ← DOM I/O: getDurate, getParams, updateCostInfo, switchTab
│   └── mag-app.js      ← orchestrare: runCalculations, renderResults, calculate, window.onload
└── README.md
```

## Notă pedagogică
Tab-ul "Grila MAG" afișează 3 rotații ciclice fixe (S1→S2→S3, S2→S3→S1, S3→S1→S2),
NU cele mai bune 3 ordini din Matrice. Aceasta este o cerință a cursului UTM.

## Valori default (Anexa 2b)
P1: 2, 3, 8 | P2: 4, 3, 3 | P3: 1, 2, 3 | P4: 2, 1, 1
Rata: 30 mii lei | 15 muncitori | T optim = 17 zile | Buget = 990 mii lei
