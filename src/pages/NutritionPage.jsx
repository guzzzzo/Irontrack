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
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0d1322] border border-white/10 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setSubTab('calculator')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
            subTab === 'calculator'
              ? 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Calculadora TMB / Macros</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('diary')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
            subTab === 'diary'
              ? 'bg-gradient-to-r from-rose-500 to-amber-400 text-slate-950 shadow-lg shadow-rose-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
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
