import { AlertCircle, ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatShortDateES } from '../../utils/calculations'

export function WeightStats() {
  const { state, weightAnalysis } = useApp()
  const {
    latestLog,
    dailyDeltaKg,
    currentWeekSummary,
    previousWeekSummary,
    isCurrentCalendarWeek,
    stagnationAlert,
  } = weightAnalysis

  const goalType = state.profile.goalType

  const renderDeltaColor = (delta) => {
    if (delta === null || delta === 0) return 'text-slate-400'
    if (goalType === 'cut') return delta < 0 ? 'text-emerald-300' : 'text-amber-300'
    if (goalType === 'bulk') return delta > 0 ? 'text-emerald-300' : 'text-amber-300'
    return Math.abs(delta) <= 0.3 ? 'text-emerald-300' : 'text-cyan-300'
  }

  const weekDelta = currentWeekSummary?.deltaKg ?? null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Último registro */}
        <div className="surface-card rounded-2xl p-4 relative overflow-hidden">
          <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500" />
          <div className="text-xs font-semibold text-cyan-300 pt-0.5">Último peso registrado</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-extrabold text-white">
              {latestLog ? `${latestLog.weightKg.toFixed(1)} kg` : '—'}
            </span>
            {dailyDeltaKg !== null && (
              <span className={`font-mono tabular-nums text-xs font-bold ${renderDeltaColor(dailyDeltaKg)}`}>
                {dailyDeltaKg > 0 ? '+' : ''}
                {dailyDeltaKg.toFixed(1)} kg
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {latestLog ? formatShortDateES(latestLog.date) : 'Sin pesajes todavía'}
          </div>
        </div>

        {/* Media semanal */}
        <div className="surface-card rounded-2xl p-4 relative overflow-hidden">
          <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-xs font-semibold text-emerald-300">
              {isCurrentCalendarWeek ? 'Media semana actual' : 'Última media semanal'}
            </span>
            {currentWeekSummary && (
              <span className="text-[11px] font-mono tabular-nums text-slate-400">
                Sem {currentWeekSummary.weekNo}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono tabular-nums text-2xl font-extrabold text-emerald-300">
              {currentWeekSummary ? `${currentWeekSummary.averageKg.toFixed(2)} kg` : '—'}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            {currentWeekSummary
              ? `${currentWeekSummary.count} ${currentWeekSummary.count === 1 ? 'pesaje' : 'pesajes'} · ${formatShortDateES(currentWeekSummary.startDate)} – ${formatShortDateES(currentWeekSummary.endDate)}`
              : 'Filtra fluctuaciones diarias'}
          </div>
        </div>

        {/* Diferencia vs semana anterior */}
        <div className="surface-card rounded-2xl p-4 relative overflow-hidden">
          <div aria-hidden="true" className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-400 to-cyan-400" />
          <div className="text-xs font-semibold text-indigo-300 pt-0.5">Vs semana anterior</div>
          <div className="mt-1.5 flex items-center gap-2">
            {weekDelta !== null ? (
              <>
                {weekDelta < 0 ? (
                  <ArrowDownRight className={`h-6 w-6 ${renderDeltaColor(weekDelta)}`} />
                ) : weekDelta > 0 ? (
                  <ArrowUpRight className={`h-6 w-6 ${renderDeltaColor(weekDelta)}`} />
                ) : (
                  <Minus className="h-6 w-6 text-slate-400" />
                )}
                <span className={`font-mono tabular-nums text-2xl font-extrabold ${renderDeltaColor(weekDelta)}`}>
                  {weekDelta > 0 ? '+' : ''}
                  {weekDelta.toFixed(2)} kg
                </span>
              </>
            ) : (
              <span className="font-mono text-2xl font-extrabold text-slate-500">—</span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-400 tabular-nums">
            {previousWeekSummary
              ? `Anterior: ${previousWeekSummary.averageKg.toFixed(2)} kg (${currentWeekSummary.deltaPct > 0 ? '+' : ''}${currentWeekSummary.deltaPct}%)`
              : 'Registra al menos 2 semanas'}
          </div>
        </div>
      </div>

      {stagnationAlert && (
        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-400/35 p-4">
          {stagnationAlert.type === 'cut_plateau' ? (
            <TrendingDown className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          ) : stagnationAlert.type === 'bulk_plateau' ? (
            <TrendingUp className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="text-sm font-bold text-amber-200">{stagnationAlert.title}</h3>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{stagnationAlert.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
