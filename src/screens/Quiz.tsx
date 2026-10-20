import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { Word } from '../data/words'
import type { Store } from '../lib/store'
import { POS_TR, haptic, shuffle, speak } from '../lib/util'
import { Confetti } from '../components/Confetti'
import { Icon } from '../components/Icon'
import { Ring } from '../components/Ring'
import { WordImage } from '../components/WordImage'

const LENGTH = 10

interface Question {
  word: Word
  kind: 'definition' | 'meaning'
  options: Word[]
}

// Favour words that are not yet known, and pick distractors of the same part of speech.
function buildQuiz(words: Word[], store: Store): Question[] {
  const weak = shuffle(words.filter((w) => store.progress[w.id]?.status !== 'known'))
  const strong = shuffle(words.filter((w) => store.progress[w.id]?.status === 'known'))
  return [...weak, ...strong].slice(0, LENGTH).map((word, i) => {
    const same = shuffle(words.filter((w) => w.id !== word.id && w.partOfSpeech === word.partOfSpeech))
    const other = shuffle(words.filter((w) => w.id !== word.id && w.partOfSpeech !== word.partOfSpeech))
    const distractors = [...same, ...other].slice(0, 3)
    return { word, kind: i % 2 === 0 ? 'definition' : 'meaning', options: shuffle([word, ...distractors]) }
  })
}

export function Quiz({ words, store }: { words: Word[]; store: Store }) {
  const [questions, setQuestions] = useState(() => buildQuiz(words, store))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [results, setResults] = useState<boolean[]>([])

  const q = questions[index]

  function choose(option: Word) {
    if (picked) return
    const correct = option.id === q.word.id
    setPicked(option.id)
    setResults((r) => [...r, correct])
    haptic(correct ? 12 : [30, 40, 30])
    store.mark(q.word.id, correct ? 'known' : 'learning', correct ? 15 + combo * 2 : 2)
    if (correct) {
      setScore((s) => s + 1)
      setCombo((c) => c + 1)
      setTimeout(next, 900)
    } else {
      setCombo(0)
    }
  }

  function next() {
    setPicked(null)
    setIndex((i) => i + 1)
  }

  const finished = !q
  const { recordQuiz } = store
  useEffect(() => {
    if (finished) recordQuiz(score)
  }, [finished, score, recordQuiz])

  function restart() {
    setQuestions(buildQuiz(words, store))
    setIndex(0)
    setPicked(null)
    setScore(0)
    setCombo(0)
    setResults([])
  }

  if (!q) {
    const ratio = score / questions.length
    return (
      <motion.section className="finish" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        {ratio >= 0.7 && <Confetti />}
        <Ring value={ratio} size={150} stroke={14}>
          <strong className="big-num">{score}</strong>
          <span className="muted tiny">/ {questions.length}</span>
        </Ring>
        <h2 className="display">{ratio === 1 ? 'Kusursuz! 🏆' : ratio >= 0.7 ? 'Harika iş! 🎉' : ratio >= 0.4 ? 'Fena değil 💪' : 'Tekrar deneyelim 📚'}</h2>
        <div className="result-dots">
          {results.map((ok, i) => (
            <motion.span key={i} className={ok ? 'ok' : 'bad'} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} />
          ))}
        </div>
        <motion.button className="btn primary wide" whileTap={{ scale: 0.96 }} onClick={restart}>
          <Icon name="refresh" size={18} /> Yeni quiz
        </motion.button>
      </motion.section>
    )
  }

  return (
    <section className="quiz-screen">
      <div className="session-head">
        <div className="segments">
          {questions.map((_, i) => (
            <span key={i} className={i < results.length ? (results[i] ? 'ok' : 'bad') : i === index ? 'now' : ''} />
          ))}
        </div>
        <AnimatePresence>
          {combo >= 2 && (
            <motion.span className="chip combo" key={combo} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
              <Icon name="flame" size={14} fill /> x{combo}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="quiz-body"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="panel question">
            {q.kind === 'definition' ? (
              <>
                <p className="eyebrow">Bu tanım hangi kelime?</p>
                <div className="question-img"><WordImage word={q.word} /></div>
                <p className="question-text">{q.word.definition}</p>
              </>
            ) : (
              <>
                <p className="eyebrow">Türkçe anlamı hangisi?</p>
                <div className="question-word">
                  <h2 className="display">{q.word.word}</h2>
                  <button className="icon-btn soft" onClick={() => speak(q.word.word)} aria-label="Telaffuzu dinle">
                    <Icon name="speaker" size={20} />
                  </button>
                </div>
                <span className={`pos-tag pos-${q.word.partOfSpeech}`}>{POS_TR[q.word.partOfSpeech]}</span>
              </>
            )}
          </div>

          <div className="options">
            {q.options.map((o, i) => {
              const state = !picked ? '' : o.id === q.word.id ? 'correct' : o.id === picked ? 'wrong' : 'dim'
              return (
                <motion.button
                  key={o.id}
                  className={`option ${state}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={state === 'wrong' ? { opacity: 1, y: 0, x: [0, -10, 10, -6, 6, 0] } : { opacity: 1, y: 0, scale: state === 'correct' ? [1, 1.04, 1] : 1 }}
                  transition={{ delay: picked ? 0 : 0.05 * i, duration: state === 'wrong' ? 0.4 : 0.3 }}
                  whileTap={!picked ? { scale: 0.97 } : undefined}
                  onClick={() => choose(o)}
                  disabled={!!picked}
                >
                  <span className="option-key">{'ABCD'[i]}</span>
                  <span>{q.kind === 'definition' ? o.word : o.turkish}</span>
                  {state === 'correct' && <Icon name="check" size={20} stroke={2.6} />}
                  {state === 'wrong' && <Icon name="x" size={20} stroke={2.6} />}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {picked && picked !== q.word.id && (
              <motion.div
                className="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
              >
                <p><strong>{q.word.word}</strong> · {q.word.turkish}</p>
                <p className="muted small">💡 {q.word.hook}</p>
                <motion.button className="btn primary wide" whileTap={{ scale: 0.96 }} onClick={next}>
                  Devam <Icon name="arrow" size={18} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
