import { motion, type PanInfo } from 'motion/react'
import { useEffect } from 'react'
import type { Word } from '../data/words'
import type { Store } from '../lib/store'
import { POS_TR, speak } from '../lib/util'
import { Icon } from './Icon'
import { WordImage } from './WordImage'

export function WordSheet({ word, store, onClose }: { word: Word; store: Store; onClose: () => void }) {
  const status = store.progress[word.id]?.status

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose()
  }

  return (
    <>
      <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={word.word}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 34 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
      >
        <span className="grabber" />
        <div className="sheet-img"><WordImage word={word} /></div>
        <div className="sheet-head">
          <div>
            <h2 className="display">{word.word}</h2>
            <span className={`pos-tag pos-${word.partOfSpeech}`}>{POS_TR[word.partOfSpeech]}</span>
          </div>
          <button className="icon-btn soft" onClick={() => speak(word.word)} aria-label="Telaffuzu dinle">
            <Icon name="speaker" size={22} />
          </button>
        </div>
        <p className="turkish">{word.turkish}</p>
        <p className="definition">{word.definition}</p>
        <p className="example">“{word.example}”</p>
        <p className="hook">💡 {word.hook}</p>
        <div className="sheet-actions">
          <motion.button
            className={`btn ${status === 'learning' ? 'danger' : 'ghost'}`}
            whileTap={{ scale: 0.96 }}
            onClick={() => store.mark(word.id, 'learning', 0)}
          >
            Tekrar listesine al
          </motion.button>
          <motion.button
            className={`btn ${status === 'known' ? 'success' : 'ghost'}`}
            whileTap={{ scale: 0.96 }}
            onClick={() => store.mark(word.id, 'known', 0)}
          >
            Biliyorum
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}
