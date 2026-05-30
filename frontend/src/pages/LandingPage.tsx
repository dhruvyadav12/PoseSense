import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowRight, Zap, Shield, Activity,
  Eye, Dumbbell, Brain, ChevronDown,
  Sparkles, ArrowUpRight
} from 'lucide-react'
import Navbar from '../components/Navbar'
import LoadingScreen from '../components/LoadingScreen'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  onLaunch: () => void
}

const roles = ['Intelligence', 'Detection', 'Analysis', 'Awareness']

const features = [
  {
    icon: Brain,
    title: 'Context Classifier',
    desc: 'Automatically detects gym, office, home environments using pose analysis.',
    color: '#00ffff',
  },
  {
    icon: Shield,
    title: 'Fall Detector',
    desc: 'Real-time fall detection using body orientation and motion analysis.',
    color: '#ff006e',
  },
  {
    icon: Dumbbell,
    title: 'Exercise Analyzer',
    desc: 'Counts reps, identifies exercise type, tracks workout intensity.',
    color: '#7b2fff',
  },
  {
    icon: Activity,
    title: 'Posture Analyzer',
    desc: 'Detects slouching, forward head posture, and shoulder imbalance.',
    color: '#00ff64',
  },
  {
    icon: Eye,
    title: 'Suspicious Activity',
    desc: 'Identifies loitering, erratic movement for security applications.',
    color: '#ffa500',
  },
  {
    icon: Zap,
    title: 'Live Dashboard',
    desc: 'Real-time holographic HUD with animated alerts and live camera feed.',
    color: '#00ffff',
  },
]

const stats = [
  { num: '33', label: 'Keypoints Tracked' },
  { num: '5+', label: 'Behavior Modules' },
  { num: '30+', label: 'FPS Real-Time' },
  { num: '6', label: 'Context Profiles' },
]

