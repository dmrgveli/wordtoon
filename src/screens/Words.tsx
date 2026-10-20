import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { Word } from '../data/words'
import type { Progress } from '../lib/store'
import { POS_TR } from '../lib/util'
import { Icon } from '../components/Icon'
import { WordImage } from '../components/WordImage'

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'new', label: 'Yeni' },
  { id: 'learning', label: 'Çalışılıyor' },
  { id: 'known', label: 'Biliyorum' },
] as const

type Filter = (typeof FILTERS)[number]['id']

export function Words({ words, progress, onOpen }: { words: Word[]; progress: Progress; onOpen: (w: Word) => void }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const shown = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return words.filter((w) => {
      const status = progress[w.id]?.status ?? 'new'
      if (filter !== 'all' && status !== filter) return false
      return !q || w.word.includes(q) || w.turkish.toLocaleLowerCase('tr').includes(q)
    })
  }, [words, progress, query, filter])

  return (
    <div className="stack">
      <header>
        <p className="eyebrow">{words.length} kelime</p>
        <h1 className="display">Kelimeler</h1>
      </header>

      <label className="search">
        <Icon name="search" size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Kelime ya da anlam ara" type="search" />
      </label>

      <div className="filters" role="tablist">
        {FILTERS.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} className={`filter ${filter === f.id ? 'on' : ''}`} onClick={() => setFilter(f.id)}>
            {filter === f.id && <motion.span layoutId="filter-pill" className="filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <motion.ul className="word-list" layout>
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((w, i) => {
            const status = progress[w.id]?.status ?? 'new'
            return (
              <motion.li
                key={w.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.025 } }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <motion.button className="word-row" whileTap={{ scale: 0.98 }} onClick={() => onOpen(w)}>
                  <div className="thumb"><WordImage word={w} compact /></div>
                  <div className="word-row-text">
                    <strong>{w.word}</strong>
                    <span className="muted">{w.turkish} · {POS_TR[w.partOfSpeech].toLocaleLowerCase('tr')}</span>
                  </div>
                  <span className={`status-dot ${status}`} aria-label={status} />
                </motion.button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </motion.ul>
      {!shown.length && <p className="muted center">Eşleşen kelime yok.</p>}
    </div>
  )
}
