import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, ArrowRight, Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface Props {
  onBack: () => void
  onSuccess: () => void
}

export default function SignIn({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadingOutRef = useRef(false)
  const rafRef = useRef<number>(0)

  // Video fade system
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const fadeIn = () => {
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
    }

    const fadeOut = () => {
      if (fadingOutRef.current) return
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
    }

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
  }, [])

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    onSuccess()
  }

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">

      {/* ── VIDEO BACKGROUND ── */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7e-ad63-ae3e392c32d4.mp4"
        muted playsInline preload="auto"
        style={{ opacity: 0, zIndex: 0 }}
      />
      <div className="absolute inset-0 bg-black/60 z-[1]" />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00ffff, #7b2fff)' }}>
            <Brain size={16} className="text-black" strokeWidth={2} />
          </div>
          <span className="font-semibold text-white tracking-wider text-sm">POSESENSE</span>
        </div>

        <div>
          <motion.h2
            className="text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6"
            style={{ fontFamily: "'Instrument Serif', serif" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            AI-Powered
            <br />
            <em className="italic text-white/40">Human Motion</em>
            <br />
            Analysis
          </motion.h2>
          <motion.p
            className="text-white/40 text-sm leading-relaxed max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Real-time pose detection, behavior analysis, and intelligent insights
            from just a webcam. No hardware needed.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {['33 Keypoints', 'Real-time AI', 'Fall Detection', 'Exercise Tracking', 'Posture Analysis'].map(f => (
              <span key={f} className="liquid-glass rounded-full px-3 py-1.5 text-xs text-white/50">
                {f}
              </span>
            ))}
          </motion.div>
        </div>

        <p className="text-white/15 text-xs">© 2026 PoseSense. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL — FORM ── */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6">
        <motion.div
          className="liquid-glass-strong rounded-3xl p-8 w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-xs mb-8"
          >
            <ArrowLeft size={14} /> Back to home
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00ffff, #7b2fff)' }}>
                <Brain size={14} className="text-black" strokeWidth={2} />
              </div>
              <span className="font-semibold text-white text-sm tracking-wider">POSESENSE</span>
            </div>

            <h1 className="text-3xl text-white mb-2 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}>
              {mode === 'signin' ? 'Welcome back' : 'Get started'}
            </h1>
            <p className="text-white/30 text-sm">
              {mode === 'signin'
                ? 'Sign in to access your PoseSense dashboard'
                : 'Create your free account to get started'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex liquid-glass rounded-full p-1 mb-8">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 text-xs font-medium transition-all ${
                  mode === m
                    ? 'bg-white text-black'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-4 mb-6">
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">
                  Full Name
                </label>
                <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm outline-none"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">
                Email
              </label>
              <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-white/30 text-xs tracking-widest uppercase mb-2 block">
                Password
              </label>
              <div className="liquid-glass rounded-xl px-4 py-3 flex items-center gap-3">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/20 text-sm outline-none"
                />
                <button
                  onClick={() => setShowPass(s => !s)}
                  className="text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot password */}
          {mode === 'signin' && (
            <div className="flex justify-end mb-6">
              <button className="text-white/25 hover:text-white/50 transition-colors text-xs">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <motion.button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-black font-medium text-sm flex items-center justify-center gap-2 mb-6"
            style={{ background: 'linear-gradient(90deg, #00ffff, #7b2fff)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/20 text-xs">or continue with</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.button
              className="liquid-glass rounded-xl py-3 flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors text-xs"
              whileHover={{ scale: 1.02 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </motion.button>
            <motion.button
              onClick={onSuccess}
              className="liquid-glass rounded-xl py-3 flex items-center justify-center gap-2 text-white/50 hover:text-white transition-colors text-xs"
              whileHover={{ scale: 1.02 }}
            >
              Continue as Guest
            </motion.button>
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="text-white/15 text-xs text-center leading-relaxed">
              By creating an account you agree to our{' '}
              <a href="#" className="text-white/30 hover:text-white/50 underline">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-white/30 hover:text-white/50 underline">Privacy Policy</a>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}