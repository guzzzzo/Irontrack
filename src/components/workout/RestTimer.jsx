import { useEffect, useState } from 'react'
import { Bell, Pause, Play, RotateCcw, Timer, X } from 'lucide-react'
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

  const progressPct =
    targetSeconds > 0
      ? Math.max(0, Math.min(100, ((targetSeconds - secondsRemaining) / targetSeconds) * 100))
      : 0

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isCompleted
          ? 'bg-gradient-to-br from-emerald-500/20 via-[#0e1526] to-[#090d16] border-emerald-400/50 shadow-lg shadow-emerald-500/15'
          : 'surface-card'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isCompleted
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-cyan-500/20 border border-cyan-400/30 text-cyan-300'
            }`}
          >
            {isCompleted ? <Bell className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isCompleted ? '¡Tiempo de descanso cumplido!' : 'Temporizador de descanso'}
            </h4>
            <p className="text-xs text-slate-400 tabular-nums">
              {isCompleted ? 'Listo para la siguiente serie' : `Objetivo: ${targetSeconds}s`}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-2.5 w-full rounded-full bg-[#090d16] border border-white/10 overflow-hidden mb-4">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted
              ? 'bg-gradient-to-r from-emerald-400 to-lime-400'
              : 'bg-gradient-to-r from-cyan-400 to-indigo-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Reloj central */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustSeconds(-15)}
            className="min-h-11 px-3 rounded-xl bg-[#090d16] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer"
            title="Restar 15 segundos"
          >
            -15s
          </button>
          <button
            type="button"
            onClick={() => adjustSeconds(30)}
            className="min-h-11 px-3 rounded-xl bg-[#090d16] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer"
            title="Sumar 30 segundos"
          >
            +30s
          </button>
        </div>

        <div
          className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-wider ${
            isCompleted ? 'text-emerald-300' : 'text-white'
          }`}
        >
          {formatTime(secondsRemaining)}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRun}
            className={`flex items-center justify-center min-h-11 px-4 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
              isRunning
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950'
                : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950'
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
            className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#090d16] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            title="Reiniciar temporizador"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
