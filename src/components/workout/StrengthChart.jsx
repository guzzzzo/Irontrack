import { useMemo, useState } from 'react'
import { exercisesDB } from '../../data/exercisesDB'
import { useApp } from '../../context/AppContext'
import { formatShortDateES, getISOWeekInfo, roundTo } from '../../utils/calculations'
import { BarChart3, Dumbbell, LineChart, Sparkles, TrendingUp } from 'lucide-react'

export function StrengthChart() {
  const { state } = useApp()
  const [chartMode, setChartMode] = useState('1rm') // '1rm' | 'volume'
  const [selectedExerciseId, setSelectedExerciseId] = useState('ex_bench_press_barbell')

  const allExercises = useMemo(() => {
    return [...exercisesDB, ...(state.customExercises || [])]
  }, [state.customExercises])

  // Identificar qué ejercicios tienen al menos una serie registrada
  const recordedExerciseIds = useMemo(() => {
    const ids = new Set()
    state.workoutSessions?.forEach((ws) => {
      ws.sets?.forEach((s) => {
        if (s.exerciseId) ids.add(s.exerciseId)
      })
    })
    return Array.from(ids)
  }, [state.workoutSessions])

  // Lista de ejercicios para el selector (los registrados primero, luego el resto)
  const exerciseOptions = useMemo(() => {
    const recorded = allExercises.filter((e) => recordedExerciseIds.includes(e.id))
    const others = allExercises.filter((e) => !recordedExerciseIds.includes(e.id))
    return [...recorded, ...others]
  }, [allExercises, recordedExerciseIds])

  // Puntos de 1RM a lo largo del tiempo para el ejercicio seleccionado
  const exercisePoints = useMemo(() => {
    if (!selectedExerciseId) return []
    const points = []

    const sortedSessions = [...(state.workoutSessions || [])].sort((a, b) =>
      (a.startedAt || a.date).localeCompare(b.startedAt || b.date)
    )

    sortedSessions.forEach((session) => {
      const setsForExercise = session.sets?.filter(
        (s) => s.exerciseId === selectedExerciseId && Number(s.estimated1RM) > 0
      )
      if (setsForExercise && setsForExercise.length > 0) {
        const best1RM = Math.max(...setsForExercise.map((s) => Number(s.estimated1RM) || 0))
        const maxWeight = Math.max(...setsForExercise.map((s) => Number(s.weightKg) || 0))
        const exerciseVolume = setsForExercise.reduce(
          (acc, s) => acc + (Number(s.weightKg) * Number(s.reps) || 0),
          0
        )
        points.push({
          date: session.date,
          best1RM: roundTo(best1RM, 1),
          maxWeight: roundTo(maxWeight, 1),
          volume: roundTo(exerciseVolume, 1),
          sessionTitle: session.templateName || 'Sesión',
        })
      }
    })

    return points
  }, [state.workoutSessions, selectedExerciseId])

  // Volumen total semanal (todas las sesiones agrupadas por semana ISO)
  const weeklyVolumes = useMemo(() => {
    const weekMap = new Map()

    const sortedSessions = [...(state.workoutSessions || [])].sort((a, b) =>
      a.date.localeCompare(b.date)
    )

    sortedSessions.forEach((s) => {
      const wInfo = getISOWeekInfo(s.date)
      if (!wInfo) return
      const current = weekMap.get(wInfo.key) || {
        key: wInfo.key,
        weekNo: wInfo.weekNo,
        startDate: wInfo.startDate,
        endDate: wInfo.endDate,
        totalVolume: 0,
        sessionsCount: 0,
      }
      current.totalVolume += Number(s.totalVolumeKg) || 0
      current.sessionsCount += 1
      weekMap.set(wInfo.key, current)
    })

    return Array.from(weekMap.values()).map((w) => ({
      ...w,
      totalVolume: roundTo(w.totalVolume, 0),
    }))
  }, [state.workoutSessions])

  const selectedExerciseObj = allExercises.find((e) => e.id === selectedExerciseId)

  // Gráfica SVG de 1RM
  const lineChartData = useMemo(() => {
    if (exercisePoints.length === 0) return null

    const values = exercisePoints.map((p) => p.best1RM)
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const padding = Math.max(5, (rawMax - rawMin) * 0.25)
    const minY = Math.max(0, Math.floor((rawMin - padding) / 5) * 5)
    const maxY = Math.ceil((rawMax + padding) / 5) * 5
    const spanY = maxY - minY || 1

    const width = 640
    const height = 240
    const padLeft = 48
    const padRight = 24
    const padTop = 20
    const padBottom = 34
    const plotW = width - padLeft - padRight
    const plotH = height - padTop - padBottom

    const coords = exercisePoints.map((p, idx) => {
      const x =
        exercisePoints.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (exercisePoints.length - 1)) * plotW
      const y = padTop + ((maxY - p.best1RM) / spanY) * plotH
      return { ...p, x, y }
    })

    const pathD = coords
      .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ')

    const yTicks = [0, 0.33, 0.66, 1].map((t) => {
      const val = Math.round(maxY - t * spanY)
      return { val, y: padTop + t * plotH }
    })

    return { width, height, padLeft, padRight, coords, pathD, yTicks }
  }, [exercisePoints])

  // Datos para gráfico de barras de volumen semanal
  const maxWeeklyVol = Math.max(...weeklyVolumes.map((w) => w.totalVolume), 1000)

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
      {/* Selector de sub-modo de gráfica */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            {chartMode === '1rm' ? <LineChart className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-50">
              {chartMode === '1rm' ? 'Evolución de 1RM Estimado' : 'Volumen Semanal de Entrenamiento'}
            </h3>
            <p className="text-xs text-zinc-400">
              {chartMode === '1rm'
                ? 'Progreso de fuerza máxima estimada en cada sesión'
                : 'Tonelaje total acumulado (kg levantados) por semana'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-zinc-950 border border-zinc-800 p-1">
          <button
            type="button"
            onClick={() => setChartMode('1rm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              chartMode === '1rm' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Fuerza (1RM)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              chartMode === 'volume' ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tonelaje Semanal
          </button>
        </div>
      </div>

      {chartMode === '1rm' ? (
        <div className="space-y-4">
          {/* Selector de ejercicio */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="text-xs font-semibold uppercase text-zinc-400 whitespace-nowrap">
              Seleccionar ejercicio:
            </label>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="flex-1 min-h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              {exerciseOptions.map((ex) => {
                const hasData = recordedExerciseIds.includes(ex.id)
                return (
                  <option key={ex.id} value={ex.id}>
                    {hasData ? '✓ ' : ''}{ex.name} ({ex.primaryMuscle})
                  </option>
                )
              })}
            </select>
          </div>

          {!lineChartData ? (
            <div className="rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 p-8 text-center space-y-2">
              <Dumbbell className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                Aún no hay series registradas para este ejercicio
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Inicia un entrenamiento en la pestaña &quot;Entrenar&quot; y registra tus series para ver la gráfica de sobrecarga progresiva.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Tarjeta resumen del ejercicio */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <span className="text-[11px] text-zinc-500 block">Mejor 1RM histórico</span>
                  <span className="text-lg font-black text-emerald-400">
                    {Math.max(...exercisePoints.map((p) => p.best1RM))} kg
                  </span>
                </div>
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <span className="text-[11px] text-zinc-500 block">Último 1RM registrado</span>
                  <span className="text-lg font-black text-zinc-100">
                    {exercisePoints[exercisePoints.length - 1].best1RM} kg
                  </span>
                </div>
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <span className="text-[11px] text-zinc-500 block">Sesiones con datos</span>
                  <span className="text-lg font-black text-cyan-400">{exercisePoints.length}</span>
                </div>
              </div>

              {/* Gráfica SVG */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`}
                  className="w-full h-56 select-none"
                >
                  {/* Líneas horizontales de guía */}
                  {lineChartData.yTicks.map((tick, idx) => (
                    <g key={idx}>
                      <line
                        x1={lineChartData.padLeft}
                        x2={lineChartData.width - lineChartData.padRight}
                        y1={tick.y}
                        y2={tick.y}
                        stroke="#27272a"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={lineChartData.padLeft - 8}
                        y={tick.y + 4}
                        textAnchor="end"
                        className="fill-zinc-500 text-[11px]"
                      >
                        {tick.val} kg
                      </text>
                    </g>
                  ))}

                  {/* Curva de 1RM */}
                  {lineChartData.coords.length > 1 && (
                    <path
                      d={lineChartData.pathD}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Puntos de cada sesión */}
                  {lineChartData.coords.map((pt, idx) => (
                    <g key={idx} className="cursor-pointer">
                      <circle cx={pt.x} cy={pt.y} r="4.5" fill="#09090b" stroke="#10b981" strokeWidth="2.5" />
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        className="fill-zinc-300 text-[10px] font-bold"
                      >
                        {pt.best1RM}
                      </text>
                      <text
                        x={pt.x}
                        y={lineChartData.height - 8}
                        textAnchor="middle"
                        className="fill-zinc-500 text-[10px]"
                      >
                        {formatShortDateES(pt.date)}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {weeklyVolumes.length === 0 ? (
            <div className="rounded-xl bg-zinc-950/60 border border-dashed border-zinc-800 p-8 text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">
                No hay sesiones finalizadas para calcular volumen semanal
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Al terminar un entrenamiento activo, el tonelaje de todas tus series se sumará aquí automáticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                {weeklyVolumes.map((week) => {
                  const pct = Math.min(100, Math.round((week.totalVolume / maxWeeklyVol) * 100))
                  return (
                    <div
                      key={week.key}
                      className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200">
                          Semana {week.weekNo} ({formatShortDateES(week.startDate)} – {formatShortDateES(week.endDate)})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">{week.sessionsCount} entreno(s)</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            {week.totalVolume.toLocaleString('es-ES')} kg
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-900 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

