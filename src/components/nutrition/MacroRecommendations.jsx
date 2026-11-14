import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { getTodayISO } from '../../utils/calculations'
import { CheckCircle2, Lightbulb, Plus } from 'lucide-react'

export function MacroRecommendations() {
  const { state, addNutritionEntry } = useApp()
  const targets = state.nutritionTargets

  const today = getTodayISO()
  const dayLog = state.nutritionLogs?.[today]

  // Consumo actual de hoy
  const currentTotals = useMemo(() => {
    if (!dayLog?.meals) return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    let k = 0, p = 0, c = 0, f = 0
    Object.values(dayLog.meals).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((e) => {
          k += e.kcal || 0
          p += e.protein || 0
          c += e.carbs || 0
          f += e.fat || 0
        })
      }
    })
    return {
      kcal: Math.round(k),
      protein: Math.round(p),
      carbs: Math.round(c),
      fat: Math.round(f),
    }
  }, [dayLog])

  if (!targets) return null

  const remainingKcal = targets.targetCalories - currentTotals.kcal
  const remainingP = targets.proteinG - currentTotals.protein
  const remainingC = targets.carbsG - currentTotals.carbs
  const remainingF = targets.fatsG - currentTotals.fat

  // Determinar qué macronutriente tiene el déficit más prioritario
  const suggestions = useMemo(() => {
    const list = []

    if (remainingP >= 15) {
      list.push({
        type: 'protein',
        title: `Te faltan ${remainingP}g de proteína`,
        subtitle: 'Para apoyar la síntesis proteica y recuperación muscular:',
        accentText: 'text-cyan-300',
        borderClass: 'border-cyan-500/25',
        items: [
          {
            foodId: 'food_chicken_breast',
            name: 'Pechuga de pollo',
            portionGrams: Math.min(250, Math.max(80, Math.round((remainingP / 31) * 100))),
            proteinProvided: remainingP,
            kcal: Math.round(((Math.min(250, Math.max(80, Math.round((remainingP / 31) * 100)))) * 165) / 100),
          },
          {
            foodId: 'food_whey_protein',
            name: 'Batido de Proteína Whey',
            portionGrams: Math.min(60, Math.max(30, Math.round((remainingP / 78) * 100))),
            proteinProvided: remainingP,
            kcal: Math.round(((Math.min(60, Math.max(30, Math.round((remainingP / 78) * 100)))) * 395) / 100),
          },
          {
            foodId: 'food_cottage_cheese',
            name: 'Queso fresco batido 0%',
            portionGrams: 200,
            proteinProvided: 23,
            kcal: 136,
          },
        ],
      })
    }

    if (remainingC >= 30) {
      list.push({
        type: 'carbs',
        title: `Te faltan ${remainingC}g de carbohidratos`,
        subtitle: 'Para reponer depósitos de glucógeno y energía:',
        accentText: 'text-emerald-300',
        borderClass: 'border-emerald-500/25',
        items: [
          {
            foodId: 'food_banana',
            name: 'Plátano maduro',
            portionGrams: 150,
            carbsProvided: 34,
            kcal: 133,
          },
          {
            foodId: 'food_oats',
            name: 'Copos de avena',
            portionGrams: Math.min(120, Math.max(40, Math.round((remainingC / 60) * 100))),
            carbsProvided: remainingC,
            kcal: Math.round(((Math.min(120, Math.max(40, Math.round((remainingC / 60) * 100)))) * 375) / 100),
          },
          {
            foodId: 'food_rice_white_cooked',
            name: 'Arroz blanco cocido',
            portionGrams: Math.min(250, Math.max(100, Math.round((remainingC / 28) * 100))),
            carbsProvided: remainingC,
            kcal: Math.round(((Math.min(250, Math.max(100, Math.round((remainingC / 28) * 100)))) * 130) / 100),
          },
        ],
      })
    }

    if (remainingF >= 12) {
      list.push({
        type: 'fat',
        title: `Te faltan ${remainingF}g de grasas saludables`,
        subtitle: 'Para optimizar el perfil hormonal y absorción de vitaminas:',
        accentText: 'text-amber-300',
        borderClass: 'border-amber-500/25',
        items: [
          {
            foodId: 'food_walnuts',
            name: 'Nueces peladas',
            portionGrams: Math.min(40, Math.max(15, Math.round((remainingF / 65) * 100))),
            fatProvided: remainingF,
            kcal: Math.round(((Math.min(40, Math.max(15, Math.round((remainingF / 65) * 100)))) * 654) / 100),
          },
          {
            foodId: 'food_peanut_butter',
            name: 'Crema de cacahuete natural',
            portionGrams: 25,
            fatProvided: 12,
            kcal: 147,
          },
          {
            foodId: 'food_olive_oil',
            name: 'Aceite de oliva virgen extra',
            portionGrams: 15,
            fatProvided: 15,
            kcal: 132,
          },
        ],
      })
    }

    return list
  }, [remainingP, remainingC, remainingF])

  const handleQuickAdd = (item) => {
    addNutritionEntry(today, 'snack', item.foodId, item.name, item.portionGrams)
  }

  // Si ya cumplió todos los macros dentro de ±10%
  const isGoalSatisfied =
    remainingKcal <= 100 &&
    remainingKcal >= -100 &&
    remainingP <= 10 &&
    remainingP >= -10

  if (isGoalSatisfied) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 border border-emerald-400/35 text-emerald-200">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
        <div className="text-xs">
          <strong className="block text-sm text-white">¡Objetivo diario completado!</strong>
          Has clavado tus calorías y macronutrientes de hoy con un margen excelente.
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <section className="surface-card rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/20 border border-amber-400/30 text-amber-300">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Sugerencias para Cerrar el Día</h3>
          <p className="text-xs text-slate-400">
            Alimentos recomendados para ajustar tus macronutrientes faltantes de hoy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {suggestions.map((group) => (
          <div
            key={group.type}
            className={`rounded-xl bg-[#090d16] border ${group.borderClass} p-3.5 space-y-2.5`}
          >
            <div>
              <div className={`text-xs font-bold ${group.accentText}`}>
                {group.title}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{group.subtitle}</p>
            </div>

            <div className="space-y-1.5">
              {group.items.map((it) => (
                <div
                  key={it.foodId}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1526]/80 border border-white/[0.06] text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-100">{it.name}</span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400 block">
                      {it.portionGrams}g · ~{it.kcal} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(it)}
                    className="flex items-center gap-1 min-h-9 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-400 hover:text-slate-950 transition-colors text-[11px] font-bold text-emerald-300 cursor-pointer"
                    title="Añadir ración al diario"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Añadir</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
