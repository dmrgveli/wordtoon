import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Word } from '../data/words'
import type { Progress, Status, Store } from '../lib/store'
import { POS_TR, haptic, shuffle, speak, PRESS } from '../lib/util'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import { Mascot } from '../components/Mascot'
import { WordImage } from '../components/WordImage'

const SWIPE_DISTANCE = 110
const SWIPE_VELOCITY = 600

// Words not yet known come first, then the rest; shuffled inside each group.
function buildQueue(words: Word[], progress: Progress): string[] {
  const learning = words.filter((w) => progress[w.id]?.status !== 'known').map((w) => w.id)
  const known = words.filter((w) => progress[w.id]?.status === 'known').map((w) => w.id)
  return [...shuffle(learning), ...shuffle(known)]
}

type Fling = { dir: 1 | -1; nonce: number } | null

function SwipeCard({ word, number, depth, fling, onDone }: {
  word: Word
  number: number
  depth: number
  fling: Fling
  onDone: (status: Status) => void
}) {
  const isTop = depth === 0
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-16, 16])
  const knowOpacity = useTransform(x, [24, SWIPE_DISTANCE], [0, 1])
  const againOpacity = useTransform(x, [-SWIPE_DISTANCE, -24], [1, 0])
  const [flipped, setFlipped] = useState(false)
  const leaving = useRef(false)

  async function flyOut(dir: 1 | -1) {
    if (leaving.current) return
    leaving.current = true
    haptic()
    await animate(x, dir * (window.innerWidth + 200), { duration: 0.32, ease: [0.4, 0, 0.6, 1] })
    onDone(dir === 1 ? 'known' : 'learning')
  }

  useEffect(() => {
    if (isTop && fling) flyOut(fling.dir)
    // flyOut only reads refs and stable props; re-run on each new fling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fling?.nonce])

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) flyOut(1)
    else if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) flyOut(-1)
    else animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 })
  }

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, zIndex: 10 - depth }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 16, opacity: depth > 2 ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      drag={isTop ? 'x' : false}
      dragSnapToOrigin={false}
      onDragEnd={onDragEnd}
      onTap={() => isTop && setFlipped((f) => !f)}
      whileDrag={{ cursor: 'grabbing' }}
    >
      {isTop && (
        <>
          <motion.span className="stamp know" style={{ opacity: knowOpacity }}>BİLİYORUM</motion.span>
          <motion.span className="stamp again" style={{ opacity: againOpacity }}>TEKRAR</motion.span>
        </>
      )}
      <motion.div
        className="flip"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="face front">
          <div className="card-top">
            <span className={`pos-tag pos-${word.partOfSpeech}`}>{POS_TR[word.partOfSpeech]}</span>
            <span className="card-no">#{String(number).padStart(2, '0')}</span>
          </div>
          <WordImage word={word} />
          <div className="face-word">
            <h2 className={word.word.length > 10 ? 'long' : undefined}>{word.word}</h2>
            <button
              className="icon-btn soft"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); speak(word.word) }}
              aria-label="Telaffuzu dinle"
            >
              <Icon name="speaker" size={20} />
            </button>
          </div>
          <span className="hint">Anlamı için dokun ↻</span>
        </div>
        <div className="face back">
          <span className={`pos-tag pos-${word.partOfSpeech}`}>{POS_TR[word.partOfSpeech]}</span>
          <h2 className={word.word.length > 10 ? 'long' : undefined}>{word.word}</h2>
          <p className="turkish">{word.turkish}</p>
          <p className="definition">{word.definition}</p>
          <p className="example">“{word.example}”</p>
          <p className="hook">💡 {word.hook}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Cards({ words, store }: { words: Word[]; store: Store }) {
  const byId = useMemo(() => new Map(words.map((w) => [w.id, w])), [words])
  const numberOf = useMemo(() => new Map(words.map((w, i) => [w.id, i + 1])), [words])
  // Progress is read once to order the deck; later marks must not reshuffle it.
  const [queue, setQueue] = useState(() => buildQueue(words, store.progress))
  const [total, setTotal] = useState(queue.length)
  const [done, setDone] = useState({ known: 0, learning: 0 })
  const [fling, setFling] = useState<Fling>(null)

  function answer(status: Status) {
    const id = queue[0]
    if (!id) return
    store.mark(id, status)
    setDone((d) => ({ ...d, [status]: d[status] + 1 }))
    setFling(null)
    setQueue((q) => {
      const [head, ...rest] = q
      // A missed word comes back a few cards later in the same round.
      if (status === 'learning') {
        rest.splice(Math.min(4, rest.length), 0, head)
        setTotal((t) => t + 1)
      }
      return rest
    })
  }

  function restart() {
    const q = buildQueue(words, store.progress)
    setQueue(q)
    setTotal(q.length)
    setDone({ known: 0, learning: 0 })
  }

  const answered = done.known + done.learning
  const visible = queue.slice(0, 3)

  if (!queue.length) {
    return (
      <motion.section className="finish" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Confetti />
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}>
          <Mascot size={120} mood="wow" />
        </motion.div>
        <h2 className="display">Tur bitti!</h2>
        <p className="muted">Tüm kartları tamamladın.</p>
        <div className="finish-stats">
          <div className="stat known"><strong>{done.known}</strong><span>Biliyorum</span></div>
          <div className="stat learning"><strong>{done.learning}</strong><span>Tekrar</span></div>
        </div>
        <motion.button className="btn primary wide" whileTap={PRESS} onClick={restart}>
          <Icon name="refresh" size={18} /> Yeni tur
        </motion.button>
      </motion.section>
    )
  }

  return (
    <section className="cards-screen">
      <div className="session-head">
        <div className="track thin">
          <motion.div className="fill" animate={{ width: `${(answered / total) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
        </div>
        <span className="muted tiny">{answered}/{total}</span>
      </div>

      <div className="deck">
        <AnimatePresence initial={false}>
          {[...visible].reverse().map((id) => {
            const depth = visible.indexOf(id)
            return (
              <SwipeCard
                key={id}
                word={byId.get(id)!}
                number={numberOf.get(id)!}
                depth={depth}
                fling={depth === 0 ? fling : null}
                onDone={answer}
              />
            )
          })}
        </AnimatePresence>
      </div>

      <div className="swipe-actions">
        <motion.button className="round-btn again" whileTap={PRESS} onClick={() => setFling({ dir: -1, nonce: Date.now() })} aria-label="Bilmiyorum">
          <Icon name="x" size={28} stroke={2.6} />
        </motion.button>
        <span className="muted tiny swipe-hint">← tekrar · biliyorum →</span>
        <motion.button className="round-btn know" whileTap={PRESS} onClick={() => setFling({ dir: 1, nonce: Date.now() })} aria-label="Biliyorum">
          <Icon name="check" size={28} stroke={2.6} />
        </motion.button>
      </div>
    </section>
  )
}