export default function LandingPage({ onLaunch }: Props) {
  const [loading, setLoading] = useState(true)
  const [roleIndex, setRoleIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' })
  const featuresInView = useInView(featuresRef, { once: true, margin: '-100px' })

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % roles.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.1,
      })
    })
    return () => ctx.revert()
  }, [loading])

  if (loading) {
    return (
      <AnimatePresence>
        <LoadingScreen onComplete={() => setLoading(false)} />
      </AnimatePresence>
    )
  }

  return (
    <div className="bg-bg text-white overflow-x-hidden">
      {/* ── HERO ─────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10"
            style={{
              background:
                'radial-gradient(circle, rgba(0,255,255,0.4) 0%, rgba(123,47,255,0.2) 50%, transparent 70%)',
            }}
          />
        </div>

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <Navbar onLaunch={onLaunch} />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          {/* Badge */}
          <motion.div
            className="liquid-glass rounded-full px-4 py-2 mb-8 flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span className="font-body text-xs text-white/60 tracking-[0.3em] uppercase">
              AI-Powered Pose Intelligence
            </span>
            <Sparkles size={12} className="text-cyan-400" />
          </motion.div>

          {/* Title */}
          <h1
            ref={titleRef}
            className="font-display text-6xl md:text-8xl lg:text-9xl text-white tracking-tight leading-[0.9] mb-6 whitespace-nowrap"
          >
            PoseSense
          </h1>

          {/* Subtitle with animated role */}
          <motion.div
            className="font-body text-xl md:text-2xl text-white/50 mb-12 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span>Behavior</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                className="font-display italic text-white"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
            <span>System</span>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <motion.button
              onClick={onLaunch}
              className="relative group flex items-center gap-3 bg-white text-bg rounded-full px-8 py-4 font-body font-semibold text-sm overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">⚡ Launch System</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>

            <motion.button
              className="gradient-border flex items-center gap-2 rounded-full px-8 py-4 font-body text-sm text-white/80 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Features
            </motion.button>
          </motion.div>

          {/* Body scan SVG */}
          <motion.div
            className="relative w-48 h-64"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <svg viewBox="0 0 100 160" fill="none" className="w-full h-full opacity-60">
              <circle cx="50" cy="18" r="12" stroke="rgba(0,255,255,0.6)" strokeWidth="1" />
              <line x1="50" y1="30" x2="50" y2="38" stroke="rgba(0,255,255,0.4)" strokeWidth="1" />
              <line x1="20" y1="42" x2="80" y2="42" stroke="rgba(0,255,255,0.6)" strokeWidth="1" />
              <line x1="50" y1="38" x2="50" y2="90" stroke="rgba(0,255,255,0.4)" strokeWidth="1" />
              <line x1="20" y1="42" x2="8" y2="72" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
              <line x1="8" y1="72" x2="4" y2="98" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />
              <line x1="80" y1="42" x2="92" y2="72" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
              <line x1="92" y1="72" x2="96" y2="98" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />
              <line x1="34" y1="90" x2="66" y2="90" stroke="rgba(0,255,255,0.6)" strokeWidth="1" />
              <line x1="34" y1="90" x2="28" y2="125" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
              <line x1="28" y1="125" x2="24" y2="155" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />
              <line x1="66" y1="90" x2="72" y2="125" stroke="rgba(0,255,255,0.5)" strokeWidth="1" />
              <line x1="72" y1="125" x2="76" y2="155" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />
              {[
                [50, 18], [20, 42], [80, 42], [8, 72], [92, 72],
                [4, 98], [96, 98], [34, 90], [66, 90],
                [28, 125], [72, 125], [24, 155], [76, 155],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="2.5" fill="#00ffff" opacity="0.8">
                  <animate
                    attributeName="opacity"
                    values="0.8;0.2;0.8"
                    dur={`${1.5 + i * 0.1}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ))}
            </svg>
            {/* Scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
                boxShadow: '0 0 8px #00ffff',
              }}
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <span className="font-body text-xs text-muted tracking-[0.3em] uppercase">Scroll</span>
            <ChevronDown size={16} className="text-muted animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────── */}
      <section ref={statsRef} className="py-20 px-6 border-t border-stroke">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="font-display text-5xl md:text-6xl text-white mb-2"
                style={{
                  background: 'linear-gradient(90deg, #00ffff, #7b2fff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {s.num}
              </div>
              <div className="font-body text-xs text-muted tracking-widest uppercase">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────── */}
      <section className="py-32 px-6 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(0,255,255,0.03) 0%, transparent 70%)',
        }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            <span className="font-body text-xs text-white/40 tracking-widest uppercase">
              About PoseSense
            </span>
          </motion.div>
          <motion.h2
            className="font-display text-5xl md:text-7xl text-white tracking-tight leading-[1.1] mt-4"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, margin: '-100px' }}
          >
            Pioneering ideas for{' '}
            <em className="italic text-white/50">minds that</em>
            <br />
            <em className="italic text-white/50">create, build, and inspire.</em>
          </motion.h2>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <motion.span
                className="font-body text-xs text-white/40 tracking-widest uppercase"
                initial={{ opacity: 0 }}
                animate={featuresInView ? { opacity: 1 } : {}}
              >
                Core Intelligence
              </motion.span>
              <motion.h2
                className="font-display text-4xl md:text-5xl text-white mt-2"
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
              >
                Featured <em className="italic text-white/50">modules</em>
              </motion.h2>
            </div>
            <motion.button
              onClick={onLaunch}
              className="hidden md:flex items-center gap-2 liquid-glass rounded-full px-6 py-3 font-body text-sm text-white/70 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Try Live <ArrowUpRight size={14} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="liquid-glass rounded-3xl p-8 group hover:border-white/20 transition-all"
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                >
                  <f.icon size={20} style={{ color: f.color }} strokeWidth={1.5} />
                </div>
                <h3 className="font-body font-semibold text-white text-lg mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-white/50 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(123,47,255,0.08) 0%, transparent 70%)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-5xl md:text-7xl text-white tracking-tight mb-6">
            Ready to see your
            <br />
            <em className="italic text-white/50">body intelligence?</em>
          </h2>
          <p className="font-body text-white/40 mb-12 text-lg tracking-wide">
            Launch the live system and experience real-time pose AI
          </p>
          <motion.button
            onClick={onLaunch}
            className="inline-flex items-center gap-3 bg-white text-bg rounded-full px-10 py-5 font-body font-semibold text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⚡ Activate PoseSense
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="py-8 px-6 border-t border-stroke flex justify-between items-center flex-wrap gap-4">
        <span className="font-body text-xs text-muted tracking-widest uppercase">
          PoseSense
        </span>
        <span className="font-body text-xs text-muted">
          Built with MediaPipe · FastAPI · React
        </span>
        <span className="font-body text-xs text-muted tracking-widest uppercase">
          Real-Time Behavior AI
        </span>
      </footer>
    </div>
  )
}