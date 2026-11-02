import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Timer, Play, Pause, RotateCcw } from 'lucide-react'

type Phase = 'focus' | 'break'

export default function PomodoroPanel(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('focus')
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    if (!running) {
      return
    }
    const id = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [running])

  // Handle timer completion outside of the state updater
  useEffect(() => {
    if (seconds !== 0 || !running) {
      return
    }
    setRunning(false)
    const currentPhase = phaseRef.current
    const nextPhase: Phase = currentPhase === 'focus' ? 'break' : 'focus'
    setPhase(nextPhase)
    setSeconds(nextPhase === 'break' ? 5 * 60 : 25 * 60)
  }, [seconds, running])

  const reset = useCallback(() => {
    setRunning(false)
    setPhase('focus')
    setSeconds(25 * 60)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Timer size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium">Pomodoro</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {phase === 'focus' ? '🍅 Focus' : '☕ Break'}
        </div>
        <div className="font-mono text-4xl font-bold tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
