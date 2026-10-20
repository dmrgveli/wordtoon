import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { WORDS, type Word } from './data/words'
import { useStore } from './lib/store'
import { TabBar, type Tab } from './components/TabBar'
import { WordSheet } from './components/WordSheet'
import { Home } from './screens/Home'
import { Cards } from './screens/Cards'
import { Quiz } from './screens/Quiz'
import { Words } from './screens/Words'

export default function App() {
  const store = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [openWord, setOpenWord] = useState<Word | null>(null)
  const closeSheet = useCallback(() => setOpenWord(null), [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-blobs" aria-hidden="true"><span /><span /><span /></div>
      <AnimatePresence mode="wait">
        <motion.main
          key={tab}
          className={`screen screen-${tab}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {tab === 'home' && <Home store={store} onStart={setTab} onOpenWord={setOpenWord} />}
          {tab === 'cards' && <Cards words={WORDS} store={store} />}
          {tab === 'quiz' && <Quiz words={WORDS} store={store} />}
          {tab === 'words' && <Words words={WORDS} progress={store.progress} onOpen={setOpenWord} />}
        </motion.main>
      </AnimatePresence>
      <TabBar tab={tab} onChange={setTab} />
      <AnimatePresence>
        {openWord && <WordSheet key={openWord.id} word={openWord} store={store} onClose={closeSheet} />}
      </AnimatePresence>
    </MotionConfig>
  )
}
