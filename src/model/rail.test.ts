import { describe, expect, it } from 'vitest'
import { hex } from './hex'
import { RAIL_GAP, railBetween } from './rail'

describe('Schienen', () => {
  it('überbrücken 1, 2 oder 3 freie Felder', () => {
    expect(RAIL_GAP).toEqual({ kurz: 1, mittel: 2, lang: 3 })
    expect(railBetween(hex(0, 0), hex(2, 0))?.length).toBe('kurz')
    expect(railBetween(hex(0, 0), hex(3, 0))?.length).toBe('mittel')
    expect(railBetween(hex(0, 0), hex(4, 0))?.length).toBe('lang')
  })

  it('passen nicht zwischen direkte Nachbarn oder über zu weite Lücken', () => {
    expect(railBetween(hex(0, 0), hex(1, 0))).toBeNull()
    expect(railBetween(hex(0, 0), hex(5, 0))).toBeNull()
    expect(railBetween(hex(0, 0), hex(0, 0))).toBeNull()
  })

  it('brauchen eine gerade Linie', () => {
    expect(railBetween(hex(0, 0), hex(2, 1))).toBeNull()
  })

  it('nennen Richtung und überbrückte Felder', () => {
    const fit = railBetween(hex(1, 1), hex(1, -2))
    expect(fit).not.toBeNull()
    expect(fit?.direction).toBe(2)
    expect(fit?.between).toEqual([hex(1, 0), hex(1, -1)])
  })
})
