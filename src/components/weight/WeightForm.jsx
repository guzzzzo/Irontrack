import { useEffect, useState } from 'react'
import { Calendar, Check, Minus, Plus, Scale, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayISO, roundTo } from '../../utils/calculations'

const QUICK_NOTES = ['En ayunas', 'Post-descanso', 'Post-refeed', 'Viaje']

export function WeightForm({ editingEntry, onCancelEdit, onSaved }) {
  const { state, weightAnalysis, upsertBodyWeight } = useApp()

  const defaultWeight =
    weightAnalysis.latestLog?.weightKg ?? state.profile.weightKg ?? 75.0

  const [date, setDate] = useState(getTodayISO())
  const [weightInput, setWeightInput] = useState(String(defaultWeight))
  const [note, setNote] = useState('En ayunas')
  const [statusMsg, setStatusMsg] = useState(null)

  useEffect(() => {
    if (editingEntry) {
      setDate(editingEntry.date)
      setWeightInput(String(editingEntry.weightKg))
      setNote(editingEntry.note || '')
      setStatusMsg(null)
    }
  }, [editingEntry])

  const existingSameDate = state.bodyWeightLogs.find((item) => item.date === date)
  const isUpdatingExisting = Boolean(
    editingEntry || (existingSameDate && (!editingEntry || existingSameDate.id !== editingEntry.id))
  )

  const adjustWeight = (delta) => {
    const current = Number(weightInput)
    const base = Number.isFinite(current) && current > 0 ? current : defaultWeight
    const next = Math.max(30, Math.min(300, roundTo(base + delta, 1)))
    setWeightInput(next.toFixed(1))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const parsed = Number(String(weightInput).replace(',', '.'))
    if (!Number.isFinite(parsed) || parsed < 30 || parsed > 300) {
      setStatusMsg({ type: 'error', text: 'Introduce un peso válido entre 30 y 300 kg.' })
      return
    }

    const res = upsertBodyWeight({
      id: editingEntry?.id,
      date,
      weightKg: parsed,
      note,
    })

    if (res.ok) {
      setStatusMsg({
        type: 'success',
        text:
          res.mode === 'updated'
            ? `Registro del ${date} actualizado (${parsed.toFixed(1)} kg).`
            : `Peso guardado: ${parsed.toFixed(1)} kg.`,
      })
      if (editingEntry && onCancelEdit) {
        onCancelEdit()
      }
      if (onSaved) onSaved()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-50">
              {editingEntry ? 'Editar registro de peso' : 'Registrar peso corporal'}
            </h2>
            <p className="text-xs text-zinc-400">
              Recomendado pesarse en ayunas para calcular medias fiables
            </p>
          </div>
        </div>

        {editingEntry && (
          <button
            type="button"
            onClick={() => {
              setDate(getTodayISO())
              setWeightInput(String(defaultWeight))
              setNote('En ayunas')
              onCancelEdit?.()
            }}
            className="flex items-center gap-1 min-h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fecha */}
        <div className="space-y-1.5">
          <label htmlFor="bw-date" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="bw-date"
              type="date"
              value={date}
              max={getTodayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-12 pl-10 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-sm font-medium text-zinc-100"
              required
            />
          </div>
        </div>

        {/* Peso con controles rápidos para una mano */}
        <div className="space-y-1.5">
          <label htmlFor="bw-kg" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Peso (kg)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustWeight(-0.5)}
              className="min-h-12 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-xs font-bold text-zinc-200 cursor-pointer"
              aria-label="Restar 0.5 kg"
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(-0.1)}
              className="flex items-center justify-center min-h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-100 cursor-pointer"
              aria-label="Restar 0.1 kg"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              id="bw-kg"
              type="number"
              step="0.1"
              min="30"
              max="300"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="flex-1 min-w-0 min-h-12 px-2 text-center rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-lg font-bold text-zinc-50"
              required
            />
            <button
              type="button"
              onClick={() => adjustWeight(0.1)}
              className="flex items-center justify-center min-h-12 w-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-100 cursor-pointer"
              aria-label="Sumar 0.1 kg"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(0.5)}
              className="min-h-12 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-xs font-bold text-zinc-200 cursor-pointer"
              aria-label="Sumar 0.5 kg"
            >
              +0.5
            </button>
          </div>
        </div>
      </div>

      {/* Nota y etiquetas rápidas */}
      <div className="space-y-2">
        <label htmlFor="bw-note" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Nota opcional
        </label>
        <input
          id="bw-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. En ayunas tras dormir 7h"
          className="w-full min-h-11 px-3.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_NOTES.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setNote(chip)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                note === chip
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {isUpdatingExisting && !editingEntry && (
        <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
          Ya existe un pesaje en {date} ({existingSameDate.weightKg.toFixed(1)} kg). Al guardar se
          actualizará ese día sin duplicarlo.
        </p>
      )}

      {statusMsg && (
        <p
          className={`text-xs rounded-xl px-3 py-2 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMsg.text}
        </p>
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold text-sm transition-colors cursor-pointer"
      >
        <Check className="h-4 w-4" />
        <span>
          {editingEntry || isUpdatingExisting ? 'Actualizar registro' : 'Guardar pesaje'}
        </span>
      </button>
    </form>
  )
}
