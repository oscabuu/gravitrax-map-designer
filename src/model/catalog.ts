/**
 * Teile-Katalog, Set-Inhalte und Regelwerte aus src/data/*.json.
 * Reine Logik ohne Oberfläche. Ein neues Teil oder Set ist ein Eintrag in den Daten, kein Code.
 */
import partsJson from '../data/parts.json'
import rulesJson from '../data/rules.json'
import setsJson from '../data/sets.json'
import { rotateDirection } from './hex'
import type { RailLength } from './rail'

export type PartGroup = 'grundplatte' | 'hoehe' | 'schiene' | 'baustein' | 'aktionsstein' | 'sonstiges'

/** start = nur Ausgang, end = nur Eingang, through = Kugel rollt hindurch (beide Richtungen). */
export type PortKind = 'start' | 'end' | 'through'

export interface Part {
  readonly id: string
  readonly name: string
  readonly group: PartGroup
  /** false = Annahme, die am echten Teil noch zu prüfen ist (siehe docs/aufgaben.md). */
  readonly verified: boolean
  readonly note?: string
  readonly portKind?: PortKind
  /** Richtungen 0..5 der Anschlüsse bei Drehung 0. */
  readonly ports?: readonly number[]
  /** Für Schienen: überbrückte freie Felder. */
  readonly gap?: number
}

export interface PartSet {
  readonly id: string
  readonly name: string
  readonly pieces: number
  readonly contents: Readonly<Record<string, number>>
}

export interface Rules {
  readonly heights: { readonly smallPerLarge: number; readonly verified: boolean }
  readonly slope: {
    readonly minDropLargeByRail: Readonly<Record<RailLength, number>>
    readonly maxSameHeightTiles: number
    readonly verified: boolean
  }
}

/** Anzahl je Teil-Kennung, zum Beispiel ein Bestand oder ein Bedarf. */
export type PartCounts = Readonly<Record<string, number>>

export const PARTS: readonly Part[] = partsJson.parts as readonly Part[]
export const SETS: readonly PartSet[] = setsJson.sets as readonly PartSet[]
export const RULES: Rules = rulesJson as Rules

const PART_INDEX: ReadonlyMap<string, Part> = new Map(PARTS.map((p) => [p.id, p]))

export function getPart(id: string): Part | undefined {
  return PART_INDEX.get(id)
}

export function requirePart(id: string): Part {
  const part = PART_INDEX.get(id)
  if (!part) throw new Error(`Unbekanntes Teil: ${id}`)
  return part
}

export function getSet(id: string): PartSet | undefined {
  return SETS.find((s) => s.id === id)
}

/** Anschlüsse eines Bausteins nach Drehung (0..5 Stufen). */
export function portsOf(part: Part, rotation: number): number[] {
  return (part.ports ?? []).map((p) => rotateDirection(p, rotation))
}

/** Bestand aus Sets mit Anzahl, zum Beispiel { starter: 1 }. */
export function inventoryFromSets(setCounts: PartCounts): PartCounts {
  const inventory: Record<string, number> = {}
  for (const [setId, times] of Object.entries(setCounts)) {
    const set = getSet(setId)
    if (!set) throw new Error(`Unbekanntes Set: ${setId}`)
    for (const [partId, count] of Object.entries(set.contents)) {
      inventory[partId] = (inventory[partId] ?? 0) + count * times
    }
  }
  return inventory
}

export interface Shortage {
  readonly partId: string
  readonly needed: number
  readonly available: number
}

/** Welche Teile fehlen, wenn usage mit inventory gebaut werden soll. */
export function missingParts(usage: PartCounts, inventory: PartCounts): Shortage[] {
  const shortages: Shortage[] = []
  for (const [partId, needed] of Object.entries(usage)) {
    const available = inventory[partId] ?? 0
    if (needed > available) shortages.push({ partId, needed, available })
  }
  return shortages
}
