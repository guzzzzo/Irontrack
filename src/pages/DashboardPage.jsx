import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Database,
  Dumbbell,
  Scale,
  TrendingDown,
  Utensils,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MacroSummaryCard } from '../components/nutrition/MacroSummaryCard'
import { formatFullDateES, formatShortDateES, getTodayISO } from '../utils/calculations'

export function DashboardPage({ onNavigate, onOpenSettings }) {
  const { state, weightAnalysis } = useApp()
  const todayISO = getTodayISO()
  const { latestLog, currentWeekSummary, stagnationAlert } = weightAnalysis

  const loggedToday = state.bodyWeightLogs.some((item) => item.date === todayISO)
  const weekDelta = currentWeekSummary?.deltaKg ?? null

  return (
    <div className="space-y-5">
      {/* Banner de resumen diario */}
      <section className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span className="capitalize">{formatFullDateES(todayISO)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-50 tracking-tight">
            Resumen del día
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Control integral de fuerza, sobrecarga progresiva, peso corporal y nutrición diaria con persistencia local.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('progress')}
            className="flex items-center gap-2 min-h-11 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer"
          >
            <Scale className="h-4 w-4" />
            <span>{loggedToday ? 'Ver peso de hoy' : 'Registrar peso'}</span>
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-2 min-h-11 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-semibold text-sm cursor-pointer"
          >
            <Database className="h-4 w-4 text-zinc-300" />
            <span>Backup JSON</span>
          </button>
        </div>
      </section>

      {stagnationAlert && (
        <section className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
          <TrendingDown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-300">{stagnationAlert.title}</h3>
            <p className="text-xs text-zinc-300 mt-0.5">{stagnationAlert.message}</p>
          </div>
        </section>
      )}

      {/* Métricas rápidas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Peso */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Peso Corporal
              </span>
              <div className="text-2xl font-black text-zinc-50 mt-1">
                {latestLog ? `${latestLog.weightKg.toFixed(1)} kg` : 'Sin registros'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {latestLog ? `Último: ${formatShortDateES(latestLog.date)}` : 'Añade tu primer pesaje'}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
              <Scale className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Media sem:{' '}
              <strong className="text-emerald-400">
                {currentWeekSummary ? `${currentWeekSummary.averageKg.toFixed(2)} kg` : '—'}
              </strong>
            </span>
            {weekDelta !== null && (
              <span className="font-semibold text-zinc-200">
                {weekDelta > 0 ? '+' : ''}
                {weekDelta.toFixed(2)} kg vs ant.
              </span>
            )}
          </div>
        </div>

        {/* Card Nutrición */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Meta Calórica
              </span>
              <div className="text-2xl font-black text-zinc-50 mt-1">
                {state.nutritionTargets
                  ? `${state.nutritionTargets.targetCalories} kcal`
                  : 'Pendiente'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {state.nutritionTargets
                  ? `P ${state.nutritionTargets.proteinG}g · C ${state.nutritionTargets.carbsG}g · G ${state.nutritionTargets.fatsG}g`
                  : 'Calcula tu TMB y GET'}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Utensils className="h-5 w-5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('nutrition')}
            className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <span>Abrir Calculadora de Dietas</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Card Entrenamiento */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Entrenamiento
              </span>
              <div className="text-2xl font-black text-zinc-50 mt-1">
                {state.workoutTemplates.length} rutinas
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {state.workoutSessions.length} sesiones registradas · Fase 2–3
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('workouts')}
            className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            <span>Ver módulo y calculadora 1RM</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Progreso de macros aplicado */}
      <MacroSummaryCard
        targets={state.nutritionTargets}
        onGoToCalculator={() => onNavigate('nutrition')}
      />

      {/* Checklist de validación Fase 1 */}
      <section className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-4 sm:p-5 space-y-3">
        <h3 className="text-sm font-bold text-zinc-200">Estado de implementación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {[
            'Persistencia automática en localStorage + Backup JSON',
            'Calculadora TMB (Mifflin-St Jeor), GET y reparto de macros',
            'Control de peso corporal con media semanal ISO y gráfica',
            'Catálogo con 73 ejercicios y rutinas prediseñadas (Push/Pull/Legs)',
            'Diario de comidas con base de 48 alimentos y alimentos propios',
            'Entrenamiento activo con temporizador y sobrecarga progresiva',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80 px-3 py-2.5 text-zinc-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
