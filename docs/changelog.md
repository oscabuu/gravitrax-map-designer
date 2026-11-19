# Changelog

Neueste Einträge oben. Datum, Etappe, was fertig ist.

## 2026-11-19 · E1 Modell und Zeichnung

- Teile-Katalog, Starter-Set-Inhalt (124 Teile) und Regel-Startwerte als JSON in `src/data/`.
- Bahn-Modell (`src/model/track.ts`): Platten, Felder mit Höhenstapel und Baustein, Schienen, Kugelweg; Teilebedarf je Bahn.
- Prüfer (`src/model/validate.ts`): Felder auf der Platte, Schienen gerade und passend, kein Baustein unter einer Schiene, Anschlüsse passen, Gefälle-Regeln, Start oben, Ziel unten.
- Anleitungs-Erzeuger (`src/model/steps.ts`): Platte, je Feld Stapel und Baustein, Schienen, Kugel; vorlesbare Sätze.
- Zeichnung von oben mit Rinnen, Startkugeln, Zielleiter, Höhen-Zahlen in den Ecken, Hervorhebung neuer Teile.
- Schritt-Bildschirm mit großen Pfeilen, Fortschrittspunkten und Teileliste; passt auf iPad und Handy quer ohne Scrollen.
- Beispielbahn 1 (von Hand entworfen) als erste Anleitung mit neun Schritten.
- 40 Tests.

## 2026-11-19 · E0 Grundgerüst

- Projekt angelegt: TypeScript, React, Vite, Vitest.
- Rastermodell: Axialkoordinaten, sechs Richtungen, gerade Linien, Felder dazwischen (`src/model/hex.ts`).
- Schienen: kurz, mittel, lang überbrücken 1, 2, 3 freie Felder (`src/model/rail.ts`).
- Grundplatte: 27 Felder in sechs Reihen, abwechselnd 5 und 4 (`src/model/plate.ts`), gezeichnet in der App.
- Tests für Raster, Schienen und Grundplatte.
- GitHub-Actions-Workflow: Tests, Build, Veröffentlichung nach GitHub Pages bei Push auf `main`.
- Dokumente: Konzept, Architektur, Aufgaben, Changelog, CLAUDE.md.
