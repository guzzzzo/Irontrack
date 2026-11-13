import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Calculator, CheckCircle2, Flame, RefreshCw, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ACTIVITY_LEVELS, GOAL_TYPES } from '../../data/initialState'
import { calculateDietPlan } from '../../utils/calculations'

export function DietCalculator() {
  const { state, weightAnalysis, updateProfile, applyNutritionTargets } = useApp()
  const { profile, nutritionTargets } = state

  const [appliedBanner, setAppliedBanner] = useState(false)
  const [ageDraft, setAgeDraft] = useState(String(profile.age))
  const [heightDraft, setHeightDraft] = useState(String(profile.heightCm))
  const [weightDraft, setWeightDraft] = useState(String(profile.weightKg))

  useEffect(() => {
    setAgeDraft(String(profile.age))
  }, [profile.age])

  useEffect(() => {
    setHeightDraft(String(profile.heightCm))
  }, [profile.heightCm])

  useEffect(() => {
    setWeightDraft(String(profile.weightKg))
  }, [profile.weightKg])

  const plan = useMemo(() => calculateDietPlan(profile), [profile])
  const selectedGoalObj =
    GOAL_TYPES.find((g) => g.id === profile.goalType) || GOAL_TYPES[0]

  const latestWeight = weightAnalysis.latestLog?.weightKg ?? null
  const canSyncLatestWeight =
    latestWeight !== null && Math.abs(Number(profile.weightKg) - latestWeight) >= 0.05

  const handleDraftChange = (field, rawValue, setDraft, min, max) => {
    setDraft(rawValue)
    if (rawValue.trim() === '') return
    const num = Number(rawValue.replace(',', '.'))
    if (!Number.isFinite(num)) return
    if (num >= min && num <= max) {
      updateProfile({ [field]: num })
      setAppliedBanner(false)
    }
  }

  const handleDraftBlur = (field, draftValue, setDraft, min, max, fallback) => {
    const num = Number(String(draftValue).replace(',', '.'))
    const finalVal = Number.isFinite(num)
      ? Math.max(min, Math.min(max, num))
      : fallback
    updateProfile({ [field]: finalVal })
    setDraft(String(finalVal))
  }

  const handleGoalSelect = (goal) => {
    updateProfile({
      goalType: goal.id,
      goalAdjustmentPct: goal.defaultAdjustmentPct,
    })
    setAppliedBanner(false)
  }

  const handleApplyTargets = () => {
    applyNutritionTargets(plan)
    setAppliedBanner(true)
  }

  const isAlreadySynced =
    nutritionTargets &&
    nutritionTargets.targetCalories === plan.targetCalories &&
    nutritionTargets.proteinG === plan.proteinG &&
    nutritionTargets.fatsG === plan.fatsG &&
    nutritionTargets.carbsG === plan.carbsG

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel izquierdo: parámetros del usuario */}
        <div className="lg:col-span-7 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-50">
                Calculadora TMB, GET y Macros
              </h2>
              <p className="text-xs text-zinc-400">
                Fórmula Mifflin-St Jeor adaptada a tu gasto y objetivo
              </p>
            </div>
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Sexo biológico (para fórmula TMB)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'male', label: 'Hombre' },
                { id: 'female', label: 'Mujer' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    updateProfile({ sex: opt.id })
                    setAppliedBanner(false)
                  }}
                  className={`min-h-12 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                    profile.sex === opt.id
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edad, Altura, Peso */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="calc-age"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Edad
              </label>
              <input
                id="calc-age"
                type="number"
                min="14"
                max="100"
                inputMode="numeric"
                value={ageDraft}
                onChange={(e) => handleDraftChange('age', e.target.value, setAgeDraft, 14, 100)}
                onBlur={() =>
                  handleDraftBlur('age', ageDraft, setAgeDraft, 14, 100, profile.age)
                }
                className="w-full min-h-12 px-3 text-center rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-base font-bold text-zinc-50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-height"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Altura (cm)
              </label>
              <input
                id="calc-height"
                type="number"
                min="120"
                max="230"
                inputMode="numeric"
                value={heightDraft}
                onChange={(e) =>
                  handleDraftChange('heightCm', e.target.value, setHeightDraft, 120, 230)
                }
                onBlur={() =>
                  handleDraftBlur(
                    'heightCm',
                    heightDraft,
                    setHeightDraft,
                    120,
                    230,
                    profile.heightCm
                  )
                }
                className="w-full min-h-12 px-3 text-center rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-base font-bold text-zinc-50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-weight"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Peso (kg)
              </label>
              <input
                id="calc-weight"
                type="number"
                step="0.1"
                min="35"
                max="250"
                inputMode="decimal"
                value={weightDraft}
                onChange={(e) =>
                  handleDraftChange('weightKg', e.target.value, setWeightDraft, 35, 250)
                }
                onBlur={() =>
                  handleDraftBlur(
                    'weightKg',
                    weightDraft,
                    setWeightDraft,
                    35,
                    250,
                    profile.weightKg
                  )
                }
                className="w-full min-h-12 px-3 text-center rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-base font-bold text-zinc-50"
              />
            </div>
          </div>

          {canSyncLatestWeight && (
            <button
              type="button"
              onClick={() => {
                updateProfile({ weightKg: latestWeight })
                setAppliedBanner(false)
              }}
              className="w-full flex items-center justify-center gap-2 min-h-10 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Usar último peso corporal registrado ({latestWeight.toFixed(1)} kg)</span>
            </button>
          )}

          {/* Factor de actividad física */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Nivel de actividad física (GET)
            </span>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((lvl) => {
                const active = profile.activityLevel === lvl.id
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      updateProfile({ activityLevel: lvl.id })
                      setAppliedBanner(false)
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-500/12 border-emerald-500/45 text-zinc-50'
                        : 'bg-zinc-950 border-zinc-800/90 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{lvl.label}</div>
                      <div className="text-xs text-zinc-400 truncate">{lvl.description}</div>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      ×{lvl.factor}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selector de objetivo */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Objetivo nutricional
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {GOAL_TYPES.map((goal) => {
                const active = profile.goalType === goal.id
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => handleGoalSelect(goal)}
                    className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-sm font-bold">{goal.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{goal.shortLabel}</div>
                  </button>
                )
              })}
            </div>

            {/* Ajuste fino del porcentaje calórico */}
            <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Ajuste sobre GET</span>
                <span className="font-bold text-zinc-100">
                  {profile.goalAdjustmentPct > 0 ? '+' : ''}
                  {profile.goalAdjustmentPct}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGoalObj.presets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      updateProfile({ goalAdjustmentPct: pct })
                      setAppliedBanner(false)
                    }}
                    className={`min-h-9 px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
                      profile.goalAdjustmentPct === pct
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    {pct > 0 ? `+${pct}%` : `${pct}%`}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="-30"
                max="25"
                step="1"
                value={profile.goalAdjustmentPct}
                onChange={(e) => {
                  updateProfile({ goalAdjustmentPct: Number(e.target.value) })
                  setAppliedBanner(false)
                }}
                aria-label="Porcentaje de ajuste calórico"
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Reparto de macronutrientes */}
          <div className="space-y-3 pt-1">
            <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Reparto automático de macros (g/kg)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Proteína</span>
                  <span className="font-bold text-cyan-400">{profile.proteinPerKg} g/kg</span>
                </div>
                <input
                  type="range"
                  min="1.4"
                  max="2.8"
                  step="0.1"
                  value={profile.proteinPerKg}
                  onChange={(e) => {
                    updateProfile({ proteinPerKg: Number(e.target.value) })
                    setAppliedBanner(false)
                  }}
                  aria-label="Gramos de proteína por kilogramo"
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[11px] text-zinc-500">Recomendado fuerza: 1.8 – 2.2 g/kg</div>
              </div>

              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Grasas esenciales</span>
                  <span className="font-bold text-amber-400">{profile.fatPerKg} g/kg</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={profile.fatPerKg}
                  onChange={(e) => {
                    updateProfile({ fatPerKg: Number(e.target.value) })
                    setAppliedBanner(false)
                  }}
                  aria-label="Gramos de grasa por kilogramo"
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="text-[11px] text-zinc-500">Salud hormonal: 0.7 – 1.0 g/kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho: Resultados calculados y Aplicar objetivo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-5 lg:sticky lg:top-22">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-zinc-50">Resultado Metabólico</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                {selectedGoalObj.label}
              </span>
            </div>

            {/* TMB y GET */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5">
                <div className="text-xs text-zinc-400">TMB (Basal)</div>
                <div className="text-xl font-extrabold text-zinc-100 mt-0.5">
                  {plan.bmr} <span className="text-xs font-normal text-zinc-500">kcal</span>
                </div>
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5">
                <div className="text-xs text-zinc-400">GET (Mantenimiento)</div>
                <div className="text-xl font-extrabold text-zinc-100 mt-0.5">
                  {plan.tdee} <span className="text-xs font-normal text-zinc-500">kcal</span>
                </div>
              </div>
            </div>

            {/* Calorías objetivo */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-zinc-950 to-zinc-950 border border-emerald-500/35 p-4 text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Objetivo diario calculado
              </div>
              <div className="text-4xl font-black text-zinc-50 mt-1">
                {plan.targetCalories}{' '}
                <span className="text-base font-semibold text-zinc-400">kcal/día</span>
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {plan.goalAdjustmentPct === 0
                  ? 'Equilibrio calórico (0% sobre GET)'
                  : `${plan.goalAdjustmentPct > 0 ? '+' : ''}${plan.goalAdjustmentPct}% respecto a tu GET (${plan.targetCalories - plan.tdee > 0 ? '+' : ''}${plan.targetCalories - plan.tdee} kcal)`}
              </div>
            </div>

            {/* Barra de proporción de macros */}
            <div className="space-y-2">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
                <div
                  style={{ width: `${plan.proteinPct}%` }}
                  className="bg-cyan-400 transition-all"
                  title={`Proteínas ${plan.proteinPct}%`}
                />
                <div
                  style={{ width: `${plan.carbsPct}%` }}
                  className="bg-emerald-400 transition-all"
                  title={`Carbohidratos ${plan.carbsPct}%`}
                />
                <div
                  style={{ width: `${plan.fatsPct}%` }}
                  className="bg-amber-400 transition-all"
                  title={`Grasas ${plan.fatsPct}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-1">
                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <div className="text-[11px] font-semibold text-cyan-400">Proteínas</div>
                  <div className="text-lg font-extrabold text-zinc-50 mt-0.5">
                    {plan.proteinG}g
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {plan.proteinKcal} kcal ({plan.proteinPct}%)
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <div className="text-[11px] font-semibold text-emerald-400">Carbos</div>
                  <div className="text-lg font-extrabold text-zinc-50 mt-0.5">{plan.carbsG}g</div>
                  <div className="text-[11px] text-zinc-500">
                    {plan.carbsKcal} kcal ({plan.carbsPct}%)
                  </div>
                </div>

                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-center">
                  <div className="text-[11px] font-semibold text-amber-400">Grasas</div>
                  <div className="text-lg font-extrabold text-zinc-50 mt-0.5">{plan.fatsG}g</div>
                  <div className="text-[11px] text-zinc-500">
                    {plan.fatsKcal} kcal ({plan.fatsPct}%)
                  </div>
                </div>
              </div>
            </div>

            {(plan.lowCalorieWarning || plan.carbsOverflow) && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  {plan.carbsOverflow
                    ? 'Proteínas y grasas superan el presupuesto calórico; los carbohidratos quedaron en 0 g. Reduce g/kg o suaviza el déficit.'
                    : 'El objetivo queda por debajo de tu TMB basal. Vigila la fatiga y considera un déficit más moderado.'}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyTargets}
              className={`w-full flex items-center justify-center gap-2 min-h-13 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isAlreadySynced
                  ? 'bg-zinc-800 border border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/10'
              }`}
            >
              {isAlreadySynced ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Objetivo diario aplicado</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Aplicar como objetivo diario</span>
                </>
              )}
            </button>

            {appliedBanner && (
              <p className="text-xs text-center text-emerald-400">
                Guardado en localStorage y sincronizado con el Dashboard y el Diario.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
