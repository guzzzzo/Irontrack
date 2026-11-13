import { useMemo, useState } from 'react'
import { foodsDB } from '../../data/foodsDB'
import { useApp } from '../../context/AppContext'
import { MEAL_CATEGORIES } from '../../data/initialState'
import { formatFullDateES, getTodayISO } from '../../utils/calculations'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react'

export function FoodLogger() {
  const {
    state,
    addNutritionEntry,
    removeNutritionEntry,
    upsertCustomFood,
    deleteCustomFood,
  } = useApp()

  const [date, setDate] = useState(getTodayISO())
  const [mealKey, setMealKey] = useState('breakfast')
  const [selectedFoodId, setSelectedFoodId] = useState('')
  const [grams, setGrams] = useState('100')
  const [search, setSearch] = useState('')
  const [showAddCustomFood, setShowAddCustomFood] = useState(false)

  // Formulario para alimentos personalizados
  const [customForm, setCustomForm] = useState({
    name: '',
    category: 'Platos caseros',
    kcal: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  // Combinar alimentos base y custom
  const allFoods = useMemo(() => {
    return [...foodsDB, ...(state.customFoods || [])]
  }, [state.customFoods])

  const filteredFoods = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allFoods.slice(0, 30)
    return allFoods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    )
  }, [allFoods, search])

  const selectedFood = useMemo(() => {
    return allFoods.find((f) => f.id === selectedFoodId) || null
  }, [allFoods, selectedFoodId])

  const mealEntries = state.nutritionLogs?.[date]?.meals?.[mealKey] || []

  // Totales de la comida seleccionada
  const mealTotals = useMemo(() => {
    return mealEntries.reduce(
      (acc, e) => ({
        kcal: acc.kcal + (e.kcal || 0),
        protein: acc.protein + (e.protein || 0),
        carbs: acc.carbs + (e.carbs || 0),
        fat: acc.fat + (e.fat || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [mealEntries])

  // Totales de todo el día
  const dayTotals = useMemo(() => {
    const day = state.nutritionLogs?.[date]
    if (!day?.meals) return { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    let k = 0, p = 0, c = 0, f = 0
    Object.values(day.meals).forEach((list) => {
      if (Array.isArray(list)) {
        list.forEach((e) => {
          k += e.kcal || 0
          p += e.protein || 0
          c += e.carbs || 0
          f += e.fat || 0
        })
      }
    })
    return {
      kcal: Math.round(k),
      protein: Math.round(p),
      carbs: Math.round(c),
      fat: Math.round(f),
    }
  }, [state.nutritionLogs, date])

  const handleAddEntry = (e) => {
    e.preventDefault()
    if (!selectedFood || !grams || Number(grams) <= 0) return
    addNutritionEntry(date, mealKey, selectedFood.id, selectedFood.name, Number(grams))
    setSelectedFoodId('')
    setGrams('100')
    setSearch('')
  }

  const handleSaveCustomFood = (e) => {
    e.preventDefault()
    if (!customForm.name.trim()) return
    const id = `food_custom_${Date.now()}`
    const food = {
      id,
      name: customForm.name.trim(),
      category: customForm.category.trim() || 'General',
      per100g: {
        kcal: Number(customForm.kcal) || 0,
        protein: Number(customForm.protein) || 0,
        carbs: Number(customForm.carbs) || 0,
        fat: Number(customForm.fat) || 0,
      },
      isCustom: true,
    }
    upsertCustomFood(food)
    setShowAddCustomFood(false)
    setCustomForm({ name: '', category: 'Platos caseros', kcal: '', protein: '', carbs: '', fat: '' })
    setSelectedFoodId(id)
  }

  const shiftDate = (days) => {
    const parts = date.split('-').map(Number)
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]))
    d.setUTCDate(d.getUTCDate() + days)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    setDate(`${yyyy}-${mm}-${dd}`)
  }

  return (
    <div className="space-y-5">
      {/* Selector de fecha */}
      <section className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
            title="Día anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-bold text-zinc-100 capitalize">
                {formatFullDateES(date)}
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Total día: <strong>{dayTotals.kcal} kcal</strong> · P {dayTotals.protein}g · C {dayTotals.carbs}g · G {dayTotals.fat}g
            </span>
          </div>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
            title="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDate(getTodayISO())}
          className="min-h-9 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer"
        >
          Hoy
        </button>
      </section>

      {/* Selector de toma (Desayuno, Comida, etc.) */}
      <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_CATEGORIES.map((m) => {
            const active = mealKey === m.id
            const count = state.nutritionLogs?.[date]?.meals?.[m.id]?.length || 0
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMealKey(m.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{m.label}</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] text-emerald-400 font-bold">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Buscador y selector de alimentos */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Añadir alimento a {MEAL_CATEGORIES.find((m) => m.id === mealKey)?.label}
            </label>
            <button
              type="button"
              onClick={() => setShowAddCustomFood(!showAddCustomFood)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
            >
              {showAddCustomFood ? 'Cerrar creador' : '+ Crear alimento propio'}
            </button>
          </div>

          {/* Modal / formulario inline para crear alimento custom */}
          {showAddCustomFood && (
            <form
              onSubmit={handleSaveCustomFood}
              className="rounded-xl bg-zinc-950 border border-cyan-500/30 p-4 space-y-3"
            >
              <h4 className="text-xs font-bold text-cyan-300 uppercase">
                Nuevo Alimento Personalizado (valores por 100g)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre (ej. Batido de avena casero)"
                  value={customForm.name}
                  onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                  required
                />
                <input
                  type="text"
                  placeholder="Categoría (ej. Platos caseros)"
                  value={customForm.category}
                  onChange={(e) => setCustomForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 block mb-1">Kcal / 100g</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kcal"
                    value={customForm.kcal}
                    onChange={(e) => setCustomForm((f) => ({ ...f, kcal: e.target.value }))}
                    className="w-full min-h-10 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-cyan-500 block mb-1">Proteína (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Prot"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm((f) => ({ ...f, protein: e.target.value }))}
                    className="w-full min-h-10 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 block mb-1">Carbos (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Carb"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm((f) => ({ ...f, carbs: e.target.value }))}
                    className="w-full min-h-10 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-amber-500 block mb-1">Grasas (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Gras"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm((f) => ({ ...f, fat: e.target.value }))}
                    className="w-full min-h-10 text-center rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-100"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs cursor-pointer"
                >
                  Guardar alimento
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomFood(false)}
                  className="min-h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar entre alimentos y recetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-11 pl-10 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Grid de resultados */}
          <div className="rounded-xl bg-zinc-950 border border-zinc-800 max-h-56 overflow-y-auto p-2 space-y-1.5">
            {filteredFoods.map((food) => {
              const isSelected = selectedFoodId === food.id
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelectedFoodId(food.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                      : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{food.name}</span>
                      {food.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                          propio
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500">{food.category}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-zinc-100">{food.per100g.kcal} kcal</span>
                    <div className="text-[10px] text-zinc-500">
                      P {food.per100g.protein} · C {food.per100g.carbs} · G {food.per100g.fat}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Formulario de gramos si hay alimento seleccionado */}
          {selectedFood && (
            <form
              onSubmit={handleAddEntry}
              className="rounded-xl bg-zinc-950 border border-emerald-500/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-300 block">
                    {selectedFood.name}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Valores por cada 100g: {selectedFood.per100g.kcal} kcal (P {selectedFood.per100g.protein}g · C {selectedFood.per100g.carbs}g · G {selectedFood.per100g.fat}g)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFoodId('')}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1">
                    Cantidad consumida (gramos / ml)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGrams((g) => String(Math.max(10, (Number(g) || 100) - 25)))}
                      className="min-h-11 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                    >
                      -25g
                    </button>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="flex-1 min-h-11 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-base font-bold text-zinc-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setGrams((g) => String((Number(g) || 100) + 25))}
                      className="min-h-11 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
                    >
                      +25g
                    </button>
                  </div>
                </div>

                <div className="shrink-0 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 min-h-11 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 font-bold text-xs cursor-pointer shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Añadir a la toma</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Listado de alimentos registrados en esta comida */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Registrado en {MEAL_CATEGORIES.find((m) => m.id === mealKey)?.label} ({mealEntries.length})
            </span>
            <span className="text-xs font-semibold text-zinc-300">
              {mealTotals.kcal.toFixed(0)} kcal · P {mealTotals.protein.toFixed(1)}g · C {mealTotals.carbs.toFixed(1)}g · G {mealTotals.fat.toFixed(1)}g
            </span>
          </div>

          {mealEntries.length === 0 ? (
            <div className="rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800 p-6 text-center">
              <UtensilsCrossed className="h-6 w-6 text-zinc-600 mx-auto mb-1.5" />
              <p className="text-xs text-zinc-500">
                No hay alimentos registrados en esta toma. Selecciona uno arriba para empezar.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-200 truncate">{entry.foodName}</div>
                    <div className="text-[11px] text-zinc-500">
                      {entry.grams}g · {entry.kcal} kcal (P {entry.protein}g · C {entry.carbs}g · G {entry.fat}g)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNutritionEntry(entry.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Eliminar alimento de la toma"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
