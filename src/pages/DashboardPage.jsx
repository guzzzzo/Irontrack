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
    <div className="space-y-6">
      {/* Banner de resumen diario con gradiente vibrante */}
      <section className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-[#121c33] via-[#0f172a] to-[#0c1d24] p-5 sm:p-6 shadow-xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-orange-500/25 via-rose-500/20 to-amber-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-10 h-52 w-52 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-transparent blur-3xl"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-300">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{formatFullDateES(todayISO)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Resumen del día
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Control integral de fuerza, sobrecarga progresiva, peso corporal y nutrición diaria con persistencia local.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              className="flex items-center gap-2 min-h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Scale className="h-4 w-4" />
              <span>{loggedToday ? 'Ver peso de hoy' : 'Registrar peso'}</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-2 min-h-11 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-slate-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <Database className="h-4 w-4 text-cyan-300" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>
      </section>

      {stagnationAlert && (
        <section className="flex items-start gap-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-400/35 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-200">{stagnationAlert.title}</h3>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{stagnationAlert.message}</p>
          </div>
        </section>
      )}

      {/* Métricas rápidas codificadas por color */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Peso (Cian / Índigo) */}
        <div className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"
          />
          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <span className="text-xs font-semibold text-cyan-300">
                Peso Corporal
              </span>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {latestLog ? `${latestLog.weightKg.toFixed(1)} kg` : 'Sin registros'}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {latestLog ? `Último: ${formatShortDateES(latestLog.date)}` : 'Añade tu primer pesaje'}
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 border border-cyan-400/30 text-cyan-300">
              <Scale className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs gap-2">
            <span className="text-slate-400">
              Media sem:{' '}
              <strong className="font-mono tabular-nums text-cyan-300">
                {currentWeekSummary ? `${currentWeekSummary.averageKg.toFixed(2)} kg` : '—'}
              </strong>
            </span>
            {weekDelta !== null && (
              <span className="font-mono tabular-nums font-semibold text-slate-200">
                {weekDelta > 0 ? '+' : ''}
                {weekDelta.toFixed(2)} kg vs ant.
              </span>
            )}
          </div>
        </div>

        {/* Card Nutrición (Rosa / Ámbar) */}
        <div className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400"
          />
          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <span className="text-xs font-semibold text-rose-300">
                Meta Calórica
              </span>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {state.nutritionTargets
                  ? `${state.nutritionTargets.targetCalories} kcal`
                  : 'Pendiente'}
              </div>
              <div className="text-xs text-slate-400 mt-1 tabular-nums">
                {state.nutritionTargets
                  ? `P ${state.nutritionTargets.proteinG}g · C ${state.nutritionTargets.carbsG}g · G ${state.nutritionTargets.fatsG}g`
                  : 'Calcula tu TMB y GET'}
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-amber-500/20 border border-rose-400/30 text-rose-300">
              <Utensils className="h-5 w-5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('nutrition')}
            className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <span>Abrir Calculadora de Dietas</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Card Entrenamiento (Naranja / Lima) */}
        <div className="surface-card rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-lime-400"
          />
          <div className="flex items-start justify-between gap-3 pt-1">
            <div>
              <span className="text-xs font-semibold text-orange-300">
                Entrenamiento
              </span>
              <div className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {state.workoutTemplates.length} rutinas
              </div>
              <div className="text-xs text-slate-400 mt-1 tabular-nums">
                {state.workoutSessions.length} sesiones registradas
              </div>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/25 to-amber-500/20 border border-orange-400/30 text-orange-300">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('workouts')}
            className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-orange-300 hover:text-orange-200 transition-colors cursor-pointer"
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

      {/* Checklist de funcionalidades disponibles */}
      <section className="surface-card rounded-2xl p-5 space-y-3.5">
        <h3 className="text-sm font-bold text-slate-100">Capacidades activas en IronTrack</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {[
            {
              text: 'Persistencia automática en localStorage + Backup JSON',
              color: 'text-emerald-400',
            },
            {
              text: 'Calculadora TMB (Mifflin-St Jeor), GET y reparto de macros',
              color: 'text-rose-400',
            },
            {
              text: 'Control de peso corporal con media semanal ISO y gráfica',
              color: 'text-cyan-400',
            },
            {
              text: 'Catálogo con 73 ejercicios y rutinas prediseñadas (Push/Pull/Legs)',
              color: 'text-orange-400',
            },
            {
              text: 'Diario de comidas con base de 48 alimentos y alimentos propios',
              color: 'text-amber-400',
            },
            {
              text: 'Entrenamiento activo con temporizador y sobrecarga progresiva',
              color: 'text-lime-400',
            },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-2.5 rounded-xl bg-[#090d16]/70 border border-white/[0.06] px-3.5 py-2.5 text-slate-300"
            >
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.color}`} />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
