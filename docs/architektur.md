# Architektur und Konventionen

Kurz und verbindlich. Änderungen hier eintragen, bevor sie im Code landen.

## Schichten

| Schicht | Ordner | Darf | Darf nicht |
| --- | --- | --- | --- |
| Logik | `src/model/` | reines TypeScript, JSON aus `src/data/` lesen | React, DOM, `Math.random`, `Date`, Netzwerk |
| Daten | `src/data/` | JSON: Teile, Sets, Regelwerte | Code |
| Darstellung | `src/view/`, `src/App.tsx` | React, SVG, CSS, Logik aufrufen | Spielregeln selbst entscheiden |

Grund: Generator, Prüfer und Anleitungs-Erzeuger werden mit tausenden Seeds automatisch getestet. Das geht nur, wenn sie ohne Oberfläche laufen und ohne versteckten Zufall sind.

## Raster

- **Koordinaten:** axial `(q, r)`, Sechsecke mit Spitze oben. Reihen laufen waagerecht; `r` wächst nach unten, `q` nach rechts. Bildposition: `x = size · √3 · (q + r/2)`, `y = size · 1,5 · r`.
- **Richtungen:** `0..5` gegen den Uhrzeigersinn, `0` = Osten (rechts), `1` = Nordosten, `2` = Nordwesten, `3` = Westen, `4` = Südwesten, `5` = Südosten. Eine Drehung eines Bausteins um eine Stufe verschiebt alle seine Anschlüsse um eine Richtung.
- **Schlüssel:** `"q,r"` als Text für Maps und Sets.
- **Gerade Linie:** `straightLine(a, b)` liefert Richtung und Schrittzahl, wenn `b` von `a` aus in einer der sechs Richtungen liegt.

## Grundplatte

27 Felder in sechs Reihen mit 5, 4, 5, 4, 5, 4 Feldern. Die Reihen mit 4 Feldern sitzen ein halbes Feld nach rechts versetzt (Konvention „odd-r"). Gezählt in der Zeichnung der Starter-Set-Anleitung; am echten Teil noch nicht gegengeprüft (siehe `docs/aufgaben.md`). Wie zwei Platten aneinanderliegen, ist offen; bis dahin rechnet die App mit einer Platte.

## Schienen

Eine Schiene verbindet zwei Felder auf einer geraden Rasterlinie und überbrückt 1 (kurz), 2 (mittel) oder 3 (lang) freie Felder. Angabe des Nutzers. Direkt benachbarte Bausteine brauchen keine Schiene.

## Noch offen

- Verhältnis kleiner zu großer Höhenstein.
- Ein- und Ausgänge je Baustein (kommt als Katalogdaten in E1).
- Gefälle-Regeln als Zahlen (Startwerte im Konzept, Messung durch den Nutzer).

## Werkzeuge

Vite 6, React 19, TypeScript 5.8, Vitest 3. Deployment über GitHub Actions nach GitHub Pages; `base` in `vite.config.ts` ist der Repository-Name.
