import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import type { Word } from '../data/words'
import { WordImage } from './WordImage'

// The hero illustration: follows the finger / pointer in 3D and floats gently.
export function TiltImage({ word }: { word: Word }) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 160, damping: 16 })
  const rotateX = useSpring(useTransform(py, [0, 1], [12, -12]), { stiffness: 160, damping: 16 })
  const glareX = useTransform(px, [0, 1], ['0%', '100%'])

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  function reset() {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      className="tilt"
      onPointerMove={onMove}
      onPointerLeave={reset}
      onPointerUp={reset}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div className="tilt-inner" layoutId={`img-${word.id}`} style={{ rotateX, rotateY, transformPerspective: 900 }}>
        <WordImage word={word} />
        <motion.span className="glare" style={{ left: glareX }} aria-hidden="true" />
      </motion.div>
    </motion.div>
  )
}
