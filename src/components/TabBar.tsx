import { motion } from 'motion/react'
import { Icon, type IconName } from './Icon'

export type Tab = 'home' | 'cards' | 'quiz' | 'words'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Ana sayfa', icon: 'home' },
  { id: 'cards', label: 'Kartlar', icon: 'cards' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
  { id: 'words', label: 'Kelimeler', icon: 'list' },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Ana menü">
      {TABS.map((t) => (
        <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
          {tab === t.id && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <motion.span className="tab-icon" animate={{ y: tab === t.id ? -1 : 0, scale: tab === t.id ? 1.08 : 1 }}>
            <Icon name={t.icon} size={22} />
          </motion.span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
