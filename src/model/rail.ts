import { type Axial, cellsBetween, straightLine } from './hex'

export type RailLength = 'kurz' | 'mittel' | 'lang'

/** Freie Felder, die eine Schiene überbrückt. Angabe des Nutzers, siehe docs/konzept.md, Regeln der Spielwelt. */
export const RAIL_GAP: Readonly<Record<RailLength, number>> = Object.freeze({ kurz: 1, mittel: 2, lang: 3 })

export const RAIL_LENGTHS: readonly RailLength[] = Object.freeze(['kurz', 'mittel', 'lang'])

export interface RailFit {
  readonly length: RailLength
  readonly direction: number
  readonly between: readonly Axial[]
}

/** Passt eine Schiene zwischen die Felder a und b? Dann Länge, Richtung und überbrückte Felder, sonst null. */
export function railBetween(a: Axial, b: Axial): RailFit | null {
  const line = straightLine(a, b)
  if (!line) return null
  const gap = line.steps - 1
  const length = RAIL_LENGTHS.find((candidate) => RAIL_GAP[candidate] === gap)
  if (!length) return null
  return { length, direction: line.direction, between: cellsBetween(a, b) ?? [] }
}
