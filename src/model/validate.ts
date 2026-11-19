/**
 * Der Prüfer: Raster- und Gefälle-Regeln für eine Bahn.
 * Liefert eine Liste von Befunden; leer bedeutet baubar nach den Regeln in src/data/rules.json.
 */
import { RULES, getPart, portsOf } from './catalog'
import { type Axial, equals, key, oppositeDirection, parseKey, straightLine } from './hex'
import { railBetween } from './rail'
import { type Track, type TrackCell, cellMap, heightInSmall, plateCellKeys } from './track'

export interface Issue {
  readonly code: string
  readonly message: string
  readonly at?: string
}

export function validateTrack(track: Track): Issue[] {
  const issues: Issue[] = []
  const onPlate = plateCellKeys(track)
  const cells = cellMap(track)

  // Felder
  const seen = new Set<string>()
  for (const cell of track.cells) {
    const k = key(cell.at)
    if (seen.has(k)) issues.push({ code: 'cell_duplicate', message: `Feld ${k} ist doppelt eingetragen.`, at: k })
    seen.add(k)
    if (!onPlate.has(k)) issues.push({ code: 'cell_off_plate', message: `Feld ${k} liegt auf keiner Grundplatte.`, at: k })
    if (cell.stack.large < 0 || cell.stack.small < 0) issues.push({ code: 'stack_negative', message: `Feld ${k} hat einen negativen Stapel.`, at: k })
    if (cell.tile) {
      const part = getPart(cell.tile.type)
      if (!part) issues.push({ code: 'tile_unknown', message: `Feld ${k}: unbekanntes Teil ${cell.tile.type}.`, at: k })
      else if (!part.portKind) issues.push({ code: 'tile_ports_unknown', message: `Feld ${k}: für ${part.name} sind die Anschlüsse noch nicht erfasst.`, at: k })
      if (!Number.isInteger(cell.tile.rotation) || cell.tile.rotation < 0 || cell.tile.rotation > 5) {
        issues.push({ code: 'rotation_range', message: `Feld ${k}: Drehung muss 0 bis 5 sein.`, at: k })
      }
    }
  }

  // Schienen
  const railByEnds = new Map<string, number>()
  track.rails.forEach((rail, index) => {
    const label = `Schiene ${index + 1}`
    const fit = railBetween(rail.from, rail.to)
    if (!fit) {
      const line = straightLine(rail.from, rail.to)
      issues.push({
        code: line ? 'rail_length' : 'rail_not_straight',
        message: line ? `${label}: ${line.steps - 1} freie Felder passen zu keiner Schiene.` : `${label} liegt nicht auf einer geraden Linie.`,
        at: key(rail.from),
      })
      return
    }
    railByEnds.set(`${key(rail.from)}>${key(rail.to)}`, index)
    const from = cells.get(key(rail.from))
    const to = cells.get(key(rail.to))
    if (!from?.tile || !to?.tile) {
      issues.push({ code: 'rail_end_empty', message: `${label} endet auf einem Feld ohne Baustein.`, at: key(rail.from) })
      return
    }
    for (const between of fit.between) {
      const k = key(between)
      if (!onPlate.has(k)) issues.push({ code: 'rail_off_plate', message: `${label} führt über Feld ${k} außerhalb der Platte.`, at: k })
      if (cells.get(k)?.tile) issues.push({ code: 'rail_over_tile', message: `${label} führt über einen Baustein auf Feld ${k}.`, at: k })
    }
    checkConnection(issues, from, to, fit.direction, label)
    const drop = heightInSmall(from.stack) - heightInSmall(to.stack)
    const minDrop = RULES.slope.minDropLargeByRail[fit.length] * RULES.heights.smallPerLarge
    if (drop < minDrop) {
      issues.push({ code: 'rail_uphill', message: `${label} (${fit.length}) fällt um ${drop / RULES.heights.smallPerLarge} große Steine, nötig sind ${RULES.slope.minDropLargeByRail[fit.length]}.`, at: key(rail.from) })
    }
  })

  // Kugelweg
  if (track.path.length < 2) {
    issues.push({ code: 'path_empty', message: 'Der Kugelweg braucht mindestens Start und Ziel.' })
    return issues
  }
  const pathCells: TrackCell[] = []
  for (const k of track.path) {
    const cell = cells.get(k)
    if (!cell?.tile) {
      issues.push({ code: 'path_unknown_cell', message: `Der Kugelweg nennt Feld ${k}, dort steht kein Baustein.`, at: k })
      return issues
    }
    pathCells.push(cell)
  }
  const first = pathCells[0]
  const last = pathCells[pathCells.length - 1]
  if (getPart(first.tile!.type)?.portKind !== 'start') issues.push({ code: 'path_start_kind', message: 'Der Kugelweg beginnt nicht mit einem Startstein.', at: key(first.at) })
  if (getPart(last.tile!.type)?.portKind !== 'end') issues.push({ code: 'path_end_kind', message: 'Der Kugelweg endet nicht in einem Ziel.', at: key(last.at) })
  if (heightInSmall(last.stack) !== 0) issues.push({ code: 'finish_not_on_plate', message: 'Das Ziel muss direkt auf der Platte stehen.', at: key(last.at) })
  const maxHeight = Math.max(...track.cells.map((c) => heightInSmall(c.stack)))
  if (heightInSmall(first.stack) < maxHeight) issues.push({ code: 'start_not_highest', message: 'Der Startstein muss auf dem höchsten Stapel stehen.', at: key(first.at) })

  let sameHeightRun = 1
  for (let i = 1; i < pathCells.length; i++) {
    const a = pathCells[i - 1]
    const b = pathCells[i]
    const line = straightLine(a.at, b.at)
    if (line?.steps === 1) {
      if (heightInSmall(a.stack) !== heightInSmall(b.stack)) {
        issues.push({ code: 'path_adjacent_height', message: `Nachbarn ${key(a.at)} und ${key(b.at)} müssen gleich hoch sein.`, at: key(b.at) })
      }
      checkConnection(issues, a, b, line.direction, `Übergang ${key(a.at)} zu ${key(b.at)}`)
      sameHeightRun++
      if (sameHeightRun > RULES.slope.maxSameHeightTiles) {
        issues.push({ code: 'path_too_flat', message: `Mehr als ${RULES.slope.maxSameHeightTiles} Bausteine hintereinander auf gleicher Höhe (bei ${key(b.at)}).`, at: key(b.at) })
      }
    } else if (railByEnds.has(`${key(a.at)}>${key(b.at)}`)) {
      sameHeightRun = 1
    } else {
      issues.push({ code: 'path_gap', message: `Zwischen ${key(a.at)} und ${key(b.at)} fehlt eine Schiene oder die Felder sind keine Nachbarn.`, at: key(b.at) })
    }
  }
  return issues
}

