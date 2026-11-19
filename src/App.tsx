import { useMemo, useState } from 'react'
import beispiel from './data/tracks/beispiel-1.json'
import { buildSteps } from './model/steps'
import type { Track } from './model/track'
import { usedParts } from './model/track'
import { getPart } from './model/catalog'
import { StepScreen } from './view/StepScreen'
import { TrackView } from './view/TrackView'

const track = beispiel as Track

type Screen = 'overview' | 'steps'

export default function App() {
  const steps = useMemo(() => buildSteps(track), [])
  const usage = useMemo(() => usedParts(track), [])
  const [screen, setScreen] = useState<Screen>('overview')
  const [index, setIndex] = useState(0)

  if (screen === 'steps') {
    return (
      <main className="app">
        <StepScreen
          track={track}
          steps={steps}
          index={index}
          onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          onFinish={() => {
            setScreen('overview')
            setIndex(0)
          }}
        />
      </main>
    )
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Bahn-Designer</h1>
        <p className="app__lead">{track.name}: so sieht die fertige Bahn von oben aus.</p>
      </header>
      <section className="app__plate" aria-label="Fertige Bahn">
        <TrackView track={track} />
      </section>
      <ul className="usage" aria-label="Benötigte Teile">
        {Object.entries(usage).map(([partId, count]) => (
          <li key={partId}>
            {count}× {getPart(partId)?.name ?? partId}
          </li>
        ))}
      </ul>
      <button type="button" className="big-button big-button--accent big-button--wide" onClick={() => setScreen('steps')}>
        Anleitung starten
      </button>
      <footer className="app__footer">Arbeitsstand E1 · Modell und Zeichnung · inoffiziell, GraviTrax ist eine Marke von Ravensburger</footer>
    </main>
  )
}
