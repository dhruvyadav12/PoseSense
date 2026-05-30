import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Activity, Zap, Shield,
  ArrowLeft, Maximize2
} from 'lucide-react'
import { useCamera } from '../hooks/useCamera'

interface Props {
  onBack: () => void
}

function GaugeBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

function MiniGraph({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')!
    c.width = c.offsetWidth
    c.height = c.offsetHeight
    ctx.clearRect(0, 0, c.width, c.height)
    const max = Math.max(...data, 1)
    const step = c.width / (data.length - 1)
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step
      const y = c.height - (v / max) * c.height * 0.9 - 2
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.shadowBlur = 4
    ctx.shadowColor = color
    ctx.stroke()
    ctx.lineTo(c.width, c.height)
    ctx.lineTo(0, c.height)
    ctx.closePath()
    ctx.fillStyle = `${color}15`
    ctx.fill()
  }, [data, color])

  return <canvas ref={canvasRef} className="w-full" height={50} />
}

const motPct: Record<string, number> = { High: 90, Medium: 55, Low: 20 }
const stabPct: Record<string, number> = { High: 90, Medium: 55, Low: 20 }
const motColor: Record<string, string> = { High: '#ff0050', Medium: '#ffa500', Low: '#00ff64' }
const stabColor: Record<string, string> = { High: '#00ff64', Medium: '#ffa500', Low: '#ff0050' }
const ctxColor: Record<string, string> = {
  gym: '#00ff64', office: '#00ffff', home: '#7b2fff',
  active: '#ffa500', standing: '#00ffff', unknown: '#ff0050',
}

