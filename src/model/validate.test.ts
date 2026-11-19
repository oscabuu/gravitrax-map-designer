import { describe, expect, it } from 'vitest'
import beispiel from '../data/tracks/beispiel-1.json'
import type { Track, TrackCell } from './track'
import { validateTrack } from './validate'

const base = beispiel as Track

function withCells(cells: readonly TrackCell[]): Track {
  return { ...base, cells }
}

function codes(track: Track): string[] {
  return validateTrack(track).map((i) => i.code)
}

describe('Prüfer', () => {
  it('meldet Felder außerhalb der Platte', () => {
    const cells = base.cells.map((c, i) => (i === 1 ? { ...c, at: { q: 9, r: 0 } } : c))
    expect(codes(withCells(cells))).toContain('cell_off_plate')
  })

  it('meldet Bausteine unter einer Schiene', () => {
    const cells = [...base.cells, { at: { q: 2, r: 0 }, stack: { large: 0, small: 0 }, tile: { type: 'kurve', rotation: 0 } }]
    expect(codes(withCells(cells))).toContain('rail_over_tile')
  })

  it('meldet Schienen, die bergauf führen', () => {
    const cells = base.cells.map((c, i) => (i === 1 ? { ...c, stack: { large: 4, small: 0 } } : c))
    expect(codes(withCells(cells))).toContain('rail_uphill')
  })

  it('meldet zu lange und krumme Schienen', () => {
    expect(codes({ ...base, rails: [...base.rails, { from: { q: 4, r: 0 }, to: { q: -1, r: 0 } }] })).toContain('rail_length')
    expect(codes({ ...base, rails: [...base.rails, { from: { q: 4, r: 0 }, to: { q: 1, r: 2 } }] })).toContain('rail_not_straight')
  })

  it('meldet falsch gedrehte Bausteine', () => {
    const cells = base.cells.map((c, i) => (i === 1 ? { ...c, tile: { type: 'kurve', rotation: 0 } } : c))
    expect(codes(withCells(cells))).toContain('port_mismatch')
  })

  it('meldet ein Ziel, das nicht auf der Platte steht, und einen Start, der nicht oben ist', () => {
    const cells = base.cells.map((c, i) => (i === 3 ? { ...c, stack: { large: 1, small: 0 } } : c))
    expect(codes(withCells(cells))).toContain('finish_not_on_plate')
    const lowStart = base.cells.map((c, i) => (i === 0 ? { ...c, stack: { large: 2, small: 0 } } : c))
    expect(codes(withCells(lowStart))).toContain('start_not_highest')
  })

  it('meldet Lücken im Kugelweg', () => {
    expect(codes({ ...base, rails: base.rails.slice(0, 2) })).toContain('path_gap')
    expect(codes({ ...base, path: ['4,0'] })).toContain('path_empty')
    expect(codes({ ...base, path: ['4,0', '0,0'] })).toContain('path_unknown_cell')
  })

  it('meldet Bausteine ohne erfasste Anschlüsse', () => {
    const cells = base.cells.map((c, i) => (i === 1 ? { ...c, tile: { type: 'freifall', rotation: 0 } } : c))
    expect(codes(withCells(cells))).toContain('tile_ports_unknown')
  })
})
