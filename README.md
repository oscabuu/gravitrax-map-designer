# GraviTrax Map Designer

Erfindet auf Knopfdruck neue Kugelbahnen aus den vorhandenen GraviTrax-Teilen und erklärt sie Schritt für Schritt, wie eine Lego-Anleitung. Gemacht für eine Sechsjährige: große Bilder, ein Schritt pro Bildschirm, keine Pflichttexte.

Inoffizielles Hobbyprojekt. GraviTrax ist eine Marke von Ravensburger.

## App

https://oscabuu.github.io/gravitrax-map-designer/ — Arbeitsstand E0 (Grundgerüst). Die Adresse funktioniert, sobald GitHub Pages für das Repository eingeschaltet ist (siehe `docs/aufgaben.md`).

## Entwicklung

```
npm install
npm run dev      # http://localhost:5173/gravitrax-map-designer/
npm test
npm run build
```

Node 22 (siehe `.nvmrc`).

## Dokumente

- `docs/konzept.md` — das Konzept: Ziel, Funktionen, Regeln der Spielwelt, Technik, Etappen
- `docs/architektur.md` — technische Entscheidungen und Konventionen
- `docs/aufgaben.md` — was der Projektinhaber noch tun muss
- `docs/changelog.md` — was wann fertig wurde
- `CLAUDE.md` — Arbeitsanweisung für Claude Code
