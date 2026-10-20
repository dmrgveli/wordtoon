import { useMemo, useState } from 'react'
import type { Word } from '../data/words'
import type { Progress, Status } from '../progress'
import { WordImage } from './WordImage'

interface Props {
  words: Word[]
  progress: Progress
  onMark: (id: string, status: Status) => void
  onExit: () => void
}

// Words not yet known come first, then the rest; shuffled inside each group.
function buildQueue(words: Word[], progress: Progress): string[] {
  const shuffle = (ids: string[]) => {
    const a = [...ids]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const learning = words.filter((w) => progress[w.id]?.status !== 'known').map((w) => w.id)
  const known = words.filter((w) => progress[w.id]?.status === 'known').map((w) => w.id)
  return [...shuffle(learning), ...shuffle(known)]
}

export function Flashcards({ words, progress, onMark, onExit }: Props) {
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words])
  // Progress is read once to order the deck; later marks must not reshuffle it.
  const [queue, setQueue] = useState(() => buildQueue(words, progress))
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState({ known: 0, learning: 0 })

  const current = queue.length ? byId.get(queue[0]) : undefined

  function answer(status: Status) {
    if (!current) return
    onMark(current.id, status)
    setDone((d) => ({ ...d, [status]: d[status] + 1 }))
    setFlipped(false)
    setQueue((q) => {
      const [head, ...rest] = q
      // A missed word comes back a few cards later in the same session.
      if (status === 'learning') rest.splice(Math.min(3, rest.length), 0, head)
      return rest
    })
  }

  if (!current) {
    return (
      <section className="screen center">
        <h2>Tebrikler! 🎉</h2>
        <p className="muted">Bu turdaki tüm kartları bitirdin.</p>
        <p>
          <strong>{done.known}</strong> biliyorum · <strong>{done.learning}</strong> tekrar
        </p>
        <button className="btn primary" onClick={() => { setQueue(buildQueue(words, progress)); setDone({ known: 0, learning: 0 }) }}>
          Yeniden başla
        </button>
        <button className="btn ghost" onClick={onExit}>Ana sayfa</button>
      </section>
    )
  }

  return (
    <section className="screen flashcards">
      <header className="bar">
        <button className="icon-btn" onClick={onExit} aria-label="Geri">←</button>
        <span className="muted">{queue.length} kart kaldı</span>
      </header>

      <button
        className={`card ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Kartın ön yüzünü göster' : 'Kartı çevir'}
      >
        <div className="card-inner">
          <div className="card-face front">
            <WordImage word={current} />
            <h2 className="word">{current.word}</h2>
            <span className="pos">{current.partOfSpeech}</span>
            <span className="hint">Anlamı için dokun</span>
          </div>
          <div className="card-face back">
            <h2 className="word small">{current.word}</h2>
            <p className="turkish">{current.turkish}</p>
            <p className="definition">{current.definition}</p>
            <p className="example">“{current.example}”</p>
            <p className="hook">💡 {current.hook}</p>
          </div>
        </div>
      </button>

      <div className="actions">
        <button className="btn danger" onClick={() => answer('learning')}>Bilmiyorum</button>
        <button className="btn success" onClick={() => answer('known')}>Biliyorum</button>
      </div>
    </section>
  )
}
