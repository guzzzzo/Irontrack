import { useMemo, useState } from 'react'
import { calculateEpley1RM, compareSetProgression, getTodayISO, roundTo } from '../../utils/calculations'
import { exercisesDB } from '../../data/exercisesDB'
import { useApp } from '../../context/AppContext'
import { RestTimer } from './RestTimer'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Minus,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react'

export function ActiveWorkout() {
  const { state, getTemplateById, saveWorkoutSession } = useApp()
  const [templateId, setTemplateId] = useState('')
  const [started, setStarted] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [sessionId, setSessionId] = useState('')
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0)

  // Lista acumulada de series realizadas: { id, exerciseId, setNumber, weightKg, reps, rir, estimated1RM, status }
  const [completedSets, setCompletedSets] = useState([])

  // Estado de la serie actual que se está configurando
  const [currentWeight, setCurrentWeight] = useState(60)
  const [currentReps, setCurrentReps] = useState(10)
  const [currentRir, setCurrentRir] = useState(2)

  // Control del temporizador de descanso
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [workoutFinished, setWorkoutFinished] = useState(false)

  const template = getTemplateById(templateId)
  const currentTemplateExercise = template?.exercises?.[currentExerciseIdx] || null

  const currentCatalogExercise = useMemo(() => {
    if (!currentTemplateExercise) return null
    return (
      state.customExercises.find((e) => e.id === currentTemplateExercise.exerciseId) ||
      exercisesDB.find((e) => e.id === currentTemplateExercise.exerciseId) ||
      null
    )
  }, [state.customExercises, currentTemplateExercise])

  // Historial de la última sesión registrada para este ejercicio específico
  const previousSessionSets = useMemo(() => {
    if (!currentTemplateExercise?.exerciseId) return []
    const allSessions = [...state.workoutSessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    for (const session of allSessions) {
      const match = session.sets?.filter((s) => s.exerciseId === currentTemplateExercise.exerciseId)
      if (match && match.length > 0) {
        return match
      }
    }
    return []
  }, [state.workoutSessions, currentTemplateExercise])

  // Series realizadas en el ejercicio actual
  const currentExerciseCompletedSets = useMemo(() => {
    if (!currentTemplateExercise) return []
    return completedSets.filter((s) => s.exerciseId === currentTemplateExercise.exerciseId)
  }, [completedSets, currentTemplateExercise])

  const nextSetNumber = currentExerciseCompletedSets.length + 1

  // Tonelaje total acumulado en todo el entreno
  const totalVolume = useMemo(() => {
    return completedSets.reduce((acc, s) => acc + (s.weightKg * s.reps || 0), 0)
  }, [completedSets])

  // Chequeo de Doble Progresión
  const doubleProgressionAchieved = useMemo(() => {
    if (!currentTemplateExercise || currentExerciseCompletedSets.length === 0) return false
    if (currentExerciseCompletedSets.length < (currentTemplateExercise.targetSets || 3)) return false
    return currentExerciseCompletedSets.every((s) => s.reps >= (currentTemplateExercise.repMax || 12))
  }, [currentExerciseCompletedSets, currentTemplateExercise])

  const startWorkout = (tplId) => {
    const tpl = getTemplateById(tplId)
    if (!tpl) return
    setTemplateId(tplId)
    setSessionId(`ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`)
    setStartedAt(new Date().toISOString())
    setStarted(true)
    setCurrentExerciseIdx(0)
    setCompletedSets([])
    setWorkoutFinished(false)

    // Pre-poblar peso/reps sugeridos según ejercicio 1
    const firstEx = tpl.exercises?.[0]
    if (firstEx) {
      setCurrentReps(firstEx.repMin || 8)
      setCurrentRir(firstEx.targetRir ?? 2)
    }
  }

  const logCurrentSet = () => {
    if (!currentTemplateExercise) return
    const w = Number(currentWeight) || 0
    const r = Number(currentReps) || 0
    const rir = Number(currentRir) || 0

    if (w <= 0 || r <= 0) return

    // Buscar la serie equivalente en la sesión anterior (por setNumber)
    const prevSetMatch = previousSessionSets.find((s) => s.setNumber === nextSetNumber) || previousSessionSets[0] || null

    const currentSetData = {
      weightKg: w,
      reps: r,
      rir,
    }

    const status = compareSetProgression(currentSetData, prevSetMatch)
    const estimated1RM = calculateEpley1RM(w, r)

    const newSet = {
      id: `set_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      exerciseId: currentTemplateExercise.exerciseId,
      setNumber: nextSetNumber,
      weightKg: w,
      reps: r,
      rir,
      estimated1RM,
      status,
    }

    setCompletedSets((prev) => [...prev, newSet])
    setShowRestTimer(true)
  }

  const handleFinishWorkout = () => {
    if (completedSets.length > 0) {
      const session = {
        id: sessionId,
        templateId: template?.id || '',
        templateName: template?.name || 'Entrenamiento libre',
        date: getTodayISO(),
        startedAt: startedAt || new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        totalVolumeKg: roundTo(totalVolume, 1),
        sets: completedSets,
      }
      saveWorkoutSession(session)
    }
    setWorkoutFinished(true)
  }

  const handleReset = () => {
    setStarted(false)
    setTemplateId('')
    setSessionId('')
    setCompletedSets([])
    setCurrentExerciseIdx(0)
    setWorkoutFinished(false)
    setShowRestTimer(false)
  }

  // Vista: Selección de plantilla para empezar
  if (!started) {
    return (
      <section className="surface-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/20 border border-orange-400/30 text-orange-300">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Iniciar Sesión de Entrenamiento</h2>
            <p className="text-xs text-slate-400">
              Selecciona una rutina para cargar tus series objetivo y el registro en tiempo real.
            </p>
          </div>
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="rounded-xl bg-[#090d16] border border-dashed border-white/15 p-6 text-center space-y-2">
            <p className="text-sm text-slate-200 font-semibold">No tienes plantillas creadas todavía</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ve a la pestaña &quot;Plantillas&quot; para crear tu rutina (Push, Pull, Pierna, Full Body, etc.).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {state.workoutTemplates.map((tpl, idx) => {
              const cardGradients = [
                'hover:border-orange-400/50 from-orange-500/10',
                'hover:border-cyan-400/50 from-cyan-500/10',
                'hover:border-emerald-400/50 from-emerald-500/10',
                'hover:border-rose-400/50 from-rose-500/10',
              ]
              const accent = cardGradients[idx % cardGradients.length]
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => startWorkout(tpl.id)}
                  className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-br ${accent} via-[#090d16] to-[#090d16] border border-white/10 transition-all text-left cursor-pointer group`}
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors truncate">
                      {tpl.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {tpl.exercises?.length || 0} ejercicios · {tpl.description || 'Sin notas'}
                    </p>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-300 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </section>
    )
  }

  // Vista: Entrenamiento completado y guardado
  if (workoutFinished) {
    return (
      <section className="surface-card rounded-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/25 to-lime-500/20 border border-orange-400/40 text-amber-300 mx-auto">
          <Trophy className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-white">¡Sesión completada y guardada!</h2>
          <p className="text-xs text-slate-400">
            Tus series y tonelaje se han registrado en el historial de IronTrack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-1">
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-3.5">
            <span className="text-xs text-slate-400">Series totales</span>
            <div className="font-mono tabular-nums text-2xl font-extrabold text-white mt-0.5">
              {completedSets.length}
            </div>
          </div>
          <div className="rounded-xl bg-[#090d16] border border-orange-400/30 p-3.5">
            <span className="text-xs text-slate-400">Tonelaje</span>
            <div className="font-mono tabular-nums text-2xl font-extrabold text-orange-300 mt-0.5">
              {roundTo(totalVolume, 1)} kg
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          Volver al panel de entrenamiento
        </button>
      </section>
    )
  }

  const estimated1RMCurrent = calculateEpley1RM(currentWeight, currentReps)

  return (
    <div className="space-y-5">
      {/* Barra superior de estado de la sesión */}
      <section className="surface-card rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-orange-300">
              Sesión en progreso
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">{template?.name}</h2>
          </div>
          <button
            type="button"
            onClick={handleFinishWorkout}
            className="min-h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            Finalizar entreno
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-2.5">
            <span className="text-slate-400 text-[11px]">Ejercicio</span>
            <div className="font-mono tabular-nums font-bold text-white mt-0.5">
              {currentExerciseIdx + 1} / {template?.exercises?.length || 1}
            </div>
          </div>
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-2.5">
            <span className="text-slate-400 text-[11px]">Series hechas</span>
            <div className="font-mono tabular-nums font-bold text-cyan-300 mt-0.5">{completedSets.length}</div>
          </div>
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-2.5">
            <span className="text-slate-400 text-[11px]">Tonelaje total</span>
            <div className="font-mono tabular-nums font-bold text-orange-300 mt-0.5">
              {roundTo(totalVolume, 1)} kg
            </div>
          </div>
        </div>
      </section>

      {/* Temporizador de descanso (si está activo) */}
      {showRestTimer && (
        <RestTimer
          defaultSeconds={currentTemplateExercise?.restSeconds || 90}
          onClose={() => setShowRestTimer(false)}
        />
      )}

      {/* Alerta de Doble Progresión alcanzada */}
      {doubleProgressionAchieved && (
        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-lime-500/10 to-transparent border border-emerald-400/40 p-4">
          <Sparkles className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-200">
              ¡Doble Progresión Cumplida en este ejercicio!
            </h4>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              Has alcanzado el límite superior ({currentTemplateExercise?.repMax} reps) en todas las series objetivo. Te recomendamos subir <strong>+2.5 kg</strong> en barra/máquina o <strong>+1–2 kg</strong> en mancuernas para tu próxima sesión.
            </p>
          </div>
        </div>
      )}

      {/* Selector y datos del ejercicio actual */}
      <section className="surface-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentExerciseIdx === 0}
            onClick={() => setCurrentExerciseIdx((prev) => Math.max(0, prev - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
            title="Ejercicio anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center min-w-0 flex-1">
            <span className="text-xs font-semibold text-orange-300">
              {currentCatalogExercise?.primaryMuscle || 'Ejercicio'} · {currentCatalogExercise?.type || 'Fuerza'}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white truncate">
              {currentCatalogExercise?.name || currentTemplateExercise?.exerciseId}
            </h3>
            <p className="text-xs text-slate-400 tabular-nums">
              Objetivo: {currentTemplateExercise?.targetSets} series · {currentTemplateExercise?.repMin}–{currentTemplateExercise?.repMax} reps · RIR {currentTemplateExercise?.targetRir ?? 2}
            </p>
          </div>

          <button
            type="button"
            disabled={currentExerciseIdx >= (template?.exercises?.length || 1) - 1}
            onClick={() => setCurrentExerciseIdx((prev) => Math.min((template?.exercises?.length || 1) - 1, prev + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
            title="Siguiente ejercicio"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Comparativa con sesión anterior */}
        {previousSessionSets.length > 0 && (
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-3.5 space-y-2">
            <span className="text-xs font-semibold text-cyan-300 block">
              Última sesión previa:
            </span>
            <div className="flex flex-wrap gap-2">
              {previousSessionSets.map((prev, idx) => (
                <span
                  key={idx}
                  className="font-mono tabular-nums px-2.5 py-1 rounded-lg bg-[#0e1526] border border-white/10 text-xs text-slate-200"
                >
                  S{prev.setNumber}: <strong className="text-white">{prev.weightKg} kg</strong> × {prev.reps} (RIR {prev.rir})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Series ya registradas para este ejercicio */}
        {currentExerciseCompletedSets.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Series completadas hoy:</span>
            <div className="divide-y divide-white/[0.08] rounded-xl bg-[#090d16] border border-white/10 px-3.5">
              {currentExerciseCompletedSets.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
                >
                  <span className="font-bold text-slate-200">Serie {s.setNumber}</span>
                  <div className="flex items-center gap-2.5 font-mono tabular-nums">
                    <span className="text-white font-bold">{s.weightKg} kg × {s.reps}</span>
                    <span className="text-slate-400">RIR {s.rir}</span>
                    <span className="text-orange-300 font-semibold">1RM {s.estimated1RM} kg</span>
                    {s.status === 'improved' && (
                      <span className="text-emerald-300 font-bold text-[11px]">
                        +Progreso
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario táctil para registrar la siguiente serie (diseñado para una mano) */}
        <div className="rounded-xl bg-[#090d16] border border-orange-400/25 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Configurar Serie #{nextSetNumber}</span>
            <span className="text-slate-400 tabular-nums">
              1RM Estimado: <strong className="font-mono text-orange-300">{estimated1RMCurrent} kg</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Peso */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-300">
                Peso (kg)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentWeight((w) => Math.max(0, roundTo(w - 2.5, 1)))}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 text-xs cursor-pointer"
                >
                  -2.5
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value) || 0))}
                  className="flex-1 min-w-0 h-12 text-center rounded-xl bg-[#0e1526] border border-white/10 focus:border-orange-400 focus:outline-none font-mono tabular-nums text-lg font-extrabold text-white"
                />
                <button
                  type="button"
                  onClick={() => setCurrentWeight((w) => roundTo(w + 2.5, 1))}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 text-xs cursor-pointer"
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Repeticiones */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-amber-300">
                Reps
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentReps((r) => Math.max(1, r - 1))}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 min-w-0 h-12 text-center rounded-xl bg-[#0e1526] border border-white/10 focus:border-amber-400 focus:outline-none font-mono tabular-nums text-lg font-extrabold text-white"
                />
                <button
                  type="button"
                  onClick={() => setCurrentReps((r) => r + 1)}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RIR */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-cyan-300">
                RIR (en reserva)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentRir((rir) => Math.max(0, rir - 1))}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 h-12 flex items-center justify-center rounded-xl bg-[#0e1526] border border-white/10 font-mono tabular-nums text-lg font-extrabold text-white">
                  {currentRir}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentRir((rir) => Math.min(5, rir + 1))}
                  className="h-12 w-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] flex items-center justify-center font-bold text-slate-100 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logCurrentSet}
            className="w-full flex items-center justify-center gap-2 min-h-12 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-orange-500/20 transition-all"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Registrar Serie #{nextSetNumber}</span>
          </button>
        </div>
      </section>
    </div>
  )
}
