import { AnimatePresence, motion, type PanInfo } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { WORDS, type Word } from '../data/words'
import type { Status, Store } from '../lib/store'
import { back, go } from '../lib/router'
import { wordPattern } from '../lib/search'
import { POS_TR, haptic, shuffle, speak } from '../lib/util'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import { TiltImage } from '../components/TiltImage'
import { Typewriter } from '../components/Typewriter'

const OTHERS: Record<string, string> = {
  noun: 'Diğer isimler',
  verb: 'Diğer fiiller',
  adjective: 'Diğer sıfatlar',
  adverb: 'Diğer zarflar',
}

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { type: 'spring', stiffness: 120, damping: 18 },
} as const

function SpeakButton({ text, label }: { text: string; label: string }) {
  const [playing, setPlaying] = useState(false)
  function play() {
    speak(text)
    setPlaying(true)
    setTimeout(() => setPlaying(false), Math.min(4000, 500 + text.length * 70))
  }
  return (
    <motion.button className={`speak ${playing ? 'playing' : ''}`} onClick={play} whileTap={{ scale: 0.9 }} aria-label={label}>
      <Icon name="speaker" size={20} />
      <span className="waves" aria-hidden="true"><i /><i /><i /></span>
    </motion.button>
  )
}

// The example sentence with the word (or its inflection) marked.
function Example({ word }: { word: Word }) {
  const m = word.example.match(wordPattern(word.word))
  if (!m || m.index === undefined) return <p className="example-text">“{word.example}”</p>
  const before = word.example.slice(0, m.index)
  const after = word.example.slice(m.index + m[0].length)
  return (
    <p className="example-text">
      “{before}
      <span className="marked">
        <motion.span className="marker" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }} />
        <span className="marked-text">{m[0]}</span>
      </span>
      {after}”
    </p>
  )
}

function HookCard({ word }: { word: Word }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.button className={`hook-card ${open ? 'open' : ''}`} onClick={() => { setOpen(true); haptic() }} layout {...reveal}>
      <span className="section-label">Akılda kalsın</span>
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.p key="hook" className="hook-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Typewriter text={word.hook} />
          </motion.p>
        ) : (
          <motion.p key="tease" className="hook-tease" exit={{ opacity: 0, y: -6 }}>
            <motion.span animate={{ rotate: [0, -12, 12, -6, 0] }} transition={{ repeat: Infinity, repeatDelay: 2.2, duration: 0.6 }}>💡</motion.span>
            Görseldeki ipucunu görmek için dokun
          </motion.p>
        )}
      </AnimatePresence>
      {open && <p className="scene-text">🎨 {word.imagePrompt}</p>}
    </motion.button>
  )
}

