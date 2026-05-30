import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onComplete: () => void
}

const words = ['Analyze', 'Detect', 'Classify', 'Predict', 'Sense']

export default function LoadingScreen({ onComplete }: Props) {
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef<number>(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const duration = 2700
    startRef.current = performance.now()
    doneRef.current = false

    const animate = (now: number) => {
      if (doneRef.current) return
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const newCount = Math.floor(eased * 100)
      setCount(newCount)

      if (progress >= 1) {
        doneRef.current = true
        setCount(100)
        setTimeout(() => onComplete(), 500)
      } else {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      doneRef.current = true
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % words.length)
    }, 540)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top left label */}
      <motion.div
        className="absolute top-8 left-8 font-body text-xs text-muted uppercase tracking-[0.3em]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        PoseSense AI
      </motion.div>

      {/* Center word */}
      <div className="relative flex flex-col items-center gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={wordIndex}
            className="font-display italic text-6xl md:text-8xl text-white/70 select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {words[wordIndex]}
          </motion.div>
        </AnimatePresence>

        {/* Glowing ring */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border border-white/10" />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent ${100 - count}%, #00ffff ${100 - count}%, #7b2fff 100%)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-[3px] rounded-full bg-bg flex items-center justify-center">
            <span className="font-display text-2xl text-white tabular-nums">
              {String(count).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-12 left-8 right-8">
        <div className="h-[1px] bg-white/10 overflow-hidden">
          <div
            className="h-full accent-gradient transition-all duration-100"
            style={{
              width: `${count}%`,
              boxShadow: '0 0 8px rgba(0,255,255,0.5)',
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-body text-xs text-muted tracking-widest uppercase">
            Initializing Neural Engine
          </span>
          <span className="font-body text-xs text-muted tabular-nums">
            {count}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}