import { describe, expect, it } from 'vitest'
import beispiel from '../data/tracks/beispiel-1.json'
import { inventoryFromSets, missingParts } from './catalog'
import { buildSteps } from './steps'
import { type Track, heightInSmall, plateCellKeys, usedParts } from './track'
import { validateTrack } from './validate'

const track = beispiel as Track

describe('Beispielbahn 1', () => {
  it('besteht den Prüfer ohne Befund', () => {
    expect(validateTrack(track)).toEqual([])
  })

  it('kommt mit dem Starter-Set aus', () => {
    const usage = usedParts(track)
    expect(usage).toEqual({
      grundplatte: 1,
      hoehe_gross: 9,
      startstein: 1,
      kurve: 2,
      zielleiter: 1,
      schiene_mittel: 2,
      schiene_kurz: 1,
      kugel: 1,
    })
    expect(missingParts(usage, inventoryFromSets({ starter: 1 }))).toEqual([])
  })

  it('liegt ganz auf einer Grundplatte', () => {
    const onPlate = plateCellKeys(track)
    expect(onPlate.size).toBe(27)
    for (const cell of track.cells) expect(onPlate.has(`${cell.at.q},${cell.at.r}`)).toBe(true)
  })

  it('wird in Schritte zerlegt: Platte, vier Felder, drei Schienen, Kugel', () => {
    const steps = buildSteps(track)
    expect(steps.map((s) => s.kind)).toEqual(['plates', 'cell', 'cell', 'rail', 'cell', 'rail', 'cell', 'rail', 'balls'])
    expect(steps[1].title).toBe('Staple 4 graue Steine. Darauf den Startstein.')
    expect(steps[3].title).toBe('Lege die mittlere Schiene vom Startstein zur Kurve.')
    expect(steps[6].title).toBe('Setze die Zielleiter direkt auf die Platte.')
    expect(steps[8].title).toBe('Kugel in den Startstein. Los!')
  })

  it('verbraucht in den Schritten genau die Teile der Bahn', () => {
    const fromSteps: Record<string, number> = {}
    for (const step of buildSteps(track)) {
      for (const { partId, count } of step.parts) fromSteps[partId] = (fromSteps[partId] ?? 0) + count
    }
    expect(fromSteps).toEqual(usedParts(track))
  })

  it('rechnet Höhen in kleinen Steinen', () => {
    expect(heightInSmall({ large: 2, small: 1 })).toBe(5)
    expect(heightInSmall({ large: 0, small: 0 })).toBe(0)
  })
})
