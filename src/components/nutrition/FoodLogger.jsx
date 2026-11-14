import { useMemo, useState } from 'react'
import { foodsDB } from '../../data/foodsDB'
import { useApp } from '../../context/AppContext'
import { MEAL_CATEGORIES } from '../../data/initialState'
import { formatFullDateES, getTodayISO } from '../../utils/calculations'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
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
      <section className="surface-card flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 transition-colors cursor-pointer"
            title="Día anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-rose-400" />
              <span className="text-sm font-bold text-white capitalize">
                {formatFullDateES(date)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              Total día: <strong className="text-slate-200">{dayTotals.kcal} kcal</strong> · P {dayTotals.protein}g · C {dayTotals.carbs}g · G {dayTotals.fat}g
            </span>
          </div>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 transition-colors cursor-pointer"
            title="Día siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setDate(getTodayISO())}
          className="min-h-10 px-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-slate-100 transition-colors cursor-pointer"
        >
          Hoy
        </button>
      </section>

      {/* Selector de toma (Desayuno, Comida, etc.) */}
      <section className="surface-card rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MEAL_CATEGORIES.map((m) => {
            const active = mealKey === m.id
            const count = state.nutritionLogs?.[date]?.meals?.[m.id]?.length || 0
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMealKey(m.id)}
                className={`flex items-center gap-2 min-h-10 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/15 border-rose-400/50 text-rose-200 shadow-sm'
                    : 'bg-[#090d16] border-white/10 text-slate-400 hover:text-slate-100'
                }`}
              >
                <span>{m.label}</span>
                {count > 0 && (
                  <span className="font-mono tabular-nums text-[11px] text-amber-300 font-bold">
                    · {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Buscador y selector de alimentos */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-300">
              Añadir alimento a {MEAL_CATEGORIES.find((m) => m.id === mealKey)?.label}
            </label>
            <button
              type="button"
              onClick={() => setShowAddCustomFood(!showAddCustomFood)}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 cursor-pointer"
            >
              {showAddCustomFood ? 'Cerrar creador' : '+ Crear alimento propio'}
            </button>
          </div>

          {/* Formulario inline para crear alimento custom */}
          {showAddCustomFood && (
            <form
              onSubmit={handleSaveCustomFood}
              className="rounded-xl bg-[#090d16] border border-cyan-400/35 p-4 space-y-3"
            >
              <h4 className="text-xs font-bold text-cyan-300">
                Nuevo Alimento Personalizado (valores por 100g)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre (ej. Batido de avena casero)"
                  value={customForm.name}
                  onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-[#0e1526] border border-white/10 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Categoría (ej. Platos caseros)"
                  value={customForm.category}
                  onChange={(e) => setCustomForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full min-h-11 px-3 rounded-xl bg-[#0e1526] border border-white/10 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Kcal / 100g</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kcal"
                    value={customForm.kcal}
                    onChange={(e) => setCustomForm((f) => ({ ...f, kcal: e.target.value }))}
                    className="w-full min-h-11 text-center rounded-lg bg-[#0e1526] border border-white/10 font-mono tabular-nums text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <span className="text-[11px] text-cyan-300 block mb-1">Proteína (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Prot"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm((f) => ({ ...f, protein: e.target.value }))}
                    className="w-full min-h-11 text-center rounded-lg bg-[#0e1526] border border-white/10 font-mono tabular-nums text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 block mb-1">Carbos (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Carb"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm((f) => ({ ...f, carbs: e.target.value }))}
                    className="w-full min-h-11 text-center rounded-lg bg-[#0e1526] border border-white/10 font-mono tabular-nums text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <span className="text-[11px] text-amber-300 block mb-1">Grasas (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Gras"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm((f) => ({ ...f, fat: e.target.value }))}
                    className="w-full min-h-11 text-center rounded-lg bg-[#0e1526] border border-white/10 font-mono tabular-nums text-xs text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 min-h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Guardar alimento
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomFood(false)}
                  className="min-h-11 px-4 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-xs text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar entre alimentos y recetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-11 pl-10 pr-3 rounded-xl bg-[#090d16] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:border-rose-400 focus:outline-none"
            />
          </div>

          {/* Grid de resultados */}
          <div className="rounded-xl bg-[#090d16] border border-white/10 max-h-60 overflow-y-auto p-2 space-y-1.5">
            {filteredFoods.map((food) => {
              const isSelected = selectedFoodId === food.id
              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelectedFoodId(food.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/10 border-rose-400/50 text-white'
                      : 'bg-[#0e1526]/70 border-white/[0.06] text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate flex items-center gap-2">
                      <span>{food.name}</span>
                      {food.isCustom && (
                        <span className="text-[11px] text-cyan-300 font-semibold">
                          · propio
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{food.category}</div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="font-mono text-xs font-bold text-rose-300">{food.per100g.kcal} kcal</span>
                    <div className="font-mono text-[10px] text-slate-400">
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
              className="rounded-xl bg-[#090d16] border border-rose-400/45 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-rose-200 block">
                    {selectedFood.name}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    Valores por cada 100g: {selectedFood.per100g.kcal} kcal (P {selectedFood.per100g.protein}g · C {selectedFood.per100g.carbs}g · G {selectedFood.per100g.fat}g)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFoodId('')}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Cantidad consumida (gramos / ml)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setGrams((g) => String(Math.max(10, (Number(g) || 100) - 25)))}
                      className="min-h-11 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      -25g
                    </button>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      className="flex-1 min-h-11 text-center rounded-xl bg-[#0e1526] border border-white/10 font-mono tabular-nums text-base font-bold text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setGrams((g) => String((Number(g) || 100) + 25))}
                      className="min-h-11 px-3 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-slate-200 cursor-pointer"
                    >
                      +25g
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-rose-500/20 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Añadir a la toma</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Listado de alimentos registrados en esta comida */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-300">
              Registrado en {MEAL_CATEGORIES.find((m) => m.id === mealKey)?.label} ({mealEntries.length})
            </span>
            <span className="font-mono tabular-nums text-xs font-semibold text-amber-300">
              {mealTotals.kcal.toFixed(0)} kcal · P {mealTotals.protein.toFixed(1)}g · C {mealTotals.carbs.toFixed(1)}g · G {mealTotals.fat.toFixed(1)}g
            </span>
          </div>

          {mealEntries.length === 0 ? (
            <div className="rounded-xl bg-[#090d16]/70 border border-dashed border-white/10 p-6 text-center">
              <UtensilsCrossed className="h-6 w-6 text-slate-500 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400">
                No hay alimentos registrados en esta toma. Selecciona uno arriba para empezar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.08] rounded-xl bg-[#090d16] border border-white/10 px-3.5">
              {mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{entry.foodName}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      {entry.grams}g · {entry.kcal} kcal · P {entry.protein}g · C {entry.carbs}g · G {entry.fat}g
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNutritionEntry(entry.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
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
