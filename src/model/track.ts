/**
 * Eine Bahn: Platten, Felder mit Höhenstapel und Baustein, Schienen und der Kugelweg.
 * Reine Datenstruktur plus Hilfsfunktionen. Das Format ist in docs/architektur.md beschrieben.
 */
import { RULES } from './catalog'
import { type Axial, key } from './hex'
import { plateCells } from './plate'
import { railBetween } from './rail'

export interface Stack {
  readonly large: number
  readonly small: number
}

export interface TileRef {
  readonly type: string
  readonly rotation: number
}

export interface TrackCell {
  readonly at: Axial
  readonly stack: Stack
  readonly tile?: TileRef
}

export interface Rail {
  readonly from: Axial
  readonly to: Axial
}

export interface Track {
  readonly version: 1
  readonly id: string
  readonly name: string
  readonly plates: readonly Axial[]
  readonly cells: readonly TrackCell[]
  readonly rails: readonly Rail[]
  /** Kugelweg vom Start zum Ziel als Feldschlüssel "q,r". */
  readonly path: readonly string[]
}

export const EMPTY_STACK: Stack = Object.freeze({ large: 0, small: 0 })

/** Höhe eines Stapels in kleinen Höhensteinen, nach dem Regelwert smallPerLarge. */
export function heightInSmall(stack: Stack): number {
  return stack.large * RULES.heights.smallPerLarge + stack.small
}

export function cellMap(track: Track): Map<string, TrackCell> {
  return new Map(track.cells.map((c) => [key(c.at), c]))
}

/** Alle Felder, die auf einer Platte der Bahn liegen. */
export function plateCellKeys(track: Track): Set<string> {
  const keys = new Set<string>()
  for (const origin of track.plates) for (const cell of plateCells(origin)) keys.add(key(cell))
  return keys
}

/** Bedarf an Teilen für die ganze Bahn, inklusive einer Kugel. */
export function usedParts(track: Track): Record<string, number> {
  const counts: Record<string, number> = {}
  const bump = (id: string, n: number) => {
    if (n > 0) counts[id] = (counts[id] ?? 0) + n
  }
  bump('grundplatte', track.plates.length)
  for (const cell of track.cells) {
    bump('hoehe_gross', cell.stack.large)
    bump('hoehe_klein', cell.stack.small)
    if (cell.tile) bump(cell.tile.type, 1)
  }
  for (const rail of track.rails) {
    const fit = railBetween(rail.from, rail.to)
    if (fit) bump(`schiene_${fit.length}`, 1)
  }
  bump('kugel', 1)
  return counts
}
