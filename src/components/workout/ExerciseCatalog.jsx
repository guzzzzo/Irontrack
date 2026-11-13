import { useState } from 'react'
import { exercisesDB } from '../../data/exercisesDB'
import { useApp } from '../../context/AppContext'
import { Search, Plus, Trash2, Edit3 } from 'lucide-react'

export function ExerciseCatalog() {
  const { state, upsertCustomExercise, deleteCustomExercise } = useApp()

  // Combine default and custom exercises
  const allExercises = [...exercisesDB, ...state.customExercises]

  // UI state
  const [search, setSearch] = useState('')
  const [filterMuscle, setFilterMuscle] = useState('Todos')
  const [filterEquipment, setFilterEquipment] = useState('Todos')
  const [filterType, setFilterType] = useState('Todos')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    primaryMuscle: '',
    secondaryMuscles: '',
    equipment: '',
    type: 'Analítico',
    notes: '',
  })

  // Filtering
  const muscles = ['Todos', ...new Set(allExercises.map(e => e.primaryMuscle))]
  const equipments = ['Todos', ...new Set(allExercises.flatMap(e => e.equipment || []))]
  const types = ['Todos', ...new Set(allExercises.map(e => e.type))]

  const filtered = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.notes?.toLowerCase().includes(search.toLowerCase())
    const matchesMuscle = filterMuscle === 'Todos' || ex.primaryMuscle === filterMuscle
    const matchesEquipment = filterEquipment === 'Todos' || (ex.equipment || []).includes(filterEquipment)
    const matchesType = filterType === 'Todos' || ex.type === filterType
    return matchesSearch && matchesMuscle && matchesEquipment && matchesType
  })

  const resetForm = () => {
    setForm({ name: '', primaryMuscle: '', secondaryMuscles: '', equipment: '', type: 'Analítico', notes: '' })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleEdit = (ex) => {
    setForm({
      name: ex.name,
      primaryMuscle: ex.primaryMuscle,
      secondaryMuscles: (ex.secondaryMuscles || []).join(', '),
      equipment: (ex.equipment || []).join(', '),
      type: ex.type,
      notes: ex.notes || '',
    })
    setEditingId(ex.id)
    setShowAddForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const id = editingId || `ex_custom_${Date.now()}`
    const payload = {
      id,
      name: form.name.trim(),
      primaryMuscle: form.primaryMuscle.trim(),
      secondaryMuscles: form.secondaryMuscles.split(',').map(s => s.trim()).filter(Boolean),
      equipment: form.equipment.split(',').map(s => s.trim()).filter(Boolean),
      type: form.type,
      notes: form.notes.trim(),
      isCustom: true,
    }
    upsertCustomExercise(payload)
    resetForm()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-50">Catálogo de Ejercicios</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 min-h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Añadir ejercicio</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
          <h3 className="text-base font-bold text-zinc-50">{editingId ? 'Editar ejercicio' : 'Nuevo ejercicio personalizado'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Grupo muscular principal</label>
                <input
                  type="text"
                  value={form.primaryMuscle}
                  onChange={e => setForm(f => ({ ...f, primaryMuscle: e.target.value }))}
                  placeholder="Ej. Pecho"
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Músculos secundarios (separados por comas)</label>
                <input
                  type="text"
                  value={form.secondaryMuscles}
                  onChange={e => setForm(f => ({ ...f, secondaryMuscles: e.target.value }))}
                  placeholder="Ej. Hombro anterior, Tríceps"
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Equipamiento (separado por comas)</label>
                <input
                  type="text"
                  value={form.equipment}
                  onChange={e => setForm(f => ({ ...f, equipment: e.target.value }))}
                  placeholder="Ej. Barra, Mancuernas"
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Tipo</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                >
                  <option value="Compuesto">Compuesto</option>
                  <option value="Analítico">Analítico</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Notas técnicas</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Ej. Mantener la espalda en el banco..."
                  className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 min-h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer">
                {editingId ? 'Guardar cambios' : 'Crear ejercicio'}
              </button>
              <button type="button" onClick={resetForm} className="min-h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm cursor-pointer">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="min-h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <select
          value={filterMuscle}
          onChange={e => setFilterMuscle(e.target.value)}
          className="min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
        >
          {muscles.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterEquipment}
          onChange={e => setFilterEquipment(e.target.value)}
          className="min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
        >
          {equipments.map(eq => <option key={eq} value={eq}>{eq}</option>)}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
        >
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Exercise List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(ex => (
          <div key={ex.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-50">{ex.name}</h3>
              {ex.isCustom && (
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleEdit(ex)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteCustomExercise(ex.id)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-zinc-400">{ex.primaryMuscle} · {ex.type} · {ex.equipment.join(', ')}</p>
            {ex.secondaryMuscles.length > 0 && (
              <p className="text-xs text-zinc-500">Secundarios: {ex.secondaryMuscles.join(', ')}</p>
            )}
            {ex.notes && <p className="text-xs text-zinc-500 italic">{ex.notes}</p>}
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-zinc-500 py-6">No se encontraron ejercicios que coincidan con los filtros.</p>
      )}
    </div>
  )
}