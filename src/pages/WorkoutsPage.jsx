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
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0d1322] border border-white/10 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = subTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
        <section className="surface-card rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/20 border border-orange-400/30 text-orange-300">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Calculadora de 1RM (Fórmula de Epley) y Tonelaje
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calcula tu repetición máxima estimada y los porcentajes de trabajo para planificar tus cargas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 space-y-2.5">
              <span className="text-xs font-semibold text-orange-300">
                Peso levantado (kg)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => Math.max(2.5, roundTo(w - 2.5, 1)))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
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
                  className="flex-1 min-h-12 text-center rounded-xl bg-[#0e1526] border border-white/10 focus:border-orange-400 focus:outline-none font-mono tabular-nums text-xl font-extrabold text-white"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg((w) => roundTo(w + 2.5, 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
                  aria-label="Sumar 2.5 kg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 space-y-2.5">
              <span className="text-xs font-semibold text-amber-300">
                Repeticiones completadas
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.max(1, r - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
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
                  className="flex-1 min-h-12 text-center rounded-xl bg-[#0e1526] border border-white/10 focus:border-amber-400 focus:outline-none font-mono tabular-nums text-xl font-extrabold text-white"
                />
                <button
                  type="button"
                  onClick={() => setReps((r) => Math.min(50, r + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
                  aria-label="Sumar 1 repetición"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="rounded-xl bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent border border-orange-400/35 p-4 text-center">
              <div className="text-xs font-semibold text-orange-300">1RM Estimado (Epley)</div>
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {estimated1RM} kg
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-transparent border border-cyan-400/30 p-4 text-center">
              <div className="text-xs font-semibold text-cyan-300">Tonelaje de la serie</div>
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {totalVolumeSet} kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {percentages.map((p, idx) => (
              <div
                key={p.pct}
                className="rounded-xl bg-[#090d16] border border-white/10 px-2.5 py-2.5 text-center"
              >
                <div
                  className={`text-[11px] font-semibold tabular-nums ${
                    idx < 2 ? 'text-rose-300' : idx < 4 ? 'text-orange-300' : 'text-amber-300'
                  }`}
                >
                  {p.pct}% 1RM
                </div>
                <div className="font-mono tabular-nums text-sm font-bold text-white mt-0.5">
                  {p.kg} kg
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
