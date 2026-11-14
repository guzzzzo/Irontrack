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
      className="surface-card rounded-2xl p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/20 border border-cyan-400/30 text-cyan-300">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {editingEntry ? 'Editar registro de peso' : 'Registrar peso corporal'}
            </h2>
            <p className="text-xs text-slate-400">
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
            className="flex items-center gap-1 min-h-9 px-3 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-200 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fecha */}
        <div className="space-y-1.5">
          <label htmlFor="bw-date" className="block text-xs font-semibold text-slate-300">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="h-4 w-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="bw-date"
              type="date"
              value={date}
              max={getTodayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-h-12 pl-10 pr-3 rounded-xl bg-[#090d16] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm font-medium text-white"
              required
            />
          </div>
        </div>

        {/* Peso con controles rápidos para una mano */}
        <div className="space-y-1.5">
          <label htmlFor="bw-kg" className="block text-xs font-semibold text-slate-300">
            Peso (kg)
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustWeight(-0.5)}
              className="min-h-12 px-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              aria-label="Restar 0.5 kg"
            >
              -0.5
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(-0.1)}
              className="flex items-center justify-center min-h-12 w-11 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
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
              className="flex-1 min-w-0 min-h-12 px-2 text-center rounded-xl bg-[#090d16] border border-white/10 focus:border-cyan-400 focus:outline-none font-mono tabular-nums text-lg font-extrabold text-white"
              required
            />
            <button
              type="button"
              onClick={() => adjustWeight(0.1)}
              className="flex items-center justify-center min-h-12 w-11 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-colors cursor-pointer"
              aria-label="Sumar 0.1 kg"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(0.5)}
              className="min-h-12 px-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              aria-label="Sumar 0.5 kg"
            >
              +0.5
            </button>
          </div>
        </div>
      </div>

      {/* Nota y etiquetas rápidas */}
      <div className="space-y-2">
        <label htmlFor="bw-note" className="block text-xs font-semibold text-slate-300">
          Nota opcional
        </label>
        <input
          id="bw-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej. En ayunas tras dormir 7h"
          className="w-full min-h-11 px-3.5 rounded-xl bg-[#090d16] border border-white/10 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder:text-slate-500"
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_NOTES.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setNote(chip)}
              className={`min-h-9 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                note === chip
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                  : 'bg-[#090d16] border-white/10 text-slate-400 hover:text-slate-100'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {isUpdatingExisting && !editingEntry && (
        <p className="text-xs text-amber-200 bg-amber-500/15 border border-amber-400/30 rounded-xl px-3.5 py-2.5">
          Ya existe un pesaje en {date} ({existingSameDate.weightKg.toFixed(1)} kg). Al guardar se
          actualizará ese día sin duplicarlo.
        </p>
      )}

      {statusMsg && (
        <p
          className={`text-xs rounded-xl px-3.5 py-2.5 border ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
              : 'bg-rose-500/15 border-rose-400/35 text-rose-200'
          }`}
        >
          {statusMsg.text}
        </p>
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 min-h-12 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
      >
        <Check className="h-4 w-4" />
        <span>
          {editingEntry || isUpdatingExisting ? 'Actualizar registro' : 'Guardar pesaje'}
        </span>
      </button>
    </form>
  )
}
