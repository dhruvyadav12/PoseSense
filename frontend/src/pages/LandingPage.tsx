import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Brain, ArrowRight, Sparkles, Zap,
  Shield, Activity, Eye, Dumbbell,
  ChevronDown, ArrowUpRight,
  CheckCircle, Play, Cpu, Database,
  Monitor, Camera, Layers, Code2,
  Globe, Mail, Share2
} from 'lucide-react'
import LoadingScreen from '../components/LoadingScreen'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  onLaunch: () => void
  onSignIn: () => void
}

const roles = ['Intelligence', 'Detection', 'Analysis', 'Awareness', 'Understanding']

const features = [
  { icon: Brain, title: 'Context Classifier', desc: 'Automatically detects gym, office, home environments using pose analysis — no manual input needed.', color: '#00ffff', tag: 'AI' },
  { icon: Shield, title: 'Fall Detector', desc: 'Real-time fall detection using body orientation and motion analysis. Critical for elder care and workplace safety.', color: '#ff006e', tag: 'Safety' },
  { icon: Dumbbell, title: 'Exercise Analyzer', desc: 'Counts reps, identifies exercise type, and tracks workout intensity using skeletal keypoint patterns.', color: '#7b2fff', tag: 'Fitness' },
  { icon: Activity, title: 'Posture Analyzer', desc: 'Detects slouching, forward head posture, and shoulder imbalance in real-time during desk work.', color: '#00ff64', tag: 'Health' },
  { icon: Eye, title: 'Suspicious Activity', desc: 'Identifies loitering, erratic movement, and crouching behavior for retail and security applications.', color: '#ffa500', tag: 'Security' },
  { icon: Zap, title: 'Live Dashboard', desc: 'Real-time holographic HUD displaying all intelligence data with animated alerts and live camera feed.', color: '#00ffff', tag: 'UI' },
]

const stats = [
  { num: '33', label: 'Pose Landmarks', desc: 'Tracked in real-time' },
  { num: '30+', label: 'FPS Processing', desc: 'Smooth detection' },
  { num: '6', label: 'AI Modules', desc: 'Working together' },
  { num: '95%+', label: 'Accuracy', desc: 'Detection rate' },
]

const steps = [
  { num: '01', title: 'Camera Captures', desc: 'Your webcam captures live video frames at 30fps and sends them to the AI engine.', icon: Camera },
  { num: '02', title: 'Pose Detection', desc: 'MediaPipe extracts 33 body keypoints with confidence scores from each frame.', icon: Cpu },
  { num: '03', title: 'AI Analysis', desc: 'Multiple AI modules analyze context, motion, posture, and behavior simultaneously.', icon: Layers },
  { num: '04', title: 'Live Dashboard', desc: 'Results appear instantly on your holographic dashboard with real-time alerts.', icon: Monitor },
]

const useCases = [
  { title: 'Elder Care', desc: 'Detect falls and monitor daily activity patterns for elderly individuals living alone.', emoji: '🏠' },
  { title: 'Gym & Fitness', desc: 'Count reps automatically and ensure correct exercise form during workouts.', emoji: '🏋️' },
  { title: 'Office Health', desc: 'Monitor posture during desk work and alert when slouching is detected.', emoji: '💼' },
  { title: 'Retail Security', desc: 'Identify suspicious behavior patterns and loitering in retail spaces.', emoji: '🏪' },
  { title: 'Sports Analytics', desc: 'Analyze athletic performance and movement efficiency for coaches.', emoji: '⚽' },
  { title: 'Physiotherapy', desc: 'Track patient recovery progress and movement rehabilitation exercises.', emoji: '🏥' },
]

const techStack = [
  { name: 'MediaPipe', desc: 'Pose Detection', icon: Cpu, color: '#00ffff' },
  { name: 'React', desc: 'Frontend UI', icon: Monitor, color: '#61dafb' },
  { name: 'FastAPI', desc: 'Backend API', icon: Zap, color: '#00ff64' },
  { name: 'OpenCV', desc: 'Image Processing', icon: Camera, color: '#ff006e' },
  { name: 'TensorFlow', desc: 'ML Engine', icon: Brain, color: '#ffa500' },
  { name: 'Python', desc: 'Core Logic', icon: Database, color: '#7b2fff' },
]

const faqs = [
  { q: 'Is my camera data stored anywhere?', a: 'No. All processing happens locally in real-time. No video data is ever stored or transmitted to any server.' },
  { q: 'Does it work offline?', a: 'The AI processing works fully offline. An internet connection is only needed to load the web interface initially.' },
  { q: 'What devices are supported?', a: 'Any device with a webcam and modern browser — Windows, Mac, Linux, and most Android devices.' },
  { q: 'How accurate is the detection?', a: 'PoseSense achieves 95%+ accuracy in good lighting conditions using MediaPipe\'s state-of-the-art pose estimation.' },
  { q: 'Can it detect multiple people?', a: 'Currently optimized for single-person detection. Multi-person support is planned for the next version.' },
]