// Fill-in-the-blank on the example sentence, or "which word fits this definition" as a fallback.
function MiniQuiz({ word, onResult }: { word: Word; onResult: (correct: boolean) => void }) {
  const options = useMemo(() => {
    const same = shuffle(WORDS.filter((w) => w.id !== word.id && w.partOfSpeech === word.partOfSpeech)).slice(0, 2)
    return shuffle([word, ...same])
  }, [word])
  const [picked, setPicked] = useState<string | null>(null)
  const m = word.example.match(wordPattern(word.word))

  function choose(o: Word) {
    if (picked) return
    setPicked(o.id)
    const ok = o.id === word.id
    haptic(ok ? 15 : [30, 40, 30])
    onResult(ok)
  }

  const correct = picked === word.id
  return (
    <motion.section className="block quiz-block" {...reveal}>
      {correct && <Confetti count={50} />}
      <span className="section-label">Kendini dene</span>
      {m && m.index !== undefined ? (
        <p className="blank-sentence">
          {word.example.slice(0, m.index)}
          <motion.span className={`blank ${picked ? (correct ? 'ok' : 'bad') : ''}`} layout>
            {picked ? (correct ? m[0] : '?') : '_____'}
          </motion.span>
          {word.example.slice(m.index + m[0].length)}
        </p>
      ) : (
        <p className="blank-sentence">“{word.definition}” — bu hangi kelime?</p>
      )}
      <div className="quiz-options">
        {options.map((o) => {
          const state = !picked ? '' : o.id === word.id ? 'ok' : o.id === picked ? 'bad' : 'dim'
          return (
            <motion.button
              key={o.id}
              className={`quiz-option ${state}`}
              onClick={() => choose(o)}
              disabled={!!picked}
              whileTap={!picked ? { scale: 0.95 } : undefined}
              animate={state === 'bad' ? { x: [0, -8, 8, -5, 5, 0] } : state === 'ok' ? { scale: [1, 1.08, 1] } : {}}
            >
              {o.word}
            </motion.button>
          )
        })}
      </div>
      <AnimatePresence>
        {picked && (
          <motion.p className={`quiz-feedback ${correct ? 'ok' : 'bad'}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {correct ? 'Harika, doğru! 🎉' : `Doğrusu: ${word.word}. Bir daha bak, sonra tekrar dene.`}
            {!correct && <button className="link-btn" onClick={() => setPicked(null)}>Tekrar dene</button>}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function StatusToggle({ status, onChange }: { status?: Status; onChange: (s: Status) => void }) {
  const items: { id: Status; label: string }[] = [
    { id: 'learning', label: 'Tekrar et' },
    { id: 'known', label: 'Öğrendim' },
  ]
  return (
    <div className="toggle" role="radiogroup" aria-label="Bu kelimenin durumu">
      {items.map((it) => (
        <button key={it.id} role="radio" aria-checked={status === it.id} className={status === it.id ? 'on' : ''} onClick={() => onChange(it.id)}>
          {status === it.id && <motion.span layoutId="toggle-pill" className={`toggle-pill ${it.id}`} transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
          <span>{it.id === 'known' ? '✓ ' : '↻ '}{it.label}</span>
        </button>
      ))}
    </div>
  )
}

export function WordPage({ id, store, onVisit }: { id: string; store: Store; onVisit: (id: string) => void }) {
  const index = WORDS.findIndex((w) => w.id === id)
  const word = WORDS[index]

  useEffect(() => {
    if (!word) return
    onVisit(word.id)
    window.scrollTo({ top: 0 })
  }, [word, onVisit])

  if (!word) {
    return (
      <div className="not-found">
        <h1>“{id}” bulunamadı</h1>
        <button className="pill strong" onClick={() => go('/')}>Aramaya dön</button>
      </div>
    )
  }

  const prev = WORDS[(index - 1 + WORDS.length) % WORDS.length]
  const next = WORDS[(index + 1) % WORDS.length]
  const related = WORDS.filter((w) => w.partOfSpeech === word.partOfSpeech && w.id !== word.id).slice(0, 8)
  const status = store.progress[word.id]?.status

  function onSwipe(_: unknown, info: PanInfo) {
    if (info.offset.x < -80 || info.velocity.x < -500) go(`/word/${next.id}`, { replace: true })
    else if (info.offset.x > 80 || info.velocity.x > 500) go(`/word/${prev.id}`, { replace: true })
  }

  return (
    <article className={`word-page tone-${word.partOfSpeech}`}>
      <header className="wp-bar">
        <motion.button className="round flip-x" onClick={back} whileTap={{ scale: 0.9 }} aria-label="Geri"><Icon name="arrow" size={20} /></motion.button>
        <span className="wp-count">{index + 1} / {WORDS.length}</span>
        <motion.button className="round" onClick={() => go('/')} whileTap={{ scale: 0.9 }} aria-label="Ara"><Icon name="search" size={19} /></motion.button>
      </header>

      <section className="wp-hero">
        <motion.div className="wp-swipe" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={onSwipe}>
          <TiltImage word={word} />
        </motion.div>
        <h1 className="wp-word" aria-label={word.word}>
          {word.word.split('').map((ch, i) => (
            <motion.span
              key={`${word.id}-${i}`}
              aria-hidden="true"
              initial={{ opacity: 0, y: 30, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.15 + i * 0.035, type: 'spring', stiffness: 260, damping: 18 }}
            >
              {ch}
            </motion.span>
          ))}
        </h1>
        <motion.div className="wp-meta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <span className="pos-label">{POS_TR[word.partOfSpeech]}</span>
          <SpeakButton text={word.word} label="Kelimeyi dinle" />
        </motion.div>
        <p className="swipe-tip">← kaydır: önceki / sonraki →</p>
      </section>

      <div className="wp-body">
        <motion.section className="block meaning" {...reveal}>
          <span className="section-label">Türkçesi</span>
          <p className="turkish-big">
            {word.turkish}
            <motion.svg className="squiggle" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
              <motion.path d="M2 8 Q 25 2 50 7 T 100 7 T 150 7 T 198 6" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} />
            </motion.svg>
          </p>
        </motion.section>

        <motion.section className="block" {...reveal}>
          <span className="section-label">İngilizce tanım</span>
          <p className="definition-text">
            {word.definition.split(' ').map((w, i) => (
              <motion.span key={`${word.id}-d${i}`} initial={{ opacity: 0.15 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.05 }}>
                {w}{' '}
              </motion.span>
            ))}
          </p>
        </motion.section>

        <motion.section className="block" {...reveal}>
          <div className="block-head">
            <span className="section-label">Cümlede</span>
            <SpeakButton text={word.example} label="Cümleyi dinle" />
          </div>
          <Example word={word} />
        </motion.section>

        <HookCard key={`hook-${word.id}`} word={word} />

        <MiniQuiz key={`quiz-${word.id}`} word={word} onResult={(ok) => store.mark(word.id, ok ? 'known' : 'learning', ok ? 10 : 2)} />

        <motion.section className="block" {...reveal}>
          <span className="section-label">Bu kelimeyi</span>
          <StatusToggle status={status} onChange={(s) => store.mark(word.id, s, 0)} />
        </motion.section>

        {related.length > 0 && (
          <motion.section className="block plain" {...reveal}>
            <span className="section-label">{OTHERS[word.partOfSpeech]}</span>
            <div className="chip-row">
              {related.map((w) => (
                <motion.button key={w.id} className="pill" whileTap={{ scale: 0.94 }} onClick={() => go(`/word/${w.id}`)}>{w.word}</motion.button>
              ))}
            </div>
          </motion.section>
        )}

        <nav className="wp-nav">
          <motion.button className="nav-card" whileTap={{ scale: 0.97 }} onClick={() => go(`/word/${prev.id}`, { replace: true })}>
            <span>← Önceki</span><strong>{prev.word}</strong>
          </motion.button>
          <motion.button className="nav-card right" whileTap={{ scale: 0.97 }} onClick={() => go(`/word/${next.id}`, { replace: true })}>
            <span>Sonraki →</span><strong>{next.word}</strong>
          </motion.button>
        </nav>
      </div>
    </article>
  )
}
