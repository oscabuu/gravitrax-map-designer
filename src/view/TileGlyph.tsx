import { type Part, portsOf } from '../model/catalog'
import type { Point } from '../model/hex'
import { edgeMidpoint, fmt } from './geometry'

interface TileGlyphProps {
  readonly part: Part
  readonly rotation: number
  readonly center: Point
  readonly size: number
}

/** Symbol eines Bausteins von oben: Rinne, Startstein mit drei Kugeln oder Zielleiter. Nur Darstellung. */
export function TileGlyph({ part, rotation, center, size }: TileGlyphProps) {
  const ports = portsOf(part, rotation)
  const trackWidth = size * 0.3

  if (part.portKind === 'through' && ports.length >= 2) {
    const a = edgeMidpoint(center, size, ports[0])
    const b = edgeMidpoint(center, size, ports[1])
    return (
      <path
        className="tile__track"
        d={`M${fmt(a.x)} ${fmt(a.y)} Q${fmt(center.x)} ${fmt(center.y)} ${fmt(b.x)} ${fmt(b.y)}`}
        strokeWidth={trackWidth}
      />
    )
  }

  if (part.portKind === 'start' && ports.length >= 1) {
    const exit = edgeMidpoint(center, size, ports[0])
    const dx = exit.x - center.x
    const dy = exit.y - center.y
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len
    const py = dx / len
    const back = { x: center.x - dx * 0.45, y: center.y - dy * 0.45 }
    return (
      <g>
        <path className="tile__track" d={`M${fmt(back.x)} ${fmt(back.y)} L${fmt(exit.x)} ${fmt(exit.y)}`} strokeWidth={trackWidth} />
        {[-1, 0, 1].map((k) => (
          <circle
            key={k}
            className="tile__ball"
            cx={fmt(back.x + px * k * size * 0.3)}
            cy={fmt(back.y + py * k * size * 0.3)}
            r={fmt(size * 0.12)}
          />
        ))}
      </g>
    )
  }

  if (part.portKind === 'end' && ports.length >= 1) {
    const entry = edgeMidpoint(center, size, ports[0])
    const dx = center.x - entry.x
    const dy = center.y - entry.y
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len
    const py = dx / len
    const rungs = [0.35, 0.6, 0.85].map((t) => ({ x: entry.x + dx * t, y: entry.y + dy * t }))
    return (
      <g>
        <path className="tile__track" d={`M${fmt(entry.x)} ${fmt(entry.y)} L${fmt(center.x + dx * 0.2)} ${fmt(center.y + dy * 0.2)}`} strokeWidth={trackWidth} />
        {rungs.map((r, i) => (
          <line
            key={i}
            className="tile__rung"
            x1={fmt(r.x - px * size * 0.28)}
            y1={fmt(r.y - py * size * 0.28)}
            x2={fmt(r.x + px * size * 0.28)}
            y2={fmt(r.y + py * size * 0.28)}
          />
        ))}
      </g>
    )
  }

  return (
    <text className="tile__label" x={fmt(center.x)} y={fmt(center.y + size * 0.15)} textAnchor="middle" fontSize={fmt(size * 0.45)}>
      {part.name.slice(0, 2)}
    </text>
  )
}