/** Hat der Baustein auf from einen Ausgang in direction und der auf to den passenden Eingang? */
function checkConnection(issues: Issue[], from: TrackCell, to: TrackCell, direction: number, label: string): void {
  const fromPart = from.tile ? getPart(from.tile.type) : undefined
  const toPart = to.tile ? getPart(to.tile.type) : undefined
  if (!fromPart?.portKind || !toPart?.portKind || !from.tile || !to.tile) return
  if (fromPart.portKind === 'end') issues.push({ code: 'port_exit_from_end', message: `${label}: aus einem Ziel rollt keine Kugel heraus.`, at: key(from.at) })
  else if (!portsOf(fromPart, from.tile.rotation).includes(direction)) {
    issues.push({ code: 'port_mismatch', message: `${label}: ${fromPart.name} auf ${key(from.at)} hat keinen Ausgang in Richtung ${direction}.`, at: key(from.at) })
  }
  if (toPart.portKind === 'start') issues.push({ code: 'port_enter_start', message: `${label}: in einen Startstein rollt keine Kugel hinein.`, at: key(to.at) })
  else if (!portsOf(toPart, to.tile.rotation).includes(oppositeDirection(direction))) {
    issues.push({ code: 'port_mismatch', message: `${label}: ${toPart.name} auf ${key(to.at)} hat keinen Eingang aus Richtung ${oppositeDirection(direction)}.`, at: key(to.at) })
  }
}

/** Hilfsfunktion für Tests und Werkzeuge: Feld eines Weges als Axial. */
export function pathCell(track: Track, index: number): Axial {
  return parseKey(track.path[index])
}

export function sameCell(a: Axial, b: Axial): boolean {
  return equals(a, b)
}
