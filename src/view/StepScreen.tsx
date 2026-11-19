import { useMemo } from 'react'
import { getPart } from '../model/catalog'
import type { Step } from '../model/steps'
import type { Track } from '../model/track'
import { PartIcon } from './PartIcon'
import { type ElementState, TrackView } from './TrackView'

interface StepScreenProps {
  readonly track: Track
  readonly steps: readonly Step[]
  readonly index: number
  readonly onPrevious: () => void
  readonly onNext: () => void
  readonly onFinish: () => void
}

/** Ein Bauschritt: Satz, Teile des Schritts, Zeichnung mit Hervorhebung, große Pfeile. */
export function StepScreen({ track, steps, index, onPrevious, onNext, onFinish }: StepScreenProps) {
  const step = steps[index]
  const isLast = index === steps.length - 1

  const { cellState, railState } = useMemo(() => {
    const doneCells = new Set<string>()
    const doneRails = new Set<number>()
    for (let i = 0; i < index; i++) {
      for (const c of steps[i].cells) doneCells.add(c)
      for (const r of steps[i].rails) doneRails.add(r)
    }
    const newCells = new Set(step.cells)
    const newRails = new Set(step.rails)
    const cellState = (k: string): ElementState => (newCells.has(k) ? 'new' : doneCells.has(k) ? 'shown' : 'hidden')
    const railState = (i: number): ElementState => (newRails.has(i) ? 'new' : doneRails.has(i) ? 'shown' : 'hidden')
    return { cellState, railState }
  }, [steps, index, step])

  return (
    <section className="step" aria-label={`Schritt ${index + 1} von ${steps.length}`}>
      <p className="step__counter">
        Schritt {index + 1} von {steps.length}
      </p>
      <h2 className="step__title">{step.title}</h2>
      <ul className="step__parts" aria-label="Teile für diesen Schritt">
        {step.parts.map(({ partId, count }) => (
          <li key={partId} className="part-chip">
            <PartIcon partId={partId} />
            <span className="part-chip__count">{count}×</span>
            <span className="part-chip__name">{getPart(partId)?.name ?? partId}</span>
          </li>
        ))}
      </ul>
      <div className="step__drawing">
        <TrackView track={track} cellState={cellState} railState={railState} />
      </div>
      <nav className="step__nav" aria-label="Blättern">
        <button type="button" className="big-button" onClick={onPrevious} disabled={index === 0} aria-label="Zurück">
          ◀
        </button>
        <ol className="step__dots" aria-hidden="true">
          {steps.map((_, i) => (
            <li key={i} className={i === index ? 'is-current' : i < index ? 'is-done' : ''} />
          ))}
        </ol>
        {isLast ? (
          <button type="button" className="big-button big-button--accent" onClick={onFinish}>
            Fertig
          </button>
        ) : (
          <button type="button" className="big-button big-button--accent" onClick={onNext} aria-label="Weiter">
            ▶
          </button>
        )}
      </nav>
    </section>
  )
}
