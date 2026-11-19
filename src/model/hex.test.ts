import { describe, expect, it } from 'vitest'
import {
  DIRECTIONS,
  cellsBetween,
  distance,
  hex,
  key,
  neighbor,
  neighbors,
  oppositeDirection,
  parseKey,
  rotateDirection,
  straightLine,
  toPixel,
} from './hex'

describe('Sechseck-Raster', () => {
  it('hat sechs verschiedene Nachbarn im Abstand 1', () => {
    const center = hex(2, -1)
    const around = neighbors(center)
    expect(around).toHaveLength(6)
    for (const cell of around) expect(distance(center, cell)).toBe(1)
    expect(new Set(around.map(key)).size).toBe(6)
  })

  it('misst Abstände wie auf dem Brett', () => {
    expect(distance(hex(0, 0), hex(0, 0))).toBe(0)
    expect(distance(hex(0, 0), hex(3, 0))).toBe(3)
    expect(distance(hex(0, 0), hex(0, 3))).toBe(3)
    expect(distance(hex(0, 0), hex(3, -3))).toBe(3)
    expect(distance(hex(0, 0), hex(1, 1))).toBe(2)
    expect(distance(hex(0, 0), hex(-2, 1))).toBe(2)
  })

  it('erkennt gerade Linien in allen sechs Richtungen', () => {
    DIRECTIONS.forEach((d, direction) => {
      const target = hex(d.q * 3, d.r * 3)
      expect(straightLine(hex(0, 0), target)).toEqual({ direction, steps: 3 })
    })
  })

  it('erkennt, was keine gerade Linie ist', () => {
    expect(straightLine(hex(0, 0), hex(0, 0))).toBeNull()
    expect(straightLine(hex(0, 0), hex(1, 1))).toBeNull()
    expect(straightLine(hex(0, 0), hex(2, -1))).toBeNull()
    expect(cellsBetween(hex(0, 0), hex(1, 1))).toBeNull()
  })

  it('liefert die Felder zwischen zwei Enden', () => {
    expect(cellsBetween(hex(0, 0), hex(3, 0))).toEqual([hex(1, 0), hex(2, 0)])
    expect(cellsBetween(hex(0, 0), hex(1, 0))).toEqual([])
    expect(cellsBetween(hex(1, 1), hex(1, -2))).toEqual([hex(1, 0), hex(1, -1)])
  })

  it('dreht Richtungen im Kreis', () => {
    expect(rotateDirection(5, 1)).toBe(0)
    expect(rotateDirection(0, -1)).toBe(5)
    expect(rotateDirection(2, 13)).toBe(3)
    expect(oppositeDirection(1)).toBe(4)
    expect(neighbor(hex(0, 0), 6)).toEqual(hex(1, 0))
  })

  it('wandelt Schlüssel hin und zurück', () => {
    const cell = hex(-3, 7)
    expect(parseKey(key(cell))).toEqual(cell)
    expect(() => parseKey('1,2,3')).toThrow()
    expect(() => parseKey('a,b')).toThrow()
    expect(() => parseKey('1.5,2')).toThrow()
  })

  it('legt Reihen waagerecht und um ein halbes Feld versetzt', () => {
    const size = 10
    const a = toPixel(hex(0, 0), size)
    const right = toPixel(hex(1, 0), size)
    const below = toPixel(hex(0, 1), size)
    expect(right.y).toBe(a.y)
    expect(right.x - a.x).toBeCloseTo(size * Math.sqrt(3))
    expect(below.x - a.x).toBeCloseTo((size * Math.sqrt(3)) / 2)
    expect(below.y - a.y).toBeCloseTo(size * 1.5)
  })
})
