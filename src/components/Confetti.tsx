import { motion } from 'motion/react'
import { useMemo } from 'react'

const COLORS = ['#ff5a36', '#ffc43d', '#3ddc97', '#7cc6fe', '#b79cff']

export function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 360,
        y: 300 + Math.random() * 400,
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  )

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          style={{ width: p.size, height: p.size * (p.round ? 1 : 0.5), background: p.color, borderRadius: p.round ? '50%' : 2 }}
          initial={{ x: 0, y: -40, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [-40, -160 - Math.random() * 120, p.y], opacity: [1, 1, 0], rotate: p.rotate }}
          transition={{ duration: 1.8, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
