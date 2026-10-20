import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export function Ring({ value, size = 120, stroke = 12, children, color = 'url(#ring-grad)' }: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.001, Math.min(1, value)) }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
        />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  )
}
