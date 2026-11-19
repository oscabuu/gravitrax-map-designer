import { describe, expect, it } from 'vitest'
import { PARTS, RULES, SETS, getPart, getSet, inventoryFromSets, missingParts, portsOf, requirePart } from './catalog'

describe('Teile-Katalog', () => {
  it('hat eindeutige Kennungen und Namen', () => {
    expect(new Set(PARTS.map((p) => p.id)).size).toBe(PARTS.length)
    for (const part of PARTS) expect(part.name.length).toBeGreaterThan(0)
  })

  it('kennt nur Richtungen 0 bis 5 als Anschlüsse', () => {
    for (const part of PARTS) {
      for (const port of part.ports ?? []) expect(port).toBeGreaterThanOrEqual(0)
      for (const port of part.ports ?? []) expect(port).toBeLessThanOrEqual(5)
      if (part.ports) expect(part.portKind).toBeDefined()
    }
  })

  it('dreht Anschlüsse mit dem Baustein', () => {
    expect(portsOf(requirePart('kurve'), 0)).toEqual([0, 2])
    expect(portsOf(requirePart('kurve'), 4)).toEqual([4, 0])
    expect(portsOf(requirePart('startstein'), 3)).toEqual([3])
  })

  it('wirft bei unbekannten Teilen', () => {
    expect(getPart('gibt_es_nicht')).toBeUndefined()
    expect(() => requirePart('gibt_es_nicht')).toThrow()
  })
})

describe('Starter-Set', () => {
  const starter = getSet('starter')!

  it('zählt 124 Teile, wie auf Seite 3 der Anleitung', () => {
    const sum = Object.values(starter.contents).reduce((a, b) => a + b, 0)
    expect(sum).toBe(starter.pieces)
    expect(starter.pieces).toBe(124)
  })

  it('nennt nur Teile aus dem Katalog', () => {
    for (const partId of Object.keys(starter.contents)) expect(getPart(partId), partId).toBeDefined()
  })

  it('ergibt den Bestand, auch mehrfach', () => {
    expect(inventoryFromSets({ starter: 1 }).kurve).toBe(21)
    expect(inventoryFromSets({ starter: 2 }).hoehe_gross).toBe(80)
    expect(() => inventoryFromSets({ fantasie: 1 })).toThrow()
    expect(SETS.length).toBeGreaterThanOrEqual(1)
  })

  it('findet fehlende Teile', () => {
    const inventory = inventoryFromSets({ starter: 1 })
    expect(missingParts({ kurve: 21, startstein: 1 }, inventory)).toEqual([])
    expect(missingParts({ kurve: 22, schiene_lang: 5 }, inventory)).toEqual([
      { partId: 'kurve', needed: 22, available: 21 },
      { partId: 'schiene_lang', needed: 5, available: 3 },
    ])
  })
})

describe('Regelwerte', () => {
  it('haben sinnvolle Startwerte', () => {
    expect(RULES.heights.smallPerLarge).toBeGreaterThan(0)
    expect(RULES.slope.minDropLargeByRail.lang).toBeGreaterThanOrEqual(RULES.slope.minDropLargeByRail.kurz)
    expect(RULES.slope.maxSameHeightTiles).toBeGreaterThanOrEqual(1)
  })
})
