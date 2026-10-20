import { useState } from 'react'
import type { Word } from '../data/words'

// Images live in public/images/<id>.<ext>; the first extension that loads wins.
const EXTENSIONS = ['webp', 'png', 'jpg']

export function WordImage({ word, compact = false }: { word: Word; compact?: boolean }) {
  const [attempt, setAttempt] = useState(0)
  const cls = `word-image pos-${word.partOfSpeech}${compact ? ' compact' : ''}`

  if (attempt >= EXTENSIONS.length) {
    return (
      <div className={`${cls} placeholder`} aria-label={`${word.word} için görsel henüz yok`}>
        {compact ? (
          <span className="placeholder-letter">{word.word[0]}</span>
        ) : (
          <>
            <span className="placeholder-icon" aria-hidden="true">🎨</span>
            <span className="placeholder-text">{word.imagePrompt}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <img
      key={attempt}
      className={cls}
      src={`./images/${word.id}.${EXTENSIONS[attempt]}`}
      alt={compact ? '' : word.imagePrompt}
      onError={() => setAttempt((a) => a + 1)}
      draggable={false}
      loading="lazy"
    />
  )
}
