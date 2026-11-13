import { useEffect, useState } from 'react'
import { Bell, Minus, Pause, Play, Plus, RotateCcw, Timer, X } from 'lucide-react'
import { playAlert, vibrate } from '../../utils/sound'

export function RestTimer({ defaultSeconds = 90, onComplete, onClose }) {
  const [targetSeconds, setTargetSeconds] = useState(defaultSeconds)
  const [secondsRemaining, setSecondsRemaining] = useState(defaultSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    setTargetSeconds(defaultSeconds)
    setSecondsRemaining(defaultSeconds)
    setIsRunning(false)
    setIsCompleted(false)
  }, [defaultSeconds])

  useEffect(() => {
    let interval = null
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setIsRunning(false)
            setIsCompleted(true)
            playAlert()
            vibrate([400, 150, 400])
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, secondsRemaining, onComplete])

  const toggleRun = () => {
    if (secondsRemaining === 0) {
      setSecondsRemaining(targetSeconds)
      setIsCompleted(false)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setSecondsRemaining(targetSeconds)
  }

  const adjustSeconds = (delta) => {
    setSecondsRemaining((prev) => Math.max(5, prev + delta))
    setTargetSeconds((prev) => Math.max(5, prev + delta))
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}:${String(rem).padStart(2, '0')}`
  }

  const progressPct = targetSeconds > 0
    ? Math.max(0, Math.min(100, ((targetSeconds - secondsRemaining) / targetSeconds) * 100))
    : 0

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 transition-all ${
      isCompleted
        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
        : 'bg-zinc-900 border-zinc-800'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isCompleted ? 'bg-emerald-500 text-zinc-950' : 'bg-cyan-500/15 text-cyan-400'
          }`}>
            {isCompleted ? <Bell className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">
              {isCompleted ? '¡Tiempo de descanso cumplido!' : 'Temporizador de descanso'}
            </h4>
            <p className="text-xs text-zinc-400">
              {isCompleted ? 'Listo para la siguiente serie' : `Objetivo: ${targetSeconds}s`}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-2 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted ? 'bg-emerald-500' : 'bg-cyan-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Reloj central */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustSeconds(-15)}
            className="min-h-10 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
            title="Restar 15 segundos"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(30)}
            className="min-h-10 px-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
            title="Sumar 30 segundos"
          >
            +30s
          </button>
        </div>

        <div className={`text-3xl sm:text-4xl font-black font-mono tracking-wider ${
          isCompleted ? 'text-emerald-400 animate-pulse' : 'text-zinc-50'
        }`}>
          {formatTime(secondsRemaining)}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRun}
            className={`flex items-center justify-center min-h-11 px-4 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-1.5" /> Pausa
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5" /> Iniciar
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="flex items-center justify-center h-11 w-11 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            title="Reiniciar temporizador"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

