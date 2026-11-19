import { hexagonPoints, key, toPixel } from '../model/hex'
import { plateCells } from '../model/plate'

interface PlateViewProps {
  /** Radius eines Feldes in SVG-Einheiten. */
  readonly size?: number
}

/** Zeichnet eine Grundplatte von oben. Nur Darstellung, keine Logik. */
export function PlateView({ size = 34 }: PlateViewProps) {
  const drawn = plateCells().map((cell) => ({ cell, center: toPixel(cell, size) }))
  const xs = drawn.map((d) => d.center.x)
  const ys = drawn.map((d) => d.center.y)
  const pad = size + 4
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad

  return (
    <svg
      className="plate"
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      role="img"
      aria-label="Eine Grundplatte mit 27 Feldern"
    >
      {drawn.map(({ cell, center }) => (
        <polygon key={key(cell)} className="plate__cell" points={hexagonPoints(center, size - 2)} />
      ))}
    </svg>
  )
}
