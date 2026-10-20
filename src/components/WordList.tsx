import type { Word } from '../data/words'
import type { Progress } from '../progress'

export function WordList({ words, progress, onExit }: { words: Word[]; progress: Progress; onExit: () => void }) {
  return (
    <section className="screen">
      <header className="bar">
        <button className="icon-btn" onClick={onExit} aria-label="Geri">←</button>
        <span className="muted">{words.length} kelime</span>
      </header>
      <ul className="word-list">
        {words.map((w) => {
          const status = progress[w.id]?.status
          return (
            <li key={w.id}>
              <span className={`dot ${status ?? 'new'}`} aria-label={status === 'known' ? 'biliniyor' : status === 'learning' ? 'çalışılıyor' : 'yeni'} />
              <div>
                <strong>{w.word}</strong> <span className="muted">· {w.turkish}</span>
                <p className="muted small">{w.definition}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
