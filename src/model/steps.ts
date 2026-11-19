/**
 * Der Anleitungs-Erzeuger: zerlegt eine Bahn in Bauschritte wie bei einer Lego-Anleitung.
 * Reihenfolge: Platten, dann dem Kugelweg folgend je Feld Stapel und Baustein, nach jedem erreichten Feld
 * die Schiene dorthin, zuletzt die Kugel.
 */
import { requirePart } from './catalog'
import { key, parseKey } from './hex'
import { railBetween } from './rail'
import { type Track, type TrackCell, cellMap } from './track'

export type StepKind = 'plates' | 'cell' | 'rail' | 'balls'

export interface PartCount {
  readonly partId: string
  readonly count: number
}

export interface Step {
  readonly kind: StepKind
  /** Kurzer, vorlesbarer Satz. */
  readonly title: string
  readonly parts: readonly PartCount[]
  /** Feldschlüssel, die in diesem Schritt neu dazukommen. */
  readonly cells: readonly string[]
  /** Indizes in track.rails, die in diesem Schritt neu dazukommen. */
  readonly rails: readonly number[]
}

const RAIL_WORD = { kurz: 'kurze', mittel: 'mittlere', lang: 'lange' } as const

export function buildSteps(track: Track): Step[] {
  const steps: Step[] = []
  const cells = cellMap(track)

  steps.push({
    kind: 'plates',
    title: track.plates.length === 1 ? 'Lege die Grundplatte hin.' : `Lege ${track.plates.length} Grundplatten zusammen.`,
    parts: [{ partId: 'grundplatte', count: track.plates.length }],
    cells: [],
    rails: [],
  })

  track.path.forEach((cellKey, index) => {
    const cell = cells.get(cellKey)
    if (!cell?.tile) throw new Error(`Kugelweg nennt Feld ${cellKey} ohne Baustein`)
    steps.push(cellStep(cell))
    if (index === 0) return
    const previous = parseKey(track.path[index - 1])
    const railIndex = track.rails.findIndex((r) => key(r.from) === key(previous) && key(r.to) === cellKey)
    if (railIndex < 0) return
    const fit = railBetween(previous, cell.at)
    if (!fit) return
    const fromName = cells.get(key(previous))?.tile ? requirePart(cells.get(key(previous))!.tile!.type).name : 'Baustein'
    steps.push({
      kind: 'rail',
      title: `Lege die ${RAIL_WORD[fit.length]} Schiene ${withArticle(fromName)} zur ${requirePart(cell.tile.type).name}.`,
      parts: [{ partId: `schiene_${fit.length}`, count: 1 }],
      cells: [],
      rails: [railIndex],
    })
  })

  steps.push({
    kind: 'balls',
    title: 'Kugel in den Startstein. Los!',
    parts: [{ partId: 'kugel', count: 1 }],
    cells: [],
    rails: [],
  })
  return steps
}

function cellStep(cell: TrackCell): Step {
  const part = requirePart(cell.tile!.type)
  const parts: PartCount[] = []
  if (cell.stack.large > 0) parts.push({ partId: 'hoehe_gross', count: cell.stack.large })
  if (cell.stack.small > 0) parts.push({ partId: 'hoehe_klein', count: cell.stack.small })
  parts.push({ partId: part.id, count: 1 })
  return { kind: 'cell', title: cellTitle(cell, part.name), parts, cells: [key(cell.at)], rails: [] }
}

function cellTitle(cell: TrackCell, partName: string): string {
  const { large, small } = cell.stack
  if (large === 0 && small === 0) return `Setze ${withArticle(partName, 'akkusativ')} direkt auf die Platte.`
  const pieces: string[] = []
  if (large > 0) pieces.push(large === 1 ? 'einen grauen Stein' : `${large} graue Steine`)
  if (small > 0) pieces.push(small === 1 ? 'einen schwarzen Stein' : `${small} schwarze Steine`)
  return `Staple ${pieces.join(' und ')}. Darauf ${withArticle(partName, 'akkusativ')}.`
}

/** Artikel für die Teilenamen aus dem Katalog; Standard ist "die". */
function withArticle(name: string, kasus: 'dativ' | 'akkusativ' = 'dativ'): string {
  const masculine = name.endsWith('stein')
  if (kasus === 'akkusativ') return `${masculine ? 'den' : 'die'} ${name}`
  return `${masculine ? 'vom' : 'von der'} ${name}`
}
