import { describe, expect, it } from 'vitest'
import { distance, hex, key, neighbors } from './hex'
import { PLATE_CELL_COUNT, PLATE_ROWS, plateCells, plateRowLength } from './plate'

describe('Grundplatte', () => {
  const cells = plateCells()

  it('hat 27 verschiedene Felder in sechs Reihen', () => {
    expect(cells).toHaveLength(PLATE_CELL_COUNT)
    expect(new Set(cells.map(key)).size).toBe(PLATE_CELL_COUNT)
    expect(new Set(cells.map((c) => c.r)).size).toBe(PLATE_ROWS)
  })

  it('wechselt zwischen 5 und 4 Feldern je Reihe', () => {
    expect([0, 1, 2, 3, 4, 5].map(plateRowLength)).toEqual([5, 4, 5, 4, 5, 4])
    for (let row = 0; row < PLATE_ROWS; row++) {
      expect(cells.filter((c) => c.r === row)).toHaveLength(plateRowLength(row))
    }
    expect(() => plateRowLength(6)).toThrow()
    expect(() => plateRowLength(-1)).toThrow()
  })

  it('hängt zusammen: jedes Feld hat mindestens zwei Nachbarn auf der Platte', () => {
    const onPlate = new Set(cells.map(key))
    for (const cell of cells) {
      const inside = neighbors(cell).filter((n) => onPlate.has(key(n)))
      expect(inside.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('ist kompakt: kein Feld weiter als sechs Schritte vom Feld links oben', () => {
    for (const cell of cells) expect(distance(hex(0, 0), cell)).toBeLessThanOrEqual(6)
  })

  it('lässt sich verschieben, ohne die Form zu ändern', () => {
    const moved = plateCells(hex(4, -2))
    expect(moved).toHaveLength(PLATE_CELL_COUNT)
    moved.forEach((m, i) => {
      expect(m.q - cells[i].q).toBe(4)
      expect(m.r - cells[i].r).toBe(-2)
    })
  })
})
