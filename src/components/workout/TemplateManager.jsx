import { useMemo, useState } from 'react'
import { exercisesDB } from '../../data/exercisesDB'
import { useApp } from '../../context/AppContext'
import { Copy, Edit3, Plus, Save, Trash2, X } from 'lucide-react'

export function TemplateManager() {
  const {
    state,
    upsertTemplate,
    duplicateTemplate,
    deleteTemplate,
  } = useApp()

  const allExercises = [...exercisesDB, ...state.customExercises]
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    exercises: [], // { exerciseId, targetSets, repMin, repMax, targetRir, restSeconds }
  })

  const exerciseMap = useMemo(() => {
    const map = new Map()
    allExercises.forEach(ex => map.set(ex.id, ex))
    return map
  }, [allExercises])

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.primaryMuscle.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setTemplateForm({ name: '', description: '', exercises: [] })
    setEditingId(null)
    setIsModalOpen(true)
  }

  const openEdit = (tpl) => {
    setTemplateForm({
      name: tpl.name,
      description: tpl.description || '',
      exercises: tpl.exercises.map(ex => ({ ...ex })),
    })
    setEditingId(tpl.id)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
    setTemplateForm({ name: '', description: '', exercises: [] })
  }

  const handleAddExercise = (exId) => {
    if (templateForm.exercises.find(e => e.exerciseId === exId)) return
    setTemplateForm(f => ({
      ...f,
      exercises: [...f.exercises, {
        id: `tplex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        exerciseId: exId,
        targetSets: 3,
        repMin: 8,
        repMax: 12,
        targetRir: 2,
        restSeconds: 90,
      }]
    }))
  }

  const handleRemoveExercise = (exId) => {
    setTemplateForm(f => ({
      ...f,
      exercises: f.exercises.filter(e => e.exerciseId !== exId),
    }))
  }

  const handleConfigChange = (exId, field, value) => {
    setTemplateForm(f => ({
      ...f,
      exercises: f.exercises.map(e =>
        e.exerciseId === exId ? { ...e, [field]: Number(value) } : e
      ),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      id: editingId || `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: templateForm.name.trim(),
      description: templateForm.description.trim(),
      exercises: templateForm.exercises,
      createdAt: new Date().toISOString(),
    }
    upsertTemplate(payload)
    closeModal()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-50">Plantillas de Entrenamiento</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 min-h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Crear plantilla</span>
        </button>
      </div>

      {/* Template List */}
      {state.workoutTemplates.length === 0 ? (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
          <p className="text-sm text-zinc-400">Aún no tienes plantillas de entrenamiento.</p>
          <p className="text-xs text-zinc-500 mt-1">Crea una para empezar a organizar tus rutinas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.workoutTemplates.map(tpl => (
            <div key={tpl.id} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-zinc-50">{tpl.name}</h3>
                  {tpl.description && <p className="text-xs text-zinc-400 mt-0.5">{tpl.description}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium">
                  {tpl.exercises.length} ejercicios
                </span>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto">
                {tpl.exercises.slice(0, 4).map(ex => {
                  const catalogEx = exerciseMap.get(ex.exerciseId)
                  return (
                    <div key={ex.id} className="text-xs text-zinc-400 flex justify-between">
                      <span>{catalogEx?.name || 'Ejercicio'}</span>
                      <span className="text-zinc-500">{ex.targetSets}×{ex.repMin}-{ex.repMax}</span>
                    </div>
                  )
                })}
                {tpl.exercises.length > 4 && (
                  <p className="text-xs text-zinc-500">+{tpl.exercises.length - 4} más...</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => openEdit(tpl)}
                  className="flex items-center gap-1 min-h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Editar
                </button>
                <button
                  onClick={() => duplicateTemplate(tpl.id)}
                  className="flex items-center gap-1 min-h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicar
                </button>
                <button
                  onClick={() => deleteTemplate(tpl.id)}
                  className="flex items-center gap-1 min-h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-rose-400 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for create/edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 z-10">
              <h3 className="text-lg font-bold text-zinc-50">
                {editingId ? 'Editar plantilla' : 'Crear nueva plantilla'}
              </h3>
              <button onClick={closeModal} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nombre</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                    placeholder="Ej. Push A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Descripción</label>
                  <input
                    type="text"
                    value={templateForm.description}
                    onChange={e => setTemplateForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full min-h-12 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              {/* Add exercises section */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <h4 className="text-sm font-semibold text-zinc-200">Añadir ejercicios</h4>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o músculo..."
                  className="w-full min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredExercises.map(ex => {
                    const isAdded = templateForm.exercises.some(e => e.exerciseId === ex.id)
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => handleAddExercise(ex.id)}
                        disabled={isAdded}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span className="font-semibold block">{ex.name}</span>
                        <span className="text-zinc-500">{ex.primaryMuscle}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Selected exercises with config */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-200">Ejercicios en la plantilla ({templateForm.exercises.length})</h4>
                {templateForm.exercises.length === 0 && (
                  <p className="text-xs text-zinc-500">Añade al menos un ejercicio.</p>
                )}
                {templateForm.exercises.map(ex => {
                  const catalogEx = exerciseMap.get(ex.exerciseId)
                  return (
                    <div key={ex.exerciseId} className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-zinc-100">{catalogEx?.name || ex.exerciseId}</h5>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.exerciseId)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1">Series</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.targetSets}
                            onChange={e => handleConfigChange(ex.exerciseId, 'targetSets', e.target.value)}
                            className="w-full min-h-10 px-2 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1">Rep mín</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.repMin}
                            onChange={e => handleConfigChange(ex.exerciseId, 'repMin', e.target.value)}
                            className="w-full min-h-10 px-2 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1">Rep máx</label>
                          <input
                            type="number"
                            min="1"
                            value={ex.repMax}
                            onChange={e => handleConfigChange(ex.exerciseId, 'repMax', e.target.value)}
                            className="w-full min-h-10 px-2 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1">RIR</label>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            value={ex.targetRir}
                            onChange={e => handleConfigChange(ex.exerciseId, 'targetRir', e.target.value)}
                            className="w-full min-h-10 px-2 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-500 mb-1">Descanso (s)</label>
                          <input
                            type="number"
                            min="10"
                            value={ex.restSeconds}
                            onChange={e => handleConfigChange(ex.exerciseId, 'restSeconds', e.target.value)}
                            className="w-full min-h-10 px-2 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 min-h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {editingId ? 'Guardar cambios' : 'Crear plantilla'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-12 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}