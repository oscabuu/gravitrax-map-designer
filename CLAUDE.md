# GraviTrax Map Designer — Arbeitsanweisung für Claude Code

**Web-App, die aus den vorhandenen GraviTrax-Teilen auf Knopfdruck neue Kugelbahnen erfindet und sie einer Sechsjährigen Schritt für Schritt erklärt, wie eine Lego-Anleitung.**
Vollständiges Konzept: `docs/konzept.md` (bindend). Technische Entscheidungen: `docs/architektur.md`. Aufgaben für den Nutzer: `docs/aufgaben.md`.

## 1. Was die App ist, in drei Sätzen

1. Die Eltern tragen einmal ein, welche Teile vorhanden sind (vorbelegt: Starter-Set, 124 Teile).
2. Das Kind tippt auf „Kleine Bahn", „Mittlere Bahn" oder „Große Bahn" und bekommt eine neue, geprüfte Bahn.
3. Die Bauanleitung zeigt einen Schritt pro Bildschirm: neue Teile farbig, fertige Teile grau, oben die Teile des Schritts mit Anzahl.

Es gibt **keinen Editor** zum Selberplanen, auch später nicht.

## 2. Eiserne Regeln (immer einhalten)

1. **Kein Editor.** Die App entwirft, das Kind baut. Keine Werkzeuge zum Platzieren von Teilen durch den Nutzer.
2. **Kindgerecht.** Ein Schritt pro Bildschirm, keine Pflichttexte, Trefferflächen mindestens 60 px, nur Tippen und Wischen. Alle Texte Deutsch, kurz, vorlesbar.
3. **Logik ohne Oberfläche.** Alles in `src/model/` ist reines TypeScript: kein React, kein DOM, kein `Math.random`, kein `Date`. Zufall nur über einen Seed-Zufallsgenerator in `src/model/random.ts`. Gleicher Seed = gleiche Bahn, immer.
4. **Daten statt Code.** Teile, Set-Inhalte und Gefälle-Regeln liegen als JSON in `src/data/`. Ein neues Teil, ein neues Set oder ein neuer Regelwert ist ein Eintrag dort, nie ein Sonderfall im Code.
5. **Nichts erfinden.** Maße, Feldzahlen, Anschlüsse und Regelwerte nur aus `docs/konzept.md` oder aus Messungen des Nutzers. Unsichere Werte im Katalog mit `"verified": false` kennzeichnen und in `docs/aufgaben.md` zur Prüfung auflisten.
6. **Tests.** Jede Raster- und Gefälle-Regel hat einen Vitest. Generator-Tests laufen über viele Seeds und prüfen, dass jede erzeugte Bahn den Prüfer besteht. Vor jedem Commit sind `npm test` und `npm run build` grün.
7. **Kleine Commits, main immer lauffähig.** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`). Features auf `feat/<name>`-Branches; `main` veröffentlicht automatisch nach GitHub Pages.
8. **Der Nutzer ist kein Programmierer.** Nach jedem Arbeitspaket eine kurze Zusammenfassung und höchstens fünf Prüfschritte. Alles, was der Nutzer selbst tun muss, steht in `docs/aufgaben.md` mit genauen Klickwegen.
9. **Sprache.** Oberfläche, Dokumentation und Commit-Beschreibungen Deutsch. Code, Bezeichner und Dateinamen Englisch. Teilenamen in Daten und Oberfläche so, wie sie auf der Verpackung stehen.
10. **Marke.** GraviTrax ist eine Marke von Ravensburger. Keine Logos, keine offiziellen Bilder. In der App und im Store-Text steht „inoffiziell".

## 3. Struktur

```
src/
  model/        reine Logik: Raster (hex.ts), Schienen (rail.ts), Grundplatte (plate.ts),
                Katalog (catalog.ts), Bahn (track.ts), Prüfer (validate.ts),
                Anleitungs-Erzeuger (steps.ts); später Generator
  data/         JSON: Teile-Katalog (parts.json), Set-Inhalte (sets.json), Regelwerte (rules.json),
                Beispielbahnen (tracks/*.json)
  view/         React-Komponenten, nur Darstellung
  App.tsx       Einstieg der Oberfläche
docs/
  konzept.md    das Konzept (bindend)
  architektur.md Entscheidungen und Konventionen
  aufgaben.md   offene Aufgaben für den Nutzer, mit Klickwegen
  changelog.md  was wann fertig wurde
.github/workflows/deploy.yml   Tests, Build, Veröffentlichung nach GitHub Pages
```

## 4. Befehle

```
npm install        Abhängigkeiten holen
npm run dev        Entwicklung im Browser (http://localhost:5173/gravitrax-map-designer/)
npm test           alle Tests einmal
npm run build      Typprüfung und Produktions-Build nach dist/
```

## 5. Konventionen für das Raster (siehe docs/architektur.md)

- Axialkoordinaten `(q, r)`, Spitze oben: Reihen waagerecht, `r` zählt nach unten, `q` nach rechts.
- Richtungen `0..5` gegen den Uhrzeigersinn, `0` = rechts. Drehung eines Bausteins = Richtungsverschiebung.
- Grundplatte: 27 Felder in sechs Reihen, abwechselnd 5 und 4 Felder, ungerade Reihen ein halbes Feld nach rechts versetzt (`plateCells()`).
- Schienen überbrücken 1, 2 oder 3 freie Felder (kurz, mittel, lang) auf einer geraden Rasterlinie (`railBetween()`).
- Höhen: Stapel aus großen und kleinen Höhensteinen je Feld. Das Verhältnis klein zu groß ist noch nicht gemessen.

## 6. Etappen

E0 Grundgerüst → E1 Modell und Zeichnung (dieser Stand) → E2 Generator klein → E3 Kindermodus → E4 Aktionssteine und Feinschliff = Version 1.0. Jede Etappe endet mit einer Abnahme durch den Nutzer; Details und Abnahmekriterien in `docs/konzept.md`, Abschnitt „Etappen".
