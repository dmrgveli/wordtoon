import { useState } from 'react'
import type { Word } from '../data/words'

// Images live in public/images/<id>.<ext>; the first extension that loads wins.
const EXTENSIONS = ['webp', 'png', 'jpg']

export function WordImage({ word }: { word: Word }) {
  const [attempt, setAttempt] = useState(0)

  if (attempt >= EXTENSIONS.length) {
    return (
      <div className={`word-image placeholder pos-${word.partOfSpeech}`} aria-label={`${word.word} için görsel henüz yok`}>
        <span className="placeholder-icon" aria-hidden="true">🎨</span>
        <span className="placeholder-text">{word.imagePrompt}</span>
      </div>
    )
  }

  return (
    <img
      key={attempt}
      className={`word-image pos-${word.partOfSpeech}`}
      src={`./images/${word.id}.${EXTENSIONS[attempt]}`}
      alt={word.imagePrompt}
      onError={() => setAttempt((a) => a + 1)}
      draggable={false}
    />
  )
}
