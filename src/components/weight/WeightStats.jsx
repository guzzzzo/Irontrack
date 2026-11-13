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
    if (delta === null || delta === 0) return 'text-zinc-400'
    if (goalType === 'cut') return delta < 0 ? 'text-emerald-400' : 'text-amber-400'
    if (goalType === 'bulk') return delta > 0 ? 'text-emerald-400' : 'text-amber-400'
    return Math.abs(delta) <= 0.3 ? 'text-emerald-400' : 'text-cyan-400'
  }

  const weekDelta = currentWeekSummary?.deltaKg ?? null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Último registro */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="text-xs font-medium text-zinc-400">Último peso registrado</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-zinc-50">
              {latestLog ? `${latestLog.weightKg.toFixed(1)} kg` : '—'}
            </span>
            {dailyDeltaKg !== null && (
              <span className={`text-xs font-semibold ${renderDeltaColor(dailyDeltaKg)}`}>
                {dailyDeltaKg > 0 ? '+' : ''}
                {dailyDeltaKg.toFixed(1)} kg
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {latestLog ? formatShortDateES(latestLog.date) : 'Sin pesajes todavía'}
          </div>
        </div>

        {/* Media semanal */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-zinc-400">
              {isCurrentCalendarWeek ? 'Media semana actual' : 'Última media semanal'}
            </span>
            {currentWeekSummary && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Sem {currentWeekSummary.weekNo}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {currentWeekSummary ? `${currentWeekSummary.averageKg.toFixed(2)} kg` : '—'}
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {currentWeekSummary
              ? `${currentWeekSummary.count} ${currentWeekSummary.count === 1 ? 'pesaje' : 'pesajes'} (${formatShortDateES(currentWeekSummary.startDate)} – ${formatShortDateES(currentWeekSummary.endDate)})`
              : 'Filtra fluctuaciones diarias'}
          </div>
        </div>

        {/* Diferencia vs semana anterior */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
          <div className="text-xs font-medium text-zinc-400">Vs semana anterior</div>
          <div className="mt-1.5 flex items-center gap-2">
            {weekDelta !== null ? (
              <>
                {weekDelta < 0 ? (
                  <ArrowDownRight className={`h-6 w-6 ${renderDeltaColor(weekDelta)}`} />
                ) : weekDelta > 0 ? (
                  <ArrowUpRight className={`h-6 w-6 ${renderDeltaColor(weekDelta)}`} />
                ) : (
                  <Minus className="h-6 w-6 text-zinc-400" />
                )}
                <span className={`text-2xl font-extrabold ${renderDeltaColor(weekDelta)}`}>
                  {weekDelta > 0 ? '+' : ''}
                  {weekDelta.toFixed(2)} kg
                </span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-zinc-500">—</span>
            )}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {previousWeekSummary
              ? `Anterior: ${previousWeekSummary.averageKg.toFixed(2)} kg (${currentWeekSummary.deltaPct > 0 ? '+' : ''}${currentWeekSummary.deltaPct}%)`
              : 'Registra al menos 2 semanas'}
          </div>
        </div>
      </div>

      {stagnationAlert && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
          {stagnationAlert.type === 'cut_plateau' ? (
            <TrendingDown className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          ) : stagnationAlert.type === 'bulk_plateau' ? (
            <TrendingUp className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="text-sm font-bold text-amber-300">{stagnationAlert.title}</h3>
            <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{stagnationAlert.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
