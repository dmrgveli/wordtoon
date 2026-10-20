import { motion } from 'motion/react'
import { WORDS, type Word } from '../data/words'
import type { Store } from '../lib/store'
import { POS_TR } from '../lib/util'
import { AnimatedNumber } from '../components/AnimatedNumber'
import { Icon } from '../components/Icon'
import { Ring } from '../components/Ring'
import { WordImage } from '../components/WordImage'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  return 'İyi akşamlar'
}

function wordOfTheDay(): Word {
  const day = Math.floor(Date.now() / 86_400_000)
  return WORDS[day % WORDS.length]
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
} as const

export function Home({ store, onStart, onOpenWord }: {
  store: Store
  onStart: (tab: 'cards' | 'quiz') => void
  onOpenWord: (w: Word) => void
}) {
  const { progress, stats } = store
  const known = WORDS.filter((w) => progress[w.id]?.status === 'known').length
  const learning = WORDS.filter((w) => progress[w.id]?.status === 'learning').length
  const fresh = WORDS.length - known - learning
  const goal = Math.min(1, stats.todayCount / stats.dailyGoal)
  const wotd = wordOfTheDay()

  const byPos = (['noun', 'verb', 'adjective'] as const).map((pos) => {
    const all = WORDS.filter((w) => w.partOfSpeech === pos)
    const k = all.filter((w) => progress[w.id]?.status === 'known').length
    return { pos, total: all.length, known: k }
  })

  return (
    <motion.div className="stack" variants={{ show: { transition: { staggerChildren: 0.06 } } }} initial="hidden" animate="show">
      <motion.header className="home-head" variants={item}>
        <div>
          <p className="eyebrow">{greeting()} 👋</p>
          <h1 className="display">Wordtoon</h1>
        </div>
        <div className="chips">
          <span className={`chip streak ${stats.streak > 0 ? 'on' : ''}`} title="Gün serisi">
            <Icon name="flame" size={16} fill /> {stats.streak}
          </span>
          <span className="chip xp" title="Toplam XP">
            <Icon name="bolt" size={16} fill /> {stats.xp}
          </span>
        </div>
      </motion.header>

      <motion.section className="panel goal" variants={item}>
        <Ring value={goal} size={112} stroke={11}>
          <strong className="big-num"><AnimatedNumber value={stats.todayCount} /></strong>
          <span className="muted tiny">/ {stats.dailyGoal}</span>
        </Ring>
        <div className="goal-text">
          <h2>Günlük hedef</h2>
          <p className="muted">
            {goal >= 1 ? 'Bugünkü hedefini tamamladın! 🎉' : `Hedefe ${stats.dailyGoal - stats.todayCount} kart kaldı.`}
          </p>
          <motion.button className="btn primary" whileTap={{ scale: 0.96 }} onClick={() => onStart('cards')}>
            Çalışmaya başla <Icon name="arrow" size={18} />
          </motion.button>
        </div>
      </motion.section>

      <motion.section className="stat-grid" variants={item}>
        <div className="stat known"><strong><AnimatedNumber value={known} /></strong><span>Biliyorum</span></div>
        <div className="stat learning"><strong><AnimatedNumber value={learning} /></strong><span>Çalışılıyor</span></div>
        <div className="stat fresh"><strong><AnimatedNumber value={fresh} /></strong><span>Yeni</span></div>
      </motion.section>

      <motion.button className="panel wotd" variants={item} whileTap={{ scale: 0.98 }} onClick={() => onOpenWord(wotd)}>
        <div className="wotd-img"><WordImage word={wotd} compact /></div>
        <div className="wotd-text">
          <p className="eyebrow"><Icon name="sparkle" size={14} /> Günün kelimesi</p>
          <h3>{wotd.word}</h3>
          <p className="muted">{wotd.turkish} · {POS_TR[wotd.partOfSpeech].toLocaleLowerCase('tr')}</p>
        </div>
        <Icon name="arrow" size={20} />
      </motion.button>

      <motion.section className="mode-grid" variants={item}>
        <motion.button className="mode cards" whileTap={{ scale: 0.96 }} whileHover={{ y: -3 }} onClick={() => onStart('cards')}>
          <span className="mode-icon"><Icon name="cards" size={26} /></span>
          <strong>Kartlar</strong>
          <span>Kaydır ve öğren</span>
        </motion.button>
        <motion.button className="mode quiz" whileTap={{ scale: 0.96 }} whileHover={{ y: -3 }} onClick={() => onStart('quiz')}>
          <span className="mode-icon"><Icon name="quiz" size={26} /></span>
          <strong>Quiz</strong>
          <span>{stats.bestQuiz ? `En iyi: ${stats.bestQuiz}/10` : '10 soruluk test'}</span>
        </motion.button>
      </motion.section>

      <motion.section className="panel" variants={item}>
        <h2 className="panel-title">Kelime türüne göre</h2>
        <div className="pos-bars">
          {byPos.map((p) => (
            <div key={p.pos} className="pos-bar">
              <div className="pos-bar-head">
                <span>{POS_TR[p.pos]}</span>
                <span className="muted">{p.known}/{p.total}</span>
              </div>
              <div className="track">
                <motion.div
                  className={`fill pos-fill-${p.pos}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.total ? (p.known / p.total) * 100 : 0}%` }}
                  transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {(known + learning > 0) && (
        <motion.button
          className="btn link"
          variants={item}
          onClick={() => { if (confirm('Tüm ilerleme ve seri sıfırlansın mı?')) store.reset() }}
        >
          İlerlemeyi sıfırla
        </motion.button>
      )}
    </motion.div>
  )
}
