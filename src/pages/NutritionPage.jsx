import { useState } from 'react'
import { Calculator, Utensils } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { DietCalculator } from '../components/nutrition/DietCalculator'
import { MacroSummaryCard } from '../components/nutrition/MacroSummaryCard'
import { FoodLogger } from '../components/nutrition/FoodLogger'
import { MacroRecommendations } from '../components/nutrition/MacroRecommendations'

export function NutritionPage() {
  const { state } = useApp()
  const [subTab, setSubTab] = useState('calculator')

  return (
    <div className="space-y-5">
      {/* Navegación interna de Nutrición */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setSubTab('calculator')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            subTab === 'calculator'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Calculadora TMB / Macros</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('diary')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            subTab === 'diary'
              ? 'bg-emerald-500 text-zinc-950'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>Diario de Comidas</span>
        </button>
      </div>

      {subTab === 'calculator' ? (
        <div className="space-y-5">
          <MacroSummaryCard targets={state.nutritionTargets} />
          <DietCalculator />
        </div>
      ) : (
        <div className="space-y-5">
          <MacroSummaryCard
            targets={state.nutritionTargets}
            onGoToCalculator={() => setSubTab('calculator')}
          />
          <MacroRecommendations />
          <FoodLogger />
        </div>
      )}
    </div>
  )
}
