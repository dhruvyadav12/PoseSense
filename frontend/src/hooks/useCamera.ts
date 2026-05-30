import { useRef, useState, useCallback } from 'react'

export interface FrameData {
  frame: string
  keypoints: Array<{ name: string; x: number; y: number; confidence: number }>
  context: string
  stability: string
  motion: string
  frames: number
  exercise: string
  reps: number
  exercise_active: boolean
  alerts: Array<{ type: string; text: string }>
}

export function useCamera() {
  const [running, setRunning] = useState(false)
  const [data, setData] = useState<FrameData | null>(null)
  const [fps, setFps] = useState(0)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const loopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(Date.now())

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      streamRef.current = stream

      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      videoRef.current = video

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      canvasRef.current = canvas

      setRunning(true)
      poll()
    } catch (e) {
      alert('Camera access denied! Please allow camera access.')
    }
  }, [])

  const stop = useCallback(() => {
    setRunning(false)
    if (loopRef.current) clearTimeout(loopRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setData(null)
  }, [])

  const poll = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      const ctx = canvasRef.current.getContext('2d')!
      ctx.drawImage(videoRef.current, 0, 0, 640, 480)

      const blob = await new Promise<Blob>(resolve =>
        canvasRef.current!.toBlob(b => resolve(b!), 'image/jpeg', 0.8)
      )

      const formData = new FormData()
      formData.append('file', blob, 'frame.jpg')

      const res = await fetch('/process', { method: 'POST', body: formData })
      const json: FrameData = await res.json()
      setData(json)

      frameCountRef.current++
      const now = Date.now()
      if (now - lastTimeRef.current > 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastTimeRef.current = now
      }
    } catch (e) {
      console.error(e)
    }

    loopRef.current = setTimeout(poll, 100)
  }, [])

  return { running, data, fps, start, stop }
}