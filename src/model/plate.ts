import { type Axial, add } from './hex'

/**
 * Grundplatte des Starter-Sets: 27 Felder in sechs Reihen, abwechselnd 5 und 4 Felder.
 * Gezählt in der Zeichnung der Starter-Set-Anleitung (Seite 3), siehe docs/konzept.md.
 * Am echten Teil noch nicht gegengeprüft.
 */
export const PLATE_ROWS = 6
export const PLATE_CELL_COUNT = 27

export function plateRowLength(row: number): number {
  if (!Number.isInteger(row) || row < 0 || row >= PLATE_ROWS) {
    throw new RangeError(`Reihe ${row} liegt außerhalb der Grundplatte`)
  }
  return row % 2 === 0 ? 5 : 4
}

/**
 * Felder einer Grundplatte in Axialkoordinaten. origin ist das Feld links oben (Reihe 0, Spalte 0).
 * Ungerade Reihen (4 Felder) sitzen ein halbes Feld nach rechts versetzt ("odd-r"-Versatz).
 */
export function plateCells(origin: Axial = { q: 0, r: 0 }): Axial[] {
  const cells: Axial[] = []
  for (let row = 0; row < PLATE_ROWS; row++) {
    const shift = (row - (row & 1)) / 2
    for (let col = 0; col < plateRowLength(row); col++) {
      cells.push(add(origin, { q: col - shift, r: row }))
    }
  }
  return cells
}
