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
  Flame,
  Minus,
  Plus,
  RotateCcw,
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
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-50">Iniciar Sesión de Entrenamiento</h2>
            <p className="text-xs text-zinc-400">
              Selecciona una rutina para cargar tus series objetivo y el registro en tiempo real.
            </p>
          </div>
        </div>

        {state.workoutTemplates.length === 0 ? (
          <div className="rounded-xl bg-zinc-950 border border-dashed border-zinc-800 p-6 text-center space-y-2">
            <p className="text-sm text-zinc-300 font-semibold">No tienes plantillas creadas todavía</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Ve a la pestaña &quot;Plantillas&quot; para crear tu rutina (Push, Pull, Pierna, Full Body, etc.).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {state.workoutTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => startWorkout(tpl.id)}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all text-left cursor-pointer group"
              >
                <div>
                  <h4 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {tpl.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {tpl.exercises?.length || 0} ejercicios · {tpl.description || 'Sin notas'}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    )
  }

  // Vista: Entrenamiento completado y guardado
  if (workoutFinished) {
    return (
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto">
          <Trophy className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-zinc-50">¡Sesión completada y guardada!</h2>
          <p className="text-xs text-zinc-400">
            Tus series y tonelaje se han registrado en el historial de IronTrack.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-2">
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3">
            <span className="text-xs text-zinc-400">Series totales</span>
            <div className="text-2xl font-black text-zinc-100 mt-0.5">{completedSets.length}</div>
          </div>
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3">
            <span className="text-xs text-zinc-400">Tonelaje</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">{roundTo(totalVolume, 1)} kg</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer"
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
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              En progreso
            </span>
            <h2 className="text-base font-bold text-zinc-50">{template?.name}</h2>
          </div>
          <button
            type="button"
            onClick={handleFinishWorkout}
            className="min-h-10 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
          >
            Finalizar entreno
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5">
            <span className="text-zinc-500 text-[11px]">Ejercicio</span>
            <div className="font-bold text-zinc-200 mt-0.5">
              {currentExerciseIdx + 1} / {template?.exercises?.length || 1}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5">
            <span className="text-zinc-500 text-[11px]">Series hechas</span>
            <div className="font-bold text-zinc-200 mt-0.5">{completedSets.length}</div>
          </div>
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-2.5">
            <span className="text-zinc-500 text-[11px]">Tonelaje total</span>
            <div className="font-bold text-emerald-400 mt-0.5">{roundTo(totalVolume, 1)} kg</div>
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
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 p-4">
          <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-emerald-300">
              ¡Doble Progresión Cumplida en este ejercicio!
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5">
              Has alcanzado el límite superior ({currentTemplateExercise?.repMax} reps) en todas las series objetivo. Te recomendamos subir <strong>+2.5 kg</strong> en barra/máquina o <strong>+1–2 kg</strong> en mancuernas para tu próxima sesión.
            </p>
          </div>
        </div>
      )}

      {/* Selector y datos del ejercicio actual */}
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentExerciseIdx === 0}
            onClick={() => setCurrentExerciseIdx((prev) => Math.max(0, prev - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 cursor-pointer"
            title="Ejercicio anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center min-w-0 flex-1">
            <span className="text-xs font-semibold text-emerald-400">
              {currentCatalogExercise?.primaryMuscle || 'Ejercicio'} · {currentCatalogExercise?.type || 'Fuerza'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-zinc-50 truncate">
              {currentCatalogExercise?.name || currentTemplateExercise?.exerciseId}
            </h3>
            <p className="text-xs text-zinc-400">
              Objetivo: {currentTemplateExercise?.targetSets} series · {currentTemplateExercise?.repMin}–{currentTemplateExercise?.repMax} reps · RIR {currentTemplateExercise?.targetRir ?? 2}
            </p>
          </div>

          <button
            type="button"
            disabled={currentExerciseIdx >= (template?.exercises?.length || 1) - 1}
            onClick={() => setCurrentExerciseIdx((prev) => Math.min((template?.exercises?.length || 1) - 1, prev + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-200 cursor-pointer"
            title="Siguiente ejercicio"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Comparativa con sesión anterior */}
        {previousSessionSets.length > 0 && (
          <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Última sesión previa:
            </span>
            <div className="flex flex-wrap gap-2">
              {previousSessionSets.map((prev, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                >
                  S{prev.setNumber}: <strong>{prev.weightKg} kg</strong> × {prev.reps} reps (RIR {prev.rir})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Series ya registradas para este ejercicio */}
        {currentExerciseCompletedSets.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">Series completadas hoy:</span>
            <div className="space-y-1">
              {currentExerciseCompletedSets.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs"
                >
                  <span className="font-bold text-zinc-200">Serie {s.setNumber}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-100 font-semibold">{s.weightKg} kg × {s.reps} reps</span>
                    <span className="text-zinc-500">(RIR {s.rir})</span>
                    <span className="text-emerald-400 font-semibold">1RM: {s.estimated1RM} kg</span>
                    {s.status === 'improved' && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        +PROGRESO
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulario táctil para registrar la siguiente serie (diseñado para una mano) */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200">Configurar Serie #{nextSetNumber}</span>
            <span className="text-zinc-400">1RM Estimado: <strong className="text-emerald-400">{estimated1RMCurrent} kg</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Peso */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                Peso (kg)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentWeight((w) => Math.max(0, roundTo(w - 2.5, 1)))}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  -2.5
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(Math.max(0, Number(e.target.value) || 0))}
                  className="flex-1 min-w-0 h-12 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-lg font-black text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setCurrentWeight((w) => roundTo(w + 2.5, 1))}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Repeticiones */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                Reps
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentReps((r) => Math.max(1, r - 1))}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 min-w-0 h-12 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-lg font-black text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setCurrentReps((r) => r + 1)}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* RIR */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase text-zinc-400">
                RIR (en reserva)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentRir((rir) => Math.max(0, rir - 1))}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-lg font-black text-zinc-50">
                  {currentRir}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentRir((rir) => Math.min(5, rir + 1))}
                  className="h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 flex items-center justify-center font-bold text-zinc-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logCurrentSet}
            className="w-full flex items-center justify-center gap-2 min-h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold text-sm cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>Registrar Serie #{nextSetNumber}</span>
          </button>
        </div>
      </section>
    </div>
  )
}
