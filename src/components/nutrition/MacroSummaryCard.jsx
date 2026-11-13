import { useMemo } from 'react'
import { Flame, Target } from 'lucide-react'
import { GOAL_TYPES } from '../../data/initialState'
import { useApp } from '../../context/AppContext'
import { getTodayISO } from '../../utils/calculations'

export function MacroSummaryCard({ targets, todayTotals: propTotals, onGoToCalculator }) {
  const { state } = useApp()

  // Si no se pasaron totales por props, calcularlos del día actual en state.nutritionLogs
  const calculatedTotals = useMemo(() => {
    if (propTotals) return propTotals
    const today = getTodayISO()
    const dayLog = state?.nutritionLogs?.[today]
    if (!dayLog || !dayLog.meals) {
      return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    }

    let kcal = 0
    let protein = 0
    let carbs = 0
    let fat = 0

    Object.values(dayLog.meals).forEach((mealEntries) => {
      if (Array.isArray(mealEntries)) {
        mealEntries.forEach((item) => {
          kcal += Number(item.kcal) || 0
          protein += Number(item.protein) || 0
          carbs += Number(item.carbs) || 0
          fat += Number(item.fat) || 0
        })
      }
    })

    return {
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    }
  }, [propTotals, state?.nutritionLogs])

  if (!targets) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-50">Objetivo nutricional sin configurar</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Calcula tu TMB, GET y reparto de macros y aplícalo para activar el seguimiento diario.
            </p>
          </div>
        </div>
        {onGoToCalculator && (
          <button
            type="button"
            onClick={onGoToCalculator}
            className="min-h-11 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shrink-0 cursor-pointer"
          >
            Calcular dieta
          </button>
        )}
      </div>
    )
  }

  const goalLabel = GOAL_TYPES.find((g) => g.id === targets.goalType)?.label || 'Personalizado'

  const calProgress = targets.targetCalories > 0
    ? Math.min(100, Math.round((calculatedTotals.kcal / targets.targetCalories) * 100))
    : 0

  const macros = [
    {
      label: 'Proteínas',
      current: calculatedTotals.protein,
      target: targets.proteinG,
      unit: 'g',
      barClass: 'bg-cyan-400',
      textClass: 'text-cyan-400',
      pct: targets.proteinG > 0 ? Math.min(100, Math.round((calculatedTotals.protein / targets.proteinG) * 100)) : 0,
    },
    {
      label: 'Carbohidratos',
      current: calculatedTotals.carbs,
      target: targets.carbsG,
      unit: 'g',
      barClass: 'bg-emerald-400',
      textClass: 'text-emerald-400',
      pct: targets.carbsG > 0 ? Math.min(100, Math.round((calculatedTotals.carbs / targets.carbsG) * 100)) : 0,
    },
    {
      label: 'Grasas',
      current: calculatedTotals.fat,
      target: targets.fatsG,
      unit: 'g',
      barClass: 'bg-amber-400',
      textClass: 'text-amber-400',
      pct: targets.fatsG > 0 ? Math.min(100, Math.round((calculatedTotals.fat / targets.fatsG) * 100)) : 0,
    },
  ]

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-50">Objetivo Diario Activo</h3>
            <p className="text-xs text-zinc-400">
              {goalLabel} · TMB {targets.bmr} kcal · GET {targets.tdee} kcal
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-black text-zinc-50">{calculatedTotals.kcal}</span>
          <span className="text-sm text-zinc-400"> / {targets.targetCalories} kcal</span>
          <span className="text-xs font-semibold text-emerald-400 ml-2">({calProgress}%)</span>
        </div>
      </div>

      {/* Barra calórica */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${calProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {macros.map((m) => (
          <div key={m.label} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${m.textClass}`}>{m.label}</span>
              <span className="text-[10px] text-zinc-400">{m.pct}%</span>
            </div>
            <div className="text-sm font-bold text-zinc-100">
              {m.current} <span className="text-xs font-normal text-zinc-500">/ {m.target}{m.unit}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full ${m.barClass} transition-all duration-300`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
