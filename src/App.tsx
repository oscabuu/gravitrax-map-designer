import { PLATE_CELL_COUNT } from './model/plate'
import { PlateView } from './view/PlateView'

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1>Bahn-Designer</h1>
        <p className="app__lead">Hier entstehen bald neue Kugelbahnen auf Knopfdruck.</p>
      </header>
      <section className="app__plate" aria-label="Grundplatte">
        <PlateView />
        <p className="app__hint">Eine Grundplatte: {PLATE_CELL_COUNT} Felder in sechs Reihen.</p>
      </section>
      <footer className="app__footer">Arbeitsstand E0 · Grundgerüst</footer>
    </main>
  )
}
