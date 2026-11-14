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
      <div className="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-amber-500/20 border border-rose-400/30 text-rose-300">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Objetivo nutricional sin configurar</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calcula tu TMB, GET y reparto de macros y aplícalo para activar el seguimiento diario.
            </p>
          </div>
        </div>
        {onGoToCalculator && (
          <button
            type="button"
            onClick={onGoToCalculator}
            className="min-h-11 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 font-bold text-sm shrink-0 shadow-lg shadow-rose-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            Calcular dieta
          </button>
        )}
      </div>
    )
  }

  const goalLabel = GOAL_TYPES.find((g) => g.id === targets.goalType)?.label || 'Personalizado'

  const calProgress =
    targets.targetCalories > 0
      ? Math.min(100, Math.round((calculatedTotals.kcal / targets.targetCalories) * 100))
      : 0

  const macros = [
    {
      label: 'Proteínas',
      current: calculatedTotals.protein,
      target: targets.proteinG,
      unit: 'g',
      barClass: 'bg-gradient-to-r from-cyan-400 to-sky-400',
      textClass: 'text-cyan-300',
      boxBorder: 'border-cyan-500/25',
      pct:
        targets.proteinG > 0
          ? Math.min(100, Math.round((calculatedTotals.protein / targets.proteinG) * 100))
          : 0,
    },
    {
      label: 'Carbohidratos',
      current: calculatedTotals.carbs,
      target: targets.carbsG,
      unit: 'g',
      barClass: 'bg-gradient-to-r from-emerald-400 to-lime-400',
      textClass: 'text-emerald-300',
      boxBorder: 'border-emerald-500/25',
      pct:
        targets.carbsG > 0
          ? Math.min(100, Math.round((calculatedTotals.carbs / targets.carbsG) * 100))
          : 0,
    },
    {
      label: 'Grasas',
      current: calculatedTotals.fat,
      target: targets.fatsG,
      unit: 'g',
      barClass: 'bg-gradient-to-r from-amber-400 to-orange-400',
      textClass: 'text-amber-300',
      boxBorder: 'border-amber-500/25',
      pct:
        targets.fatsG > 0
          ? Math.min(100, Math.round((calculatedTotals.fat / targets.fatsG) * 100))
          : 0,
    },
  ]

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-orange-500/20 border border-rose-400/30 text-rose-300">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Objetivo Diario Activo</h3>
            <p className="text-xs text-slate-400 tabular-nums">
              {goalLabel} · TMB {targets.bmr} kcal · GET {targets.tdee} kcal
            </p>
          </div>
        </div>

        <div className="text-right tabular-nums">
          <span className="font-mono text-xl font-extrabold text-white">{calculatedTotals.kcal}</span>
          <span className="text-sm text-slate-400"> / {targets.targetCalories} kcal</span>
          <span className="text-xs font-bold text-rose-300 ml-2">({calProgress}%)</span>
        </div>
      </div>

      {/* Barra calórica */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded-full bg-[#090d16] border border-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${calProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {macros.map((m) => (
          <div key={m.label} className={`rounded-xl bg-[#090d16] border ${m.boxBorder} p-3.5 space-y-2`}>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold ${m.textClass}`}>{m.label}</span>
              <span className="font-mono tabular-nums text-[11px] text-slate-400">{m.pct}%</span>
            </div>
            <div className="font-mono tabular-nums text-sm font-bold text-white">
              {m.current}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {m.target}
                {m.unit}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className={`h-full ${m.barClass} rounded-full transition-all duration-300`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