export default function Dashboard({ onBack }: Props) {
  const { running, data, fps, start, stop } = useCamera()
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const feedRef = useRef<HTMLImageElement>(null)
  const [zoomed, setZoomed] = useState(false)
  const [clock, setClock] = useState('')
  const [motHistory] = useState(() => new Array(60).fill(0))
  const [stabHistory] = useState(() => new Array(60).fill(0))
  const [prevReps, setPrevReps] = useState(0)

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!data) return
    motHistory.push(motPct[data.motion] || 0)
    motHistory.shift()
    stabHistory.push(stabPct[data.stability] || 0)
    stabHistory.shift()

    if (data.reps > prevReps) {
      setPrevReps(data.reps)
    }

    // Draw overlay
    const canvas = overlayRef.current
    const feed = feedRef.current
    if (!canvas || !feed) return
    const wrap = canvas.parentElement!
    canvas.width = wrap.offsetWidth
    canvas.height = wrap.offsetHeight
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!data.keypoints?.length) return
    const kp: Record<string, { x: number; y: number; confidence: number }> = {}
    data.keypoints.forEach(k => (kp[k.name] = k))
    const w = canvas.width, h = canvas.height

    // Crosshair
    if (kp.nose && kp.nose.confidence > 0.5) {
      const nx = (kp.nose.x / 640) * w
      const ny = (kp.nose.y / 480) * h
      ctx.strokeStyle = 'rgba(0,255,255,0.8)'
      ctx.lineWidth = 1
      ctx.shadowBlur = 6
      ctx.shadowColor = '#00ffff'
      ;[
        [nx - 20, ny, nx - 6, ny],
        [nx + 6, ny, nx + 20, ny],
        [nx, ny - 20, nx, ny - 6],
        [nx, ny + 6, nx, ny + 20],
      ].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      })
      ctx.beginPath()
      ctx.arc(nx, ny, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#00ffff'
      ctx.fill()
    }

    // Skeleton
    const conns = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'], ['right_knee', 'right_ankle'],
      ['nose', 'left_shoulder'], ['nose', 'right_shoulder'],
    ]
    ctx.shadowBlur = 8
    ctx.shadowColor = 'rgba(0,255,255,0.5)'
    conns.forEach(([a, b]) => {
      if (kp[a] && kp[b] && kp[a].confidence > 0.4 && kp[b].confidence > 0.4) {
        ctx.beginPath()
        ctx.moveTo((kp[a].x / 640) * w, (kp[a].y / 480) * h)
        ctx.lineTo((kp[b].x / 640) * w, (kp[b].y / 480) * h)
        ctx.strokeStyle = 'rgba(0,255,255,0.6)'
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
    Object.values(kp).forEach(k => {
      if (k.confidence > 0.4) {
        ctx.beginPath()
        ctx.arc((k.x / 640) * w, (k.y / 480) * h, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,255,255,0.9)'
        ctx.shadowBlur = 8
        ctx.shadowColor = '#00ffff'
        ctx.fill()
      }
    })
    ctx.shadowBlur = 0
  }, [data])

  const mPct = motPct[data?.motion || ''] || 0
  const sPct = stabPct[data?.stability || ''] || 0
  const mCol = motColor[data?.motion || ''] || '#00ffff'
  const sCol = stabColor[data?.stability || ''] || '#00ffff'
  const cCol = ctxColor[data?.context || ''] || '#00ffff'

  return (
    <div className="h-screen bg-bg text-white overflow-hidden flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-stroke bg-bg/90 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <Brain size={18} className="text-cyan-400" strokeWidth={1.5} />
          <span className="font-body font-semibold text-sm tracking-widest text-white uppercase">
            PoseSense
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5">
            <div className={`w-2 h-2 rounded-full ${running ? 'bg-green-400' : 'bg-red-500'} shadow-[0_0_6px_currentColor]`} />
            <span className="font-body text-xs tracking-widest uppercase text-white/60">
              {running ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="font-body text-sm text-white/40 tabular-nums">{clock}</span>
          <span className="font-body text-xs text-white/30 tabular-nums">FPS: {fps}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 font-body text-xs text-white/25">
            <kbd className="border border-white/10 px-2 py-0.5 rounded bg-white/3">SPACE</kbd> activate
            <kbd className="border border-white/10 px-2 py-0.5 rounded bg-white/3">ESC</kbd> stop
          </div>
          <motion.button
            onClick={onBack}
            className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2 font-body text-xs text-white/60 hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            <ArrowLeft size={12} /> Back
          </motion.button>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="flex-1 grid grid-cols-[260px_1fr_260px] gap-3 p-3 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="liquid-glass rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
          <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-3">
            ◈ Intelligence Data
          </div>

          {/* Context */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <div className="font-body text-[10px] text-white/30 tracking-[3px] uppercase mb-1">Context</div>
            <div
              className="font-body font-bold text-lg uppercase tracking-wider"
              style={{ color: cCol, textShadow: `0 0 12px ${cCol}80` }}
            >
              {data?.context || '——'}
            </div>
          </div>

          {/* Motion */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-body text-[10px] text-white/30 tracking-[3px] uppercase">Motion</span>
              <span className="font-body text-[10px]" style={{ color: mCol }}>{data?.motion || '——'}</span>
            </div>
            <GaugeBar value={mPct} color={mCol} />
          </div>

          {/* Stability */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-body text-[10px] text-white/30 tracking-[3px] uppercase">Stability</span>
              <span className="font-body text-[10px]" style={{ color: sCol }}>{data?.stability || '——'}</span>
            </div>
            <GaugeBar value={sPct} color={sCol} />
          </div>

          {/* Frames */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <div className="font-body text-[10px] text-white/30 tracking-[3px] uppercase mb-1">Frames</div>
            <div className="font-body font-bold text-lg text-white tabular-nums">
              {data?.frames || '——'}
            </div>
          </div>

          {/* Motion graph */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Motion History
            </div>
            <MiniGraph data={[...motHistory]} color="#00ffff" />
          </div>

          {/* Signal bars */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Signal
            </div>
            <div className="flex items-end gap-0.5 h-5">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-cyan-400/40"
                  style={{
                    height: `${30 + Math.random() * 70}%`,
                    animation: `mbarAnim ${0.4 + Math.random() * 0.8}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CENTER VIDEO */}
        <div className="liquid-glass rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${running ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
              <span className="font-body text-xs tracking-[3px] uppercase text-white/40">
                {running ? 'Live' : 'Standby'}
              </span>
            </div>
            <span className="font-body text-[10px] text-white/20 tracking-[2px] uppercase">
              MediaPipe Neural Engine v3.0
            </span>
            <motion.button
              onClick={() => setZoomed(z => !z)}
              className="liquid-glass rounded-full p-1.5 text-white/40 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              <Maximize2 size={12} />
            </motion.button>
          </div>

          {/* Video area */}
          <div className="relative flex-1 overflow-hidden cursor-crosshair">
            {!running ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {/* Sonar */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {[25, 50, 78].map((size, i) => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border border-cyan-400/30"
                      style={{ width: size, height: size }}
                      animate={{ scale: [0.7, 1], opacity: [0.8, 0] }}
                      transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
                    />
                  ))}
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00ffff]" />
                </div>
                <span className="font-body text-xs text-white/25 tracking-[4px] uppercase">
                  Awaiting Signal
                </span>
              </div>
            ) : data?.frame ? (
              <>
                <img
                  ref={feedRef}
                  src={`data:image/jpeg;base64,${data.frame}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="feed"
                />
                <canvas
                  ref={overlayRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Activity size={24} className="text-white/20 animate-pulse" />
              </div>
            )}

            {/* Zoom overlay */}
            <AnimatePresence>
              {zoomed && data?.frame && (
                <motion.div
                  className="absolute inset-0 bg-black/95 flex items-center justify-center z-20 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setZoomed(false)}
                >
                  <img
                    src={`data:image/jpeg;base64,${data.frame}`}
                    className="max-w-full max-h-full object-contain"
                    alt="zoomed"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex gap-3 p-3 border-t border-white/5 flex-shrink-0">
            <motion.button
              onClick={running ? stop : start}
              className="flex-1 py-3 font-body text-xs font-bold tracking-[3px] uppercase text-bg rounded-xl accent-gradient"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {running ? '■ Terminate' : '⚡ Activate'}
            </motion.button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="liquid-glass rounded-2xl p-4 flex flex-col gap-4 overflow-hidden">
          <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-3">
            ◈ Exercise Tracker
          </div>

          {/* Exercise type */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-3">
            <div className="font-body text-[10px] text-white/30 tracking-[3px] uppercase mb-1">Exercise</div>
            <div className="font-body font-bold text-sm text-purple-400 uppercase tracking-wider">
              {data?.exercise_active ? data.exercise : 'Inactive'}
            </div>
          </div>

          {/* Rep counter */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 text-center">
            <motion.div
              key={data?.reps}
              className="font-display text-6xl font-black text-purple-400"
              style={{ textShadow: '0 0 20px rgba(123,47,255,0.8)' }}
              animate={{ scale: data?.reps !== prevReps ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {data?.reps ?? '—'}
            </motion.div>
            <div className="font-body text-[10px] text-purple-400/50 tracking-[4px] uppercase mt-1">
              Repetitions
            </div>
          </div>

          {/* Rep history */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Rep History
            </div>
            <MiniGraph data={new Array(60).fill(0)} color="#7b2fff" />
          </div>

          {/* Alerts */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Threat Monitor
            </div>
            <AnimatePresence mode="popLayout">
              {data?.alerts?.length ? (
                data.alerts.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`rounded-xl p-3 mb-2 font-body text-xs font-bold tracking-[2px] uppercase ${
                      a.type === 'danger'
                        ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                        : 'bg-orange-500/10 border border-orange-500/40 text-orange-400'
                    }`}
                    style={
                      a.type === 'danger'
                        ? { animation: 'dangerPulse 0.8s ease-in-out infinite' }
                        : {}
                    }
                  >
                    {a.type === 'danger' ? '⚠ ' : '👁 '}{a.text}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 font-body text-xs text-green-400 font-bold tracking-[2px] uppercase"
                >
                  ◉ All Systems Clear
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stability trend */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Stability Trend
            </div>
            <MiniGraph data={[...stabHistory]} color="#00ff64" />
          </div>

          {/* Neural load */}
          <div>
            <div className="font-body text-[10px] text-white/40 tracking-[4px] uppercase border-b border-white/5 pb-2 mb-2">
              ◈ Neural Load
            </div>
            <div className="flex items-end gap-0.5 h-5">
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-purple-400/40"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-stroke bg-bg/90 flex-shrink-0 overflow-hidden">
        <span className="font-body text-[10px] text-white/20 tracking-widest uppercase">PoseSense v3.0</span>
        <div className="flex-1 mx-6 overflow-hidden">
          <motion.div
            className="font-body text-[10px] text-white/15 tracking-[3px] uppercase whitespace-nowrap"
            animate={{ x: [300, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            ◈ MediaPipe Pose Engine ◈ 33 Keypoint Tracking ◈ Real-Time Behavior AI ◈ Fall Detection ◈ Exercise Analysis ◈ Posture Monitoring ◈
          </motion.div>
        </div>
        <span className="font-body text-[10px] text-white/20 tabular-nums">FPS: {fps}</span>
      </div>

      {/* Keyboard shortcuts */}
      <style>{`
        @keyframes dangerPulse {
          0%,100% { box-shadow: 0 0 8px rgba(255,0,80,0.2); }
          50% { box-shadow: 0 0 25px rgba(255,0,80,0.6); }
        }
        @keyframes mbarAnim {
          from { opacity: 0.4; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}