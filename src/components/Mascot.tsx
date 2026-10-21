import { motion } from 'motion/react'

export type Mood = 'happy' | 'wow' | 'sad'

// "Toon", a little book with a face. Blinks and bobs on its own.
export function Mascot({ size = 64, mood = 'happy' }: { size?: number; mood?: Mood }) {
  return (
    <motion.div
      className="mascot"
      style={{ width: size, height: size }}
      animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <rect x="16" y="20" width="72" height="66" rx="10" fill="#141414" />
        <rect x="12" y="14" width="72" height="66" rx="10" fill="#ffd23f" stroke="#141414" strokeWidth="5" />
        <path d="M22 14v66" stroke="#141414" strokeWidth="4" />
        <motion.g
          style={{ originY: '42px' }}
          animate={{ scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 3.4, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
        >
          <circle cx="38" cy="42" r="6" fill="#141414" />
          <circle cx="64" cy="42" r="6" fill="#141414" />
          <circle cx="40" cy="40" r="2" fill="#fff" />
          <circle cx="66" cy="40" r="2" fill="#fff" />
        </motion.g>
        <ellipse cx="31" cy="55" rx="6" ry="4" fill="#ff5a36" opacity="0.55" />
        <ellipse cx="72" cy="55" rx="6" ry="4" fill="#ff5a36" opacity="0.55" />
        {mood === 'happy' && <path d="M41 56q10 12 20 0" fill="#141414" stroke="#141414" strokeWidth="4" strokeLinejoin="round" />}
        {mood === 'wow' && <ellipse cx="51" cy="60" rx="6" ry="7" fill="#141414" />}
        {mood === 'sad' && <path d="M42 64q9-9 18 0" fill="none" stroke="#141414" strokeWidth="4" strokeLinecap="round" />}
      </svg>
    </motion.div>
  )
}
