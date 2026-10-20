import { useState } from 'react'
import { WORDS } from './data/words'
import { useProgress } from './progress'
import { Flashcards } from './components/Flashcards'
import { WordList } from './components/WordList'

type Screen = 'home' | 'flashcards' | 'list'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const { progress, mark, reset } = useProgress()

  const known = WORDS.filter((w) => progress[w.id]?.status === 'known').length
  const learning = WORDS.filter((w) => progress[w.id]?.status === 'learning').length
  const pct = Math.round((known / WORDS.length) * 100)

  if (screen === 'flashcards') {
    return <Flashcards words={WORDS} progress={progress} onMark={mark} onExit={() => setScreen('home')} />
  }
  if (screen === 'list') {
    return <WordList words={WORDS} progress={progress} onExit={() => setScreen('home')} />
  }

  return (
    <section className="screen home">
      <h1>Wordtoon</h1>
      <p className="muted">TOEFL kelimelerini akılda kalan görsellerle öğren.</p>

      <div className="stats">
        <div className="ring" style={{ '--pct': pct } as React.CSSProperties}>
          <span>{pct}%</span>
        </div>
        <div>
          <p><strong>{known}</strong> biliyorum</p>
          <p><strong>{learning}</strong> çalışılıyor</p>
          <p><strong>{WORDS.length - known - learning}</strong> yeni</p>
        </div>
      </div>

      <button className="btn primary big" onClick={() => setScreen('flashcards')}>Kartlara başla</button>
      <button className="btn ghost" onClick={() => setScreen('list')}>Kelime listesi</button>
      {known + learning > 0 && (
        <button className="btn link" onClick={() => { if (confirm('İlerleme sıfırlansın mı?')) reset() }}>
          İlerlemeyi sıfırla
        </button>
      )}
    </section>
  )
}
