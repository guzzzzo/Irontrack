import { useMemo, useState } from 'react'
import { exercisesDB } from '../../data/exercisesDB'
import { useApp } from '../../context/AppContext'
import { formatFullDateES, roundTo } from '../../utils/calculations'
import { Calendar, ChevronDown, ChevronUp, Dumbbell, History, Trash2, Trophy } from 'lucide-react'

export function WorkoutHistory() {
  const { state, deleteWorkoutSession } = useApp()
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const allExercises = useMemo(() => {
    return [...exercisesDB, ...(state.customExercises || [])]
  }, [state.customExercises])

  const exerciseMap = useMemo(() => {
    const map = new Map()
    allExercises.forEach((e) => map.set(e.id, e))
    return map
  }, [allExercises])

  const sortedSessions = useMemo(() => {
    return [...(state.workoutSessions || [])].sort((a, b) => {
      const dateA = a.startedAt || a.date || ''
      const dateB = b.startedAt || b.date || ''
      return dateB.localeCompare(dateA)
    })
  }, [state.workoutSessions])

  const toggleExpand = (id) => {
    setExpandedSessionId((prev) => (prev === id ? null : id))
  }

  if (sortedSessions.length === 0) {
    return (
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500 mx-auto">
          <History className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-100">Sin historial de entrenamientos todavía</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          Inicia un entrenamiento en la pestaña &quot;Entrenar&quot; y haz clic en &quot;Finalizar entreno&quot; para registrar tu primera sesión aquí.
        </p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-50">Historial de Entrenamientos</h2>
          <p className="text-xs text-zinc-400">
            {sortedSessions.length} sesión{sortedSessions.length === 1 ? '' : 'es'} registrada{sortedSessions.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sortedSessions.map((session) => {
          const isExpanded = expandedSessionId === session.id
          const isDeleting = confirmDeleteId === session.id
          const totalKg = Number(session.totalVolumeKg) || 0
          const setsCount = session.sets?.length || 0

          // Agrupar las series de la sesión por ejercicio
          const setsByExercise = {}
          if (session.sets) {
            session.sets.forEach((set) => {
              if (!setsByExercise[set.exerciseId]) {
                setsByExercise[set.exerciseId] = []
              }
              setsByExercise[set.exerciseId].push(set)
            })
          }

          return (
            <div
              key={session.id}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden transition-all"
            >
              <div
                onClick={() => toggleExpand(session.id)}
                className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-zinc-850/50"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mt-0.5">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-100 truncate">
                      {session.templateName || 'Entrenamiento libre'}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                      <span className="capitalize">{formatFullDateES(session.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">
                      {totalKg.toLocaleString('es-ES')} kg
                    </div>
                    <div className="text-xs text-zinc-500">{setsCount} series</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDeleting ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWorkoutSession(session.id)
                          setConfirmDeleteId(null)
                        }}
                        className="min-h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Confirmar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteId(session.id)
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Eliminar sesión del historial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-zinc-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle desplegable de las series del entrenamiento */}
              {isExpanded && (
                <div className="p-4 sm:p-5 pt-0 border-t border-zinc-800/80 space-y-3 bg-zinc-950/40">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 pt-3">
                    Desglose de ejercicios y series:
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(setsByExercise).map(([exId, exSets]) => {
                      const exerciseInfo = exerciseMap.get(exId)
                      return (
                        <div key={exId} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-200">
                              {exerciseInfo?.name || exId}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {exerciseInfo?.primaryMuscle || 'Ejercicio'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {exSets.map((s, sIdx) => (
                              <div
                                key={s.id || sIdx}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-zinc-900/60"
                              >
                                <span className="text-zinc-400">Serie {s.setNumber || sIdx + 1}</span>
                                <div className="flex items-center gap-2">
                                  <strong className="text-zinc-100">{s.weightKg} kg × {s.reps} reps</strong>
                                  <span className="text-zinc-500">(RIR {s.rir})</span>
                                  {Number(s.estimated1RM) > 0 && (
                                    <span className="text-emerald-400 font-semibold text-[11px]">
                                      1RM: {s.estimated1RM} kg
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

