import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export function Typewriter({ text, speed = 22 }: { text: string; speed?: number }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? text.length : 0)

  useEffect(() => {
    if (reduce) return
    setN(0)
    const t = setInterval(() => setN((c) => (c >= text.length ? (clearInterval(t), c) : c + 1)), speed)
    return () => clearInterval(t)
  }, [text, speed, reduce])

  return (
    <span className="typewriter" aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {n < text.length && <span className="caret" aria-hidden="true" />}
    </span>
  )
}
