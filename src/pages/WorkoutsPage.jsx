import { useMemo, useState } from 'react'
import { BookOpen, Calculator, Dumbbell, History, Layers, Minus, Plus } from 'lucide-react'
import { calculateEpley1RM, roundTo } from '../utils/calculations'
import { ExerciseCatalog } from '../components/workout/ExerciseCatalog'
import { TemplateManager } from '../components/workout/TemplateManager'
import { ActiveWorkout } from '../components/workout/ActiveWorkout'
import { WorkoutHistory } from '../components/workout/WorkoutHistory'

export function WorkoutsPage() {
  const [subTab, setSubTab] = useState('active')
  const [weightKg, setWeightKg] = useState(80)
  const [reps, setReps] = useState(8)

  const estimated1RM = useMemo(() => calculateEpley1RM(weightKg, reps), [weightKg, reps])
  const totalVolumeSet = useMemo(() => roundTo(weightKg * reps, 1), [weightKg, reps])

  const percentages = [95, 90, 85, 80, 75, 70].map((pct) => ({
    pct,
    kg: roundTo((estimated1RM * pct) / 100, 1),
  }))

  const tabs = [
    { id: 'active', label: 'Entrenar', icon: Dumbbell },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'templates', label: 'Plantillas', icon: Layers },
    { id: 'catalog', label: 'Catálogo', icon: BookOpen },
    { id: 'calculator', label: '1RM / Tonelaje', icon: Calculator },
  ]

  return (
    <div className="space-y-5">
      {/* Selector de pestañas */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = subTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Contenido según pestaña */}
      {subTab === 'active' && <ActiveWorkout />}

      {subTab === 'history' && <WorkoutHistory />}

      {subTab === 'templates' && <TemplateManager />}

      {subTab === 'catalog' && <ExerciseCatalog />}

      {subTab === 'calculator' && (
        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-zinc-50">
              Calculadora de 1RM (Fórmula de Epley) y Tonelaje
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Calcula tu repetición máxima estimada y los porcentajes de trabajo para planificar tus cargas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Peso levantado (kg)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.max(2.5, roundTo(w - 2.5, 1)))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                  aria-label="Restar 2.5 kg"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value) || 0))}
                  className="flex-1 min-h-12 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-xl font-black text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => roundTo(w + 2.5, 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                  aria-label="Sumar 2.5 kg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Repeticiones completadas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                  aria-label="Restar 1 repetición"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={reps}
                  onChange={(e) => setReps(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="flex-1 min-h-12 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-xl font-black text-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.min(50, r + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                  aria-label="Sumar 1 repetición"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
              <div className="text-xs font-semibold text-emerald-300">1RM Estimado (Epley)</div>
              <div className="text-3xl font-black text-zinc-50 mt-1">{estimated1RM} kg</div>
            </div>
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 text-center">
              <div className="text-xs font-semibold text-zinc-400">Tonelaje de la serie</div>
              <div className="text-3xl font-black text-zinc-100 mt-1">{totalVolumeSet} kg</div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {percentages.map((p) => (
              <div
                key={p.pct}
                className="rounded-xl bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-center"
              >
                <div className="text-[11px] text-zinc-500">{p.pct}% 1RM</div>
                <div className="text-sm font-bold text-zinc-200">{p.kg} kg</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
