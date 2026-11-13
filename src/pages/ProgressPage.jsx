import { useState } from 'react'
import { CalendarDays, Dumbbell, Pencil, Scale, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { WeightForm } from '../components/weight/WeightForm'
import { WeightStats } from '../components/weight/WeightStats'
import { WeightTrendChart } from '../components/weight/WeightTrendChart'
import { StrengthChart } from '../components/workout/StrengthChart'
import { formatFullDateES, formatShortDateES } from '../utils/calculations'

export function ProgressPage() {
  const { weightAnalysis, deleteBodyWeight } = useApp()
  const [subTab, setSubTab] = useState('weight') // 'weight' | 'strength'
  const [editingEntry, setEditingEntry] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const { sortedDesc, weeklySummariesDesc } = weightAnalysis

  const handleEdit = (entry) => {
    setEditingEntry(entry)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-5">
      {/* Selector de tipo de progreso */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setSubTab('weight')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            subTab === 'weight'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Peso Corporal</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('strength')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            subTab === 'strength'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-100'
          }`}
        >
          <Dumbbell className="h-4 w-4" />
          <span>Fuerza & Tonelaje</span>
        </button>
      </div>

      {subTab === 'weight' ? (
        <div className="space-y-5">
          <WeightStats />

          <WeightForm
            editingEntry={editingEntry}
            onCancelEdit={() => setEditingEntry(null)}
            onSaved={() => setConfirmDeleteId(null)}
          />

          <WeightTrendChart />

          {/* Resumen de medias semanales */}
          <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-bold text-zinc-50">Medias Semanales (Lunes a Domingo)</h2>
            </div>

            {weeklySummariesDesc.length === 0 ? (
              <p className="text-xs text-zinc-500 py-2">
                Las medias semanales aparecerán aquí en cuanto registres tu primer peso.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weeklySummariesDesc.map((week) => (
                  <div
                    key={week.key}
                    className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-200">
                        Semana {week.weekNo} ({week.isoYear})
                      </span>
                      <span className="text-zinc-500">{week.count} reg.</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-extrabold text-emerald-400">
                        {week.averageKg.toFixed(2)} kg
                      </span>
                      {week.deltaKg !== null && (
                        <span
                          className={`text-xs font-semibold ${
                            week.deltaKg < 0
                              ? 'text-emerald-400'
                              : week.deltaKg > 0
                                ? 'text-amber-400'
                                : 'text-zinc-400'
                          }`}
                        >
                          {week.deltaKg > 0 ? '+' : ''}
                          {week.deltaKg.toFixed(2)} kg
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {formatShortDateES(week.startDate)} – {formatShortDateES(week.endDate)} · Rango{' '}
                      {week.minKg.toFixed(1)}–{week.maxKg.toFixed(1)} kg
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Historial diario */}
          <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-50">Historial de Pesajes</h2>
              <span className="text-xs text-zinc-400">{sortedDesc.length} registros</span>
            </div>

            {sortedDesc.length === 0 ? (
              <p className="text-xs text-zinc-500 py-3">
                No hay registros todavía. Añade tu peso en ayunas arriba para empezar.
              </p>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {sortedDesc.map((entry) => {
                  const isConfirming = confirmDeleteId === entry.id
                  return (
                    <div
                      key={entry.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-base font-extrabold text-zinc-50">
                            {entry.weightKg.toFixed(1)} kg
                          </span>
                          <span className="text-xs text-zinc-400 capitalize truncate">
                            {formatFullDateES(entry.date)}
                          </span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{entry.note}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          aria-label={`Editar pesaje del ${entry.date}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {isConfirming ? (
                          <button
                            type="button"
                            onClick={() => {
                              deleteBodyWeight(entry.id)
                              setConfirmDeleteId(null)
                              if (editingEntry?.id === entry.id) setEditingEntry(null)
                            }}
                            className="min-h-10 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                          >
                            Borrar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            aria-label={`Eliminar pesaje del ${entry.date}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        <StrengthChart />
      )}
    </div>
  )
}
