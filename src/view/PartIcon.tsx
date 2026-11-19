import { type Part, getPart } from '../model/catalog'
import { hexagonPoints } from '../model/hex'
import { TileGlyph } from './TileGlyph'

interface PartIconProps {
  readonly partId: string
  readonly px?: number
}

/** Kleines Bild eines Teils für die Teileliste eines Schritts. */
export function PartIcon({ partId, px = 56 }: PartIconProps) {
  const part = getPart(partId)
  const size = px * 0.44
  const c = { x: px / 2, y: px / 2 }
  return (
    <svg className="part-icon" viewBox={`0 0 ${px} ${px}`} width={px} height={px} role="img" aria-label={part?.name ?? partId}>
      {iconBody(part, partId, c, size, px)}
    </svg>
  )
}

function iconBody(part: Part | undefined, partId: string, c: { x: number; y: number }, size: number, px: number) {
  if (partId === 'hoehe_gross') return <polygon className="icon__large" points={hexagonPoints(c, size)} />
  if (partId === 'hoehe_klein') return <polygon className="icon__small" points={hexagonPoints(c, size)} />
  if (partId === 'grundplatte') {
    return (
      <g className="icon__plate">
        {[-1, 0, 1].map((k) => (
          <polygon key={k} points={hexagonPoints({ x: c.x + k * size * 0.95, y: c.y }, size * 0.5)} />
        ))}
      </g>
    )
  }
  if (partId.startsWith('schiene_')) {
    const gap = part?.gap ?? 1
    const half = (px * (0.25 + gap * 0.12)) / 2
    return <line className="icon__rail" x1={c.x - half} y1={c.y} x2={c.x + half} y2={c.y} strokeWidth={px * 0.14} />
  }
  if (partId === 'kugel') return <circle className="icon__ball" cx={c.x} cy={c.y} r={size * 0.55} />
  return (
    <g className="cell">
      <polygon className="cell__tile" points={hexagonPoints(c, size)} />
      {part && <TileGlyph part={part} rotation={0} center={c} size={size} />}
    </g>
  )
}
