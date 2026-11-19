import { getPart } from '../model/catalog'
import { type Point, hexagonPoints, key, straightLine, toPixel } from '../model/hex'
import { plateCells } from '../model/plate'
import type { Track } from '../model/track'
import { TileGlyph } from './TileGlyph'
import { edgeMidpoint, fmt } from './geometry'

/** shown = normal, new = farbig hervorgehoben, hidden = noch nicht gebaut. */
export type ElementState = 'shown' | 'new' | 'hidden'

interface TrackViewProps {
  readonly track: Track
  readonly cellState?: (cellKey: string) => ElementState
  readonly railState?: (railIndex: number) => ElementState
  readonly size?: number
}

const SHOW_ALL = () => 'shown' as const

/** Zeichnet eine Bahn von oben: Platten, Höhenstapel, Bausteine, Schienen. Nur Darstellung. */
export function TrackView({ track, cellState = SHOW_ALL, railState = SHOW_ALL, size = 34 }: TrackViewProps) {
  const plate = track.plates.flatMap((origin) => plateCells(origin))
  const centers = plate.map((cell) => toPixel(cell, size))
  const pad = size + 4
  const minX = Math.min(...centers.map((c) => c.x)) - pad
  const maxX = Math.max(...centers.map((c) => c.x)) + pad
  const minY = Math.min(...centers.map((c) => c.y)) - pad
  const maxY = Math.max(...centers.map((c) => c.y)) + pad

  return (
    <svg className="track" viewBox={`${fmt(minX)} ${fmt(minY)} ${fmt(maxX - minX)} ${fmt(maxY - minY)}`} role="img" aria-label={track.name}>
      <g className="track__plate">
        {plate.map((cell, i) => (
          <polygon key={key(cell)} className="plate__cell" points={hexagonPoints(centers[i], size - 2)} />
        ))}
      </g>
      <g className="track__rails">
        {track.rails.map((rail, index) => {
          const state = railState(index)
          if (state === 'hidden') return null
          const line = railLine(rail.from, rail.to, size)
          return (
            <line
              key={index}
              className={`rail${state === 'new' ? ' is-new' : ''}`}
              x1={fmt(line.a.x)}
              y1={fmt(line.a.y)}
              x2={fmt(line.b.x)}
              y2={fmt(line.b.y)}
              strokeWidth={fmt(size * 0.32)}
            />
          )
        })}
      </g>
      <g className="track__cells">
        {track.cells.map((cell) => {
          const k = key(cell.at)
          const state = cellState(k)
          if (state === 'hidden') return null
          const center = toPixel(cell.at, size)
          const part = cell.tile ? getPart(cell.tile.type) : undefined
          return (
            <g key={k} className={`cell${state === 'new' ? ' is-new' : ''}`}>
              <polygon className="cell__tile" points={hexagonPoints(center, size - 3)} />
              {part && cell.tile && <TileGlyph part={part} rotation={cell.tile.rotation} center={center} size={size} />}
              <StackBadge center={center} size={size} large={cell.stack.large} small={cell.stack.small} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/**
 * Höhe eines Feldes als Zahl in den unteren Ecken: links grau = große Steine, rechts schwarz = kleine.
 * Die Ecken werden von keiner Rinne gekreuzt, darum bleibt die Zahl immer lesbar.
 */
function StackBadge({ center, size, large, small }: { center: Point; size: number; large: number; small: number }) {
  if (large === 0 && small === 0) return null
  const r = size * 0.27
  const badges: { x: number; y: number; kind: 'large' | 'small'; count: number }[] = []
  if (large > 0) badges.push({ x: center.x - size * 0.78, y: center.y + size * 0.5, kind: 'large', count: large })
  if (small > 0) badges.push({ x: center.x + size * 0.78, y: center.y + size * 0.5, kind: 'small', count: small })
  return (
    <g className="stack">
      {badges.map((b) => (
        <g key={b.kind} className={`stack__${b.kind}`}>
          <circle cx={fmt(b.x)} cy={fmt(b.y)} r={fmt(r)} />
          <text x={fmt(b.x)} y={fmt(b.y + r * 0.38)} textAnchor="middle" fontSize={fmt(r * 1.25)}>
            {b.count}
          </text>
        </g>
      ))}
    </g>
  )
}

/** Schiene von Kantenmitte zu Kantenmitte, damit sie die Lücke zwischen den Bausteinen füllt. */
function railLine(from: { q: number; r: number }, to: { q: number; r: number }, size: number): { a: Point; b: Point } {
  const ca = toPixel(from, size)
  const cb = toPixel(to, size)
  const dir = straightLine(from, to)?.direction ?? null
  const a = dir === null ? ca : edgeMidpoint(ca, size, dir)
  const b = dir === null ? cb : edgeMidpoint(cb, size, (dir + 3) % 6)
  return { a, b }
}
