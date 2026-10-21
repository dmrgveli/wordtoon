import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Ring({ value, size = 120, stroke = 14, children, color = 'var(--tomato)' }: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2 - 2
  const c = size / 2
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={c} cy={c} r={r} fill="var(--surface)" stroke="var(--ink)" strokeWidth={stroke + 5} />
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <motion.circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          transform={`rotate(-90 ${c} ${c})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.001, Math.min(1, value)) }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  )
}