export default function LandingPage({ onLaunch, onSignIn }: Props) {
  const [loading, setLoading] = useState(true)
  const [roleIndex, setRoleIndex] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadingOutRef = useRef(false)
  const rafRef = useRef<number>(0)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const heroContentRef = useRef<HTMLDivElement>(null)

  // Role cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % roles.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // GSAP entrance
  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.fromTo(nameRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 }
      )
      gsap.fromTo('.blur-in',
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
      )
    })
    return () => ctx.revert()
  }, [loading])

  // Video fade system
  const fadeIn = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    cancelAnimationFrame(rafRef.current)
    fadingOutRef.current = false
    const start = performance.now()
    const from = parseFloat(video.style.opacity || '0')
    const animate = (now: number) => {
      const t = Math.min((now - start) / 500, 1)
      video.style.opacity = String(from + (1 - from) * t)
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  const fadeOut = useCallback(() => {
    const video = videoRef.current
    if (!video || fadingOutRef.current) return
    fadingOutRef.current = true
    cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const from = parseFloat(video.style.opacity || '1')
    const animate = (now: number) => {
      const t = Math.min((now - start) / 500, 1)
      video.style.opacity = String(from * (1 - t))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (loading) return
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      if (video.duration - video.currentTime <= 0.55) fadeOut()
    }
    const onEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => { video.currentTime = 0; video.play(); fadeIn() }, 100)
    }
    const onCanPlay = () => { video.play(); fadeIn() }

    video.style.opacity = '0'
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('ended', onEnded)

    return () => {
      cancelAnimationFrame(rafRef.current)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('ended', onEnded)
    }
  }, [loading, fadeIn, fadeOut])

  if (loading) {
    return (
      <AnimatePresence>
        <LoadingScreen onComplete={() => setLoading(false)} />
      </AnimatePresence>
    )
  }

  return (
    <div className="bg-black text-white overflow-x-hidden">

      {/* ── FIXED NAVBAR ─────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300`}>
        <div className={`liquid-glass rounded-full px-3 py-2 flex items-center gap-1 transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>

          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-1.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00ffff, #7b2fff)' }}>
              <Brain size={14} className="text-black" strokeWidth={2} />
            </div>
            <span className="font-semibold text-white text-sm tracking-wider hidden sm:block">POSESENSE</span>
          </div>

          <div className="w-px h-4 bg-white/10 mx-1" />

          {/* Nav links */}
          {['Features', 'Demo', 'Technology', 'About'].map(item => (
            <a key={item}
              href={`#${item.toLowerCase()}`}
              className="hidden md:block text-xs text-white/60 hover:text-white transition-colors rounded-full px-3 py-1.5 hover:bg-white/5"
            >
              {item}
            </a>
          ))}

          <div className="w-px h-4 bg-white/10 mx-1 hidden md:block" />

          {/* Code2 */}
          <a href="https://Code2.com/adyasha-official/PoseSense"
            target="_blank" rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            <Code2 size={13} /> Code2
          </a>

          {/* Sign In */}
          <button onClick={onSignIn}
            className="text-xs text-white/60 hover:text-white transition-colors rounded-full px-3 py-1.5 hover:bg-white/5"
          >
            Sign In
          </button>

          {/* Launch CTA */}
          <motion.button
            onClick={onLaunch}
            className="text-xs font-medium text-black rounded-full px-4 py-1.5 ml-1"
            style={{ background: 'linear-gradient(90deg, #00ffff, #7b2fff)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Launch ↗
          </motion.button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col bg-black">

        {/* Video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
          muted playsInline preload="auto"
          style={{ opacity: 0, zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent z-[2]" />

        {/* Hero content */}
        <div
          ref={heroContentRef}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 text-center"
        >
          {/* Eyebrow */}
          <div className="blur-in liquid-glass rounded-full px-4 py-2 mb-8 inline-flex items-center gap-2">
            <Sparkles size={12} className="text-white/50" />
            <span className="text-xs text-white/50 tracking-[0.3em] uppercase">
              AI-Powered Pose Intelligence
            </span>
            <Sparkles size={12} className="text-white/50" />
          </div>

          {/* Main title */}
          <h1
            ref={nameRef}
            className="text-7xl md:text-9xl lg:text-[12rem] text-white tracking-tight leading-[0.85] mb-6 opacity-0"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            PoseSense
          </h1>

          {/* Animated role line */}
          <div className="blur-in text-lg md:text-xl text-white/50 mb-10 flex items-center gap-3 flex-wrap justify-center">
            <span>Behavior</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIndex}
                className="text-white"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
            <span>System</span>
          </div>

          {/* Email + CTA */}
          <div className="blur-in max-w-md w-full space-y-4">
            <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
              />
              <motion.button
                onClick={onLaunch}
                className="bg-white rounded-full p-2.5 text-black flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight size={18} />
              </motion.button>
            </div>

            <p className="text-white/40 text-xs leading-relaxed px-2">
              Real-time human pose analysis and behavior detection powered by MediaPipe AI.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              <motion.button
                onClick={onLaunch}
                className="liquid-glass rounded-full px-6 py-2.5 text-white text-sm font-medium inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={14} fill="white" /> Launch Live Demo
              </motion.button>
              <motion.button
                onClick={onLaunch}
                className="rounded-full px-6 py-2.5 text-white/60 text-sm border border-white/10 inline-flex items-center gap-2 hover:text-white hover:border-white/30 transition-all"
                whileHover={{ scale: 1.05 }}
              >
                View Dashboard
              </motion.button>
            </div>
          </div>
        </div>

        {/* Social icons */}
        <div className="relative z-10 flex justify-center gap-3 pb-10">
          {[
            { icon: Share2, label: 'Share2' },
            { icon: Globe, label: 'Globe' },
            { icon: Code2, label: 'Code2' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} aria-label={label}
              className="liquid-glass rounded-full p-3 text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown size={14} className="text-white/20 animate-bounce" />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5" id="about">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl md:text-6xl font-light mb-2 text-white"
                style={{ fontFamily: "'Instrument Serif', serif" }}>
                {s.num}
              </div>
              <div className="text-sm text-white/60 font-medium mb-1">{s.label}</div>
              <div className="text-xs text-white/30">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            About PoseSense
          </motion.p>
          <motion.h2
            className="text-5xl md:text-7xl text-white tracking-tight leading-[1.1] mb-8"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Pioneering ideas for{' '}
            <em className="italic text-white/40">minds that</em>
            <br className="hidden md:block" />
            <em className="italic text-white/40"> create, build, and inspire.</em>
          </motion.h2>
          <motion.p
            className="text-white/40 text-lg max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            PoseSense is an AI-powered human behavior intelligence system that uses computer vision
            to understand what people are doing, how they're moving, and whether they need help —
            all in real-time, all from a simple webcam.
          </motion.p>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className="py-20 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <motion.p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Core Intelligence
              </motion.p>
              <motion.h2
                className="text-4xl md:text-5xl text-white tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
              >
                Featured <em className="italic text-white/40">modules</em>
              </motion.h2>
            </div>
            <motion.button onClick={onLaunch}
              className="hidden md:flex items-center gap-2 liquid-glass rounded-full px-5 py-2.5 text-sm text-white/50 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Try Live <ArrowUpRight size={14} />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                className="liquid-glass rounded-3xl p-7 group cursor-default"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}20` }}>
                    <f.icon size={18} style={{ color: f.color }} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] text-white/30 tracking-widest uppercase border border-white/10 rounded-full px-2 py-0.5">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-medium text-white text-base mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ─────────────────────── */}
      <section className="py-20 px-6" id="demo">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Interactive Demo</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              See it in <em className="italic text-white/40">action</em>
            </h2>
          </motion.div>

          <motion.div
            className="relative liquid-glass rounded-3xl overflow-hidden aspect-video flex items-center justify-center cursor-pointer group"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            viewport={{ once: true }}
            onClick={onLaunch}
            whileHover={{ scale: 1.01 }}
          >
            {/* Mock dashboard preview */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-black" />
            <div className="absolute inset-4 grid grid-cols-3 gap-3 opacity-40">
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Context</div>
                <div className="text-lg font-bold text-cyan-400">STANDING</div>
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-cyan-400/60 rounded-full" />
                </div>
              </div>
              <div className="liquid-glass rounded-2xl p-4 col-span-1 flex flex-col items-center justify-center">
                <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Reps</div>
                <div className="text-5xl font-light text-purple-400" style={{ fontFamily: "'Instrument Serif', serif" }}>12</div>
              </div>
              <div className="liquid-glass rounded-2xl p-4">
                <div className="text-[10px] text-white/40 tracking-widest uppercase mb-2">Status</div>
                <div className="text-sm text-green-400 font-medium">● All Clear</div>
                <div className="mt-2 space-y-1">
                  {['Motion', 'Stability', 'Signal'].map(l => (
                    <div key={l} className="flex items-center gap-2">
                      <div className="text-[9px] text-white/30 w-12">{l}</div>
                      <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400/50 rounded-full" style={{ width: `${Math.random() * 40 + 50}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Play button overlay */}
            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                className="w-20 h-20 rounded-full flex items-center justify-center liquid-glass-strong group-hover:scale-110 transition-transform"
                whileHover={{ scale: 1.1 }}
              >
                <Play size={28} className="text-white ml-1" fill="white" />
              </motion.div>
              <span className="text-white/60 text-sm tracking-widest uppercase">Try Live Demo</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Process</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              How it <em className="italic text-white/40">works</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.num}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}
                <div className="liquid-glass rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs text-white/20 font-mono">{s.num}</span>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5">
                      <s.icon size={16} className="text-white/60" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="text-white font-medium mb-2 text-sm">{s.title}</h3>
                  <p className="text-white/30 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Applications</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Use <em className="italic text-white/40">cases</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((u, i) => (
              <motion.div key={u.title}
                className="liquid-glass rounded-2xl p-6 flex gap-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
              >
                <div className="text-3xl flex-shrink-0">{u.emoji}</div>
                <div>
                  <h3 className="text-white font-medium mb-1.5 text-sm">{u.title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed">{u.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5" id="technology">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Built With</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Technology <em className="italic text-white/40">stack</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((t, i) => (
              <motion.div key={t.name}
                className="liquid-glass rounded-2xl p-5 flex flex-col items-center text-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${t.color}15` }}>
                  <t.icon size={18} style={{ color: t.color }} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-white text-xs font-medium">{t.name}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECT ARCHITECTURE ─────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">System Design</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              Project <em className="italic text-white/40">architecture</em>
            </h2>
          </motion.div>

          <motion.div
            className="liquid-glass rounded-3xl p-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { label: 'Browser', sublabel: 'React + WebCam', icon: Monitor },
                { label: 'FastAPI', sublabel: 'Python Backend', icon: Zap },
                { label: 'MediaPipe', sublabel: 'Pose Detection', icon: Cpu },
                { label: 'AI Modules', sublabel: '6 Analyzers', icon: Brain },
                { label: 'Dashboard', sublabel: 'Live Results', icon: Layers },
              ].map((node, i) => (
                <div key={node.label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center liquid-glass">
                      <node.icon size={22} className="text-white/60" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xs font-medium">{node.label}</div>
                      <div className="text-white/30 text-[10px]">{node.sublabel}</div>
                    </div>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:flex items-center">
                      <div className="w-8 h-px bg-white/10" />
                      <ArrowRight size={12} className="text-white/20" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-3">Questions</p>
            <h2 className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              FAQ
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i}
                className="liquid-glass rounded-2xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between p-5">
                  <span className="text-white text-sm font-medium">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openFaq === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowUpRight size={16} className="text-white/40 flex-shrink-0" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-5 pb-5 text-white/40 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────── */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-xs text-white/30 tracking-[0.3em] uppercase mb-6">Get Started</p>
          <h2 className="text-5xl md:text-7xl text-white tracking-tight mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}>
            Ready to see your
            <br />
            <em className="italic text-white/30">body intelligence?</em>
          </h2>
          <p className="text-white/30 mb-12 text-base max-w-md mx-auto leading-relaxed">
            Launch the live system and experience real-time pose AI — no downloads, no setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button onClick={onLaunch}
              className="inline-flex items-center gap-3 bg-white text-black rounded-full px-10 py-4 font-medium text-sm hover:bg-white/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⚡ Launch PoseSense <ArrowRight size={16} />
            </motion.button>
            <motion.button onClick={onSignIn}
              className="inline-flex items-center gap-3 liquid-glass rounded-full px-10 py-4 text-white/60 text-sm hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              Create Account
            </motion.button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {['No data stored', 'Works offline', 'Open source', 'Free to use'].map(badge => (
              <div key={badge} className="flex items-center gap-1.5 text-white/25 text-xs">
                <CheckCircle size={12} />
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────── */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00ffff, #7b2fff)' }}>
                  <Brain size={14} className="text-black" strokeWidth={2} />
                </div>
                <span className="font-semibold text-white text-sm tracking-wider">POSESENSE</span>
              </div>
              <p className="text-white/25 text-xs max-w-xs leading-relaxed">
                Real-time AI-powered human pose analysis and behavior detection system.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                { title: 'Product', links: ['Features', 'Dashboard', 'Demo', 'Pricing'] },
                { title: 'Project', links: ['Code2', 'Documentation', 'Architecture', 'Roadmap'] },
                { title: 'Connect', links: ['Share2', 'Globe', 'Mail', 'Email'] },
              ].map(col => (
                <div key={col.title}>
                  <div className="text-white/40 text-[10px] tracking-widest uppercase mb-3">{col.title}</div>
                  {col.links.map(link => (
                    <a key={link} href="#"
                      className="block text-white/25 text-xs mb-2 hover:text-white/50 transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-white/5">
            <span className="text-white/15 text-xs">© 2026 PoseSense. Built with MediaPipe · FastAPI · React</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/25 text-xs">Available for collaboration</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}