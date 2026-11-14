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
        <div className="lg:col-span-7 surface-card rounded-2xl p-4 sm:p-5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-amber-500/20 border border-rose-400/30 text-rose-300">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Calculadora TMB, GET y Macros
              </h2>
              <p className="text-xs text-slate-400">
                Fórmula Mifflin-St Jeor adaptada a tu gasto y objetivo
              </p>
            </div>
          </div>

          {/* Sexo */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
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
                  className={`min-h-12 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                    profile.sex === opt.id
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/15 border-rose-400/50 text-rose-200'
                      : 'bg-[#090d16] border-white/10 text-slate-400 hover:text-slate-100'
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
                className="block text-xs font-semibold text-slate-300"
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
                className="w-full min-h-12 px-3 text-center rounded-xl bg-[#090d16] border border-white/10 focus:border-rose-400 focus:outline-none font-mono tabular-nums text-base font-bold text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-height"
                className="block text-xs font-semibold text-slate-300"
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
                className="w-full min-h-12 px-3 text-center rounded-xl bg-[#090d16] border border-white/10 focus:border-rose-400 focus:outline-none font-mono tabular-nums text-base font-bold text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="calc-weight"
                className="block text-xs font-semibold text-slate-300"
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
                className="w-full min-h-12 px-3 text-center rounded-xl bg-[#090d16] border border-white/10 focus:border-rose-400 focus:outline-none font-mono tabular-nums text-base font-bold text-white"
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
              className="w-full flex items-center justify-center gap-2 min-h-11 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-cyan-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Usar último peso corporal registrado ({latestWeight.toFixed(1)} kg)</span>
            </button>
          )}

          {/* Factor de actividad física */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
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
                        ? 'bg-gradient-to-r from-rose-500/15 to-amber-500/10 border-rose-400/45 text-white'
                        : 'bg-[#090d16] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{lvl.label}</div>
                      <div className="text-xs text-slate-400 truncate">{lvl.description}</div>
                    </div>
                    <span
                      className={`shrink-0 font-mono tabular-nums px-2.5 py-1 rounded-lg text-xs font-bold ${
                        active ? 'bg-rose-500/25 text-rose-200' : 'bg-white/[0.06] text-slate-400'
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
            <span className="block text-xs font-semibold text-slate-300">
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
                        ? 'bg-gradient-to-br from-rose-500/20 to-amber-500/10 border-rose-400/50 text-rose-100'
                        : 'bg-[#090d16] border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div className="text-sm font-bold">{goal.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{goal.shortLabel}</div>
                  </button>
                )
              })}
            </div>

            {/* Ajuste fino del porcentaje calórico */}
            <div className="rounded-xl bg-[#090d16] border border-white/10 p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ajuste sobre GET</span>
                <span className="font-mono tabular-nums font-bold text-rose-300">
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
                    className={`min-h-9 px-3 rounded-lg font-mono tabular-nums text-xs font-bold border transition-colors cursor-pointer ${
                      profile.goalAdjustmentPct === pct
                        ? 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 border-transparent'
                        : 'bg-[#0f172a] text-slate-300 border-white/10 hover:bg-white/[0.08]'
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
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Reparto de macronutrientes */}
          <div className="space-y-3 pt-1">
            <span className="block text-xs font-semibold text-slate-300">
              Reparto automático de macros (g/kg)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#090d16] border border-cyan-500/25 p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">Proteína</span>
                  <span className="font-mono tabular-nums font-bold text-cyan-300">{profile.proteinPerKg} g/kg</span>
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
                <div className="text-[11px] text-slate-400">Recomendado fuerza: 1.8 – 2.2 g/kg</div>
              </div>

              <div className="rounded-xl bg-[#090d16] border border-amber-500/25 p-3.5 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">Grasas esenciales</span>
                  <span className="font-mono tabular-nums font-bold text-amber-300">{profile.fatPerKg} g/kg</span>
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
                <div className="text-[11px] text-slate-400">Salud hormonal: 0.7 – 1.0 g/kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho: Resultados calculados y Aplicar objetivo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-5 lg:sticky lg:top-20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Flame className="h-5 w-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Resultado Metabólico</h3>
              </div>
              <span className="text-xs font-semibold text-rose-300">
                {selectedGoalObj.label}
              </span>
            </div>

            {/* TMB y GET */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#090d16] border border-white/10 p-3.5">
                <div className="text-xs text-slate-400">TMB (Basal)</div>
                <div className="font-mono tabular-nums text-xl font-extrabold text-white mt-0.5">
                  {plan.bmr} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
              </div>
              <div className="rounded-xl bg-[#090d16] border border-white/10 p-3.5">
                <div className="text-xs text-slate-400">GET (Mantenimiento)</div>
                <div className="font-mono tabular-nums text-xl font-extrabold text-white mt-0.5">
                  {plan.tdee} <span className="text-xs font-normal text-slate-400">kcal</span>
                </div>
              </div>
            </div>

            {/* Calorías objetivo */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-[#090d16] border border-rose-400/35 p-4 text-center">
              <div className="text-xs font-semibold text-rose-200">
                Objetivo diario calculado
              </div>
              <div className="font-mono tabular-nums text-4xl font-extrabold text-white mt-1">
                {plan.targetCalories}{' '}
                <span className="text-base font-semibold text-slate-300">kcal/día</span>
              </div>
              <div className="text-xs text-slate-300 mt-1 tabular-nums">
                {plan.goalAdjustmentPct === 0
                  ? 'Equilibrio calórico (0% sobre GET)'
                  : `${plan.goalAdjustmentPct > 0 ? '+' : ''}${plan.goalAdjustmentPct}% respecto a tu GET (${plan.targetCalories - plan.tdee > 0 ? '+' : ''}${plan.targetCalories - plan.tdee} kcal)`}
              </div>
            </div>

            {/* Barra de proporción de macros */}
            <div className="space-y-2.5">
              <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-[#090d16] border border-white/10">
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
                <div className="rounded-xl bg-[#090d16] border border-cyan-500/25 p-3 text-center">
                  <div className="text-[11px] font-bold text-cyan-300">Proteínas</div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-white mt-0.5">
                    {plan.proteinG}g
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {plan.proteinKcal} kcal · {plan.proteinPct}%
                  </div>
                </div>

                <div className="rounded-xl bg-[#090d16] border border-emerald-500/25 p-3 text-center">
                  <div className="text-[11px] font-bold text-emerald-300">Carbos</div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-white mt-0.5">
                    {plan.carbsG}g
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {plan.carbsKcal} kcal · {plan.carbsPct}%
                  </div>
                </div>

                <div className="rounded-xl bg-[#090d16] border border-amber-500/25 p-3 text-center">
                  <div className="text-[11px] font-bold text-amber-300">Grasas</div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-white mt-0.5">
                    {plan.fatsG}g
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {plan.fatsKcal} kcal · {plan.fatsPct}%
                  </div>
                </div>
              </div>
            </div>

            {(plan.lowCalorieWarning || plan.carbsOverflow) && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/15 border border-amber-400/35 p-3 text-xs text-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
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
              className={`w-full flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                isAlreadySynced
                  ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-200'
                  : 'bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-rose-500/20'
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
              <p className="text-xs text-center text-emerald-300">
                Guardado en localStorage y sincronizado con el Dashboard y el Diario.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
