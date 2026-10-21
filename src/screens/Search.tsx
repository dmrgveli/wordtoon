import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { WORDS, type Word } from '../data/words'
import type { Progress } from '../lib/store'
import { go } from '../lib/router'
import { searchWords, suggest } from '../lib/search'
import { POS_TR } from '../lib/util'
import { Highlight } from '../components/Highlight'
import { Icon } from '../components/Icon'
import { WordImage } from '../components/WordImage'

const QUERY_KEY = 'wordtoon.query'

function wordOfTheDay(): Word {
  return WORDS[Math.floor(Date.now() / 86_400_000) % WORDS.length]
}

const SORTED = [...WORDS].sort((a, b) => a.word.localeCompare(b.word))
const LETTERS = [...new Set(SORTED.map((w) => w.word[0].toUpperCase()))]

function open(w: Word) {
  go(`/word/${w.id}`)
}

export function Search({ progress, recent }: { progress: Progress; recent: string[] }) {
  // Keep the query when coming back from a word page.
  const [query, setQuery] = useState(() => sessionStorage.getItem(QUERY_KEY) ?? '')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    sessionStorage.setItem(QUERY_KEY, query)
    setActive(0)
  }, [query])

  const hits = useMemo(() => searchWords(WORDS, query), [query])
  const suggestions = useMemo(() => (hits.length ? [] : suggest(WORDS, query)), [hits, query])
  const recentWords = recent.map((id) => WORDS.find((w) => w.id === id)).filter((w): w is Word => !!w)
  const wotd = wordOfTheDay()

  function onKeyDown(e: React.KeyboardEvent) {
    if (!hits.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    if (e.key === 'Enter') open(hits[active].word)
  }

  return (
    <div className="search-screen">
      <header className="top-bar">
        <span className="brand">Wordtoon</span>
        <nav className="practice-links">
          <button className="pill" onClick={() => go('/cards')}><Icon name="cards" size={16} /> Kartlar</button>
          <button className="pill" onClick={() => go('/quiz')}><Icon name="quiz" size={16} /> Quiz</button>
        </nav>
      </header>

      <motion.h1 className="search-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        Hangi kelimeyi <em>merak</em> ediyorsun?
      </motion.h1>

      <div className="search-box-wrap">
        <motion.label className="search-box" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}>
          <Icon name="search" size={22} />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="İngilizce ya da Türkçe yaz…"
            type="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Kelime ara"
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="results"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                className="clear"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                onClick={() => { setQuery(''); input.current?.focus() }}
                aria-label="Temizle"
              >
                <Icon name="x" size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.label>
      </div>

      {query ? (
        <section>
          <p className="section-label">{hits.length ? `${hits.length} sonuç` : 'Sonuç yok'}</p>
          <motion.ul id="results" className="results" role="listbox" layout>
            <AnimatePresence initial={false} mode="popLayout">
              {hits.map((h, i) => (
                <motion.li
                  key={h.word.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 8) * 0.03 } }}
                  exit={{ opacity: 0 }}
                  role="option"
                  aria-selected={i === active}
                >
                  <button className={`result ${i === active ? 'active' : ''}`} onClick={() => open(h.word)} onMouseEnter={() => setActive(i)}>
                    <motion.div className="result-thumb" layoutId={`img-${h.word.id}`}>
                      <WordImage word={h.word} compact />
                    </motion.div>
                    <div className="result-text">
                      <strong><Highlight text={h.word.word} query={h.field === 'word' ? query : ''} /></strong>
                      <span><Highlight text={h.word.turkish} query={h.field === 'turkish' ? query : ''} /></span>
                      {h.field === 'definition' && <span className="result-def"><Highlight text={h.word.definition} query={query} /></span>}
                    </div>
                    <span className={`pos-dot pos-${h.word.partOfSpeech}`} title={POS_TR[h.word.partOfSpeech]} />
                    <Icon name="arrow" size={18} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          {suggestions.length > 0 && (
            <motion.div className="did-you-mean" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p>Bunu mu demek istedin?</p>
              <div className="chip-row">
                {suggestions.map((w) => (
                  <button key={w.id} className="pill strong" onClick={() => setQuery(w.word)}>{w.word}</button>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      ) : (
        <motion.div className="browse" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
          <motion.button
            className={`feature tone-${wotd.partOfSpeech}`}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.98 }}
            onClick={() => open(wotd)}
          >
            <div className="feature-text">
              <span className="section-label">Günün kelimesi</span>
              <strong>{wotd.word}</strong>
              <span>{wotd.turkish}</span>
            </div>
            <motion.div className="feature-img" layoutId={`img-${wotd.id}`}>
              <WordImage word={wotd} compact />
            </motion.div>
          </motion.button>

          {recentWords.length > 0 && (
            <motion.section variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
              <p className="section-label">Son baktıkların</p>
              <div className="recent-row">
                {recentWords.filter((w) => w.id !== wotd.id).map((w) => (
                  <motion.button key={w.id} className="recent" whileTap={{ scale: 0.95 }} onClick={() => open(w)}>
                    <motion.div className="recent-img" layoutId={`img-${w.id}`}><WordImage word={w} compact /></motion.div>
                    <span>{w.word}</span>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          <motion.section variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
            <div className="az-head">
              <p className="section-label">Tüm kelimeler · {WORDS.length}</p>
            </div>
            <div className="letters">
              {LETTERS.map((l) => (
                <button key={l} onClick={() => document.getElementById(`letter-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{l}</button>
              ))}
            </div>
            <div className="az-grid">
              {SORTED.map((w, i) => {
                const first = i === 0 || SORTED[i - 1].word[0] !== w.word[0]
                const status = progress[w.id]?.status
                return (
                  <motion.button
                    key={w.id}
                    id={first ? `letter-${w.word[0].toUpperCase()}` : undefined}
                    className="tile"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => open(w)}
                  >
                    <motion.div className="tile-img" layoutId={recent.includes(w.id) || w.id === wotd.id ? undefined : `img-${w.id}`}>
                      <WordImage word={w} compact />
                    </motion.div>
                    <span className="tile-word">{w.word}</span>
                    <span className="tile-tr">{w.turkish}</span>
                    {status && <span className={`tile-status ${status}`} aria-label={status === 'known' ? 'biliyorum' : 'çalışılıyor'} />}
                  </motion.button>
                )
              })}
            </div>
          </motion.section>
        </motion.div>
      )}
    </div>
  )
}
