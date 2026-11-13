import { useMemo } from 'react'
import { foodsDB } from '../../data/foodsDB'
import { useApp } from '../../context/AppContext'
import { getTodayISO, roundTo } from '../../utils/calculations'
import { CheckCircle2, Lightbulb, Plus, Sparkles } from 'lucide-react'

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
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <div className="text-xs">
          <strong className="block text-sm text-emerald-200">¡Objetivo diario completado!</strong>
          Has clavado tus calorías y macronutrientes de hoy con un margen excelente.
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) return null

  return (
    <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-50">Sugerencias para Cerrar el Día</h3>
          <p className="text-xs text-zinc-400">
            Alimentos recomendados para ajustar tus macronutrientes faltantes de hoy
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {suggestions.map((group) => (
          <div
            key={group.type}
            className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-2.5"
          >
            <div>
              <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    group.type === 'protein'
                      ? 'bg-cyan-400'
                      : group.type === 'carbs'
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                  }`}
                />
                <span>{group.title}</span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{group.subtitle}</p>
            </div>

            <div className="space-y-1.5">
              {group.items.map((it) => (
                <div
                  key={it.foodId}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-200">{it.name}</span>
                    <span className="text-[11px] text-zinc-500 block">
                      {it.portionGrams}g · ~{it.kcal} kcal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(it)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 transition-colors text-[11px] font-bold text-emerald-400 cursor-pointer"
                    title="Añadir ración al diario"
                  >
                    <Plus className="h-3 w-3" />
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

