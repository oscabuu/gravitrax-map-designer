/**
 * Sechseck-Raster in Axialkoordinaten (q, r), Spitze oben ("pointy top"):
 * Reihen laufen waagerecht, r zählt nach unten, q nach rechts.
 * Reine Funktionen ohne Abhängigkeiten. Siehe docs/architektur.md.
 */

export interface Axial {
  readonly q: number
  readonly r: number
}

/** Die sechs Nachbarrichtungen gegen den Uhrzeigersinn, 0 = rechts (Osten). */
export const DIRECTIONS: readonly Axial[] = Object.freeze([
  Object.freeze({ q: 1, r: 0 }), // 0: Osten
  Object.freeze({ q: 1, r: -1 }), // 1: Nordosten
  Object.freeze({ q: 0, r: -1 }), // 2: Nordwesten
  Object.freeze({ q: -1, r: 0 }), // 3: Westen
  Object.freeze({ q: -1, r: 1 }), // 4: Südwesten
  Object.freeze({ q: 0, r: 1 }), // 5: Südosten
])

export const DIRECTION_COUNT = 6

export function hex(q: number, r: number): Axial {
  return { q, r }
}

export function add(a: Axial, b: Axial): Axial {
  return { q: a.q + b.q, r: a.r + b.r }
}

export function subtract(a: Axial, b: Axial): Axial {
  return { q: a.q - b.q, r: a.r - b.r }
}

export function scale(a: Axial, factor: number): Axial {
  return { q: a.q * factor, r: a.r * factor }
}

export function equals(a: Axial, b: Axial): boolean {
  return a.q === b.q && a.r === b.r
}

/** Schlüssel für Maps und Sets, zum Beispiel "2,-1". */
export function key(h: Axial): string {
  return `${h.q},${h.r}`
}

export function parseKey(k: string): Axial {
  const parts = k.split(',')
  if (parts.length !== 2) throw new Error(`Ungültiger Feldschlüssel: ${k}`)
  const q = Number(parts[0])
  const r = Number(parts[1])
  if (!Number.isInteger(q) || !Number.isInteger(r)) throw new Error(`Ungültiger Feldschlüssel: ${k}`)
  return { q, r }
}

/** Richtung auf 0..5 bringen, auch bei negativen oder großen Werten. */
export function normalizeDirection(direction: number): number {
  return ((direction % DIRECTION_COUNT) + DIRECTION_COUNT) % DIRECTION_COUNT
}

export function rotateDirection(direction: number, steps: number): number {
  return normalizeDirection(direction + steps)
}

export function oppositeDirection(direction: number): number {
  return rotateDirection(direction, 3)
}

export function neighbor(h: Axial, direction: number): Axial {
  return add(h, DIRECTIONS[normalizeDirection(direction)])
}

export function neighbors(h: Axial): Axial[] {
  return DIRECTIONS.map((d) => add(h, d))
}

/** Abstand in Feldern, also der kürzeste Weg über Nachbarn. */
export function distance(a: Axial, b: Axial): number {
  const dq = a.q - b.q
  const dr = a.r - b.r
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2
}

export interface StraightLine {
  readonly direction: number
  readonly steps: number
}

/** Liegt b von a aus auf einer geraden Rasterlinie? Dann Richtung und Schrittzahl (mindestens 1), sonst null. */
export function straightLine(a: Axial, b: Axial): StraightLine | null {
  const steps = distance(a, b)
  if (steps === 0) return null
  const delta = subtract(b, a)
  for (let direction = 0; direction < DIRECTION_COUNT; direction++) {
    if (equals(scale(DIRECTIONS[direction], steps), delta)) return { direction, steps }
  }
  return null
}

/** Die Felder strikt zwischen a und b auf einer geraden Linie; null, wenn es keine gerade Linie gibt. */
export function cellsBetween(a: Axial, b: Axial): Axial[] | null {
  const line = straightLine(a, b)
  if (!line) return null
  const cells: Axial[] = []
  for (let i = 1; i < line.steps; i++) cells.push(add(a, scale(DIRECTIONS[line.direction], i)))
  return cells
}

export interface Point {
  readonly x: number
  readonly y: number
}

/** Mittelpunkt eines Feldes in Bildkoordinaten; size = Radius von der Mitte bis zu einer Ecke. */
export function toPixel(h: Axial, size: number): Point {
  return { x: size * Math.sqrt(3) * (h.q + h.r / 2), y: size * 1.5 * h.r }
}

/** Eckpunkte eines Sechsecks mit Spitze oben, als Text für das SVG-Attribut "points". */
export function hexagonPoints(center: Point, size: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    const x = center.x + size * Math.cos(angle)
    const y = center.y + size * Math.sin(angle)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}
