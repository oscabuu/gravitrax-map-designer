# Changelog

Neueste Einträge oben. Datum, Etappe, was fertig ist.

## 2026-11-19 · E0 Grundgerüst

- Projekt angelegt: TypeScript, React, Vite, Vitest.
- Rastermodell: Axialkoordinaten, sechs Richtungen, gerade Linien, Felder dazwischen (`src/model/hex.ts`).
- Schienen: kurz, mittel, lang überbrücken 1, 2, 3 freie Felder (`src/model/rail.ts`).
- Grundplatte: 27 Felder in sechs Reihen, abwechselnd 5 und 4 (`src/model/plate.ts`), gezeichnet in der App.
- Tests für Raster, Schienen und Grundplatte.
- GitHub-Actions-Workflow: Tests, Build, Veröffentlichung nach GitHub Pages bei Push auf `main`.
- Dokumente: Konzept, Architektur, Aufgaben, Changelog, CLAUDE.md.
