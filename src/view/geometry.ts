import { DIRECTIONS, type Point, normalizeDirection, toPixel } from '../model/hex'

/** Mittelpunkt der Kante eines Feldes in Richtung direction. */
export function edgeMidpoint(center: Point, size: number, direction: number): Point {
  const offset = toPixel(DIRECTIONS[normalizeDirection(direction)], size)
  return { x: center.x + offset.x / 2, y: center.y + offset.y / 2 }
}

export function fmt(n: number): string {
  return n.toFixed(2)
}
