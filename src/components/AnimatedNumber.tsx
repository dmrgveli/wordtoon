import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'

export function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v).toString())
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: [0.2, 0.7, 0.2, 1] })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span>{rounded}</motion.span>
}
