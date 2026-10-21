import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { WORDS } from './data/words'
import { useStore } from './lib/store'
import { useRecent } from './lib/recent'
import { back, useRoute } from './lib/router'
import { Icon } from './components/Icon'
import { Search } from './screens/Search'
import { WordPage } from './screens/WordPage'
import { Cards } from './screens/Cards'
import { Quiz } from './screens/Quiz'

function PracticeBar({ title }: { title: string }) {
  return (
    <header className="practice-bar">
      <motion.button className="round flip-x" onClick={back} whileTap={{ scale: 0.9 }} aria-label="Geri"><Icon name="arrow" size={20} /></motion.button>
      <h1>{title}</h1>
      <span className="round-spacer" />
    </header>
  )
}

export default function App() {
  const store = useStore()
  const { recent, add } = useRecent()
  const route = useRoute()
  const key = route.name === 'word' ? `word-${route.id}` : route.name

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.main
            key={key}
            className={`screen screen-${route.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {route.name === 'search' && <Search progress={store.progress} recent={recent} />}
            {route.name === 'word' && <WordPage id={route.id} store={store} onVisit={add} />}
            {route.name === 'cards' && (<><PracticeBar title="Kartlar" /><Cards words={WORDS} store={store} /></>)}
            {route.name === 'quiz' && (<><PracticeBar title="Quiz" /><Quiz words={WORDS} store={store} /></>)}
          </motion.main>
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  )
}
