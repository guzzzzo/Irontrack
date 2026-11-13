import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createInitialState, SCHEMA_VERSION } from '../data/initialState'
import { foodsDB } from '../data/foodsDB'
import { analyzeBodyWeight, roundTo } from '../utils/calculations'
import { loadStateFromStorage, normalizeState, saveStateToStorage } from '../utils/storage'

const AppContext = createContext(null)

function defaultCustomExercises() {
  return []
}

function defaultWorkoutTemplates() {
  return []
}

function defaultNutritionLogs() {
  return {}
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    const raw = loadStateFromStorage()
    return normalizeState(raw)
  })
  const [storageSavedOk, setStorageSavedOk] = useState(true)

  useEffect(() => {
    const ok = saveStateToStorage(state)
    setStorageSavedOk(ok)
  }, [state])

  const updateWithTimestamp = (updater) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return {
        ...next,
        meta: {
          ...next.meta,
          updatedAt: new Date().toISOString(),
        },
      }
    })
  }

  const updateProfile = (patch) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ...patch,
      },
    }))
  }

  const applyNutritionTargets = (plan) => {
    const now = new Date().toISOString()
    updateWithTimestamp((prev) => ({
      ...prev,
      nutritionTargets: {
        bmr: plan.bmr,
        tdee: plan.tdee,
        targetCalories: plan.targetCalories,
        proteinG: plan.proteinG,
        fatsG: plan.fatsG,
        carbsG: plan.carbsG,
        goalType: plan.goalType,
        goalAdjustmentPct: plan.goalAdjustmentPct,
        appliedAt: now,
      },
    }))
  }

  const upsertBodyWeight = ({ id, date, weightKg, note = '' }) => {
    const cleanWeight = roundTo(Number(weightKg), 2)
    if (!date || !Number.isFinite(cleanWeight) || cleanWeight <= 0) {
      return { ok: false }
    }
    let mode = 'created'
    updateWithTimestamp((prev) => {
      const existingById = id ? prev.bodyWeightLogs.find((item) => item.id === id) : null
      const existingByDate = prev.bodyWeightLogs.find((item) => item.date === date)
      const target = existingById || existingByDate
      let nextLogs
      if (target) {
        mode = 'updated'
        nextLogs = prev.bodyWeightLogs
          .filter((item) => item.id === target.id || item.date !== date)
          .map((item) =>
            item.id === target.id
              ? {
                  ...item,
                  date,
                  weightKg: cleanWeight,
                  note: note.trim(),
                  updatedAt: new Date().toISOString(),
                }
              : item
          )
      } else {
        const newEntry = {
          id: `bw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          date,
          weightKg: cleanWeight,
          note: note.trim(),
          createdAt: new Date().toISOString(),
        }
        nextLogs = [...prev.bodyWeightLogs, newEntry]
      }
      return {
        ...prev,
        bodyWeightLogs: nextLogs,
      }
    })
    return { ok: true, mode }
  }

  const deleteBodyWeight = (id) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      bodyWeightLogs: prev.bodyWeightLogs.filter((item) => item.id !== id),
    }))
  }

  const loadDemoWeights = () => {
    const demoLogs = createDemoWeightLogs()
    updateWithTimestamp((prev) => {
      const existingByDate = new Map(prev.bodyWeightLogs.map((l) => [l.date, l]))
      for (const demo of demoLogs) {
        if (!existingByDate.has(demo.date)) {
          existingByDate.set(demo.date, demo)
        }
      }
      return {
        ...prev,
        bodyWeightLogs: Array.from(existingByDate.values()),
      }
    })
  }

  const importState = (newState) => {
    const normalized = normalizeState(newState)
    updateWithTimestamp(() => normalized)
  }

  const resetAllData = () => {
    setState(createInitialState())
  }

  // ---------- Custom exercises ----------
  const upsertCustomExercise = (ex) => {
    updateWithTimestamp((prev) => {
      const existing = prev.customExercises.find((item) => item.id === ex.id)
      let next = [...prev.customExercises]
      if (existing) {
        const idx = next.indexOf(existing)
        next[idx] = { ...ex, updatedAt: new Date().toISOString() }
      } else {
        next = [...next, { ...ex, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      }
      return {
        ...prev,
        customExercises: next,
      }
    })
  }

  const deleteCustomExercise = (id) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      customExercises: prev.customExercises.filter((item) => item.id !== id),
    }))
  }

  // ---------- Workout templates ----------
  const upsertTemplate = (tpl) => {
    updateWithTimestamp((prev) => {
      const existing = prev.workoutTemplates.find((item) => item.id === tpl.id)
      let next = [...prev.workoutTemplates]
      if (existing) {
        const idx = next.indexOf(existing)
        next[idx] = tpl
      } else {
        next = [...next, tpl]
      }
      return {
        ...prev,
        workoutTemplates: next,
      }
    })
  }

  const duplicateTemplate = (tplId) => {
    updateWithTimestamp((prev) => {
      const src = prev.workoutTemplates.find((item) => item.id === tplId)
      if (!src) return prev
      const newTemplate = {
        ...src,
        id: `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: `${src.name} (copia)`,
        exercises: src.exercises.map((ex) => ({
          ...ex,
          id: `tplex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        })),
        createdAt: new Date().toISOString(),
      }
      return {
        ...prev,
        workoutTemplates: [...prev.workoutTemplates, newTemplate],
      }
    })
  }

  const deleteTemplate = (id) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      workoutTemplates: prev.workoutTemplates.filter((item) => item.id !== id),
    }))
  }

  const getTemplateById = (id) => state.workoutTemplates.find((t) => t.id === id) || null

  // ---------- Nutrition logs ----------
  const addNutritionEntry = (date, mealKey, foodId, foodName, grams) => {
    const kcalPer100 = foodsDBPer100g(foodId)?.kcal ?? 0
    const proteinPer100 = foodsDBPer100g(foodId)?.protein ?? 0
    const carbsPer100 = foodsDBPer100g(foodId)?.carbs ?? 0
    const fatPer100 = foodsDBPer100g(foodId)?.fat ?? 0

    const kcal = roundTo((kcalPer100 / 100) * grams, 1)
    const protein = roundTo((proteinPer100 / 100) * grams, 1)
    const carbs = roundTo((carbsPer100 / 100) * grams, 1)
    const fat = roundTo((fatPer100 / 100) * grams, 1)

    const entry = {
      id: `${foodId}_${date}_${mealKey}_${grams}_${Date.now()}`,
      foodId,
      foodName,
      grams,
      kcal,
      protein,
      carbs,
      fat,
    }

    updateWithTimestamp((prev) => {
      const dayLogs = prev.nutritionLogs[date] || { meals: { breakfast: [], lunch: [], snack: [], dinner: [], extra: [] } }
      const mealList = dayLogs.meals[mealKey] || []
      mealList.push(entry)
      dayLogs.meals[mealKey] = mealList
      return {
        ...prev,
        nutritionLogs: {
          ...prev.nutritionLogs,
          [date]: dayLogs,
        },
      }
    })
  }

  const removeNutritionEntry = (entryId) => {
    updateWithTimestamp((prev) => {
      const newLogs = {}
      for (const dateKey in prev.nutritionLogs) {
        const dayLogs = prev.nutritionLogs[dateKey]
        const newMeals = {}
        for (const mealKey in dayLogs.meals) {
          const filtered = dayLogs.meals[mealKey].filter((e) => e.id !== entryId)
          if (filtered.length > 0) newMeals[mealKey] = filtered
        }
        if (Object.keys(newMeals).length > 0 || Object.keys(prev.nutritionLogs[dateKey].meals).length > 0) {
          newLogs[dateKey] = { ...dayLogs, meals: newMeals }
        }
      }
      const filteredLogs = Object.keys(newLogs).length > 0 ? newLogs : {}
      return { ...prev, nutritionLogs: filteredLogs }
    })
  }

  const foodsDBPer100g = (foodId) => {
    const food = state.customFoods.find((f) => f.id === foodId) || foodsDB.find((f) => f.id === foodId)
    if (!food) return null
    return food.per100g || null
  }

  // ---------- Custom Foods ----------
  const upsertCustomFood = (food) => {
    updateWithTimestamp((prev) => {
      const existing = prev.customFoods.find((item) => item.id === food.id)
      let next = [...prev.customFoods]
      if (existing) {
        const idx = next.indexOf(existing)
        next[idx] = { ...food, updatedAt: new Date().toISOString() }
      } else {
        next = [...next, { ...food, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
      }
      return {
        ...prev,
        customFoods: next,
      }
    })
  }

  const deleteCustomFood = (id) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      customFoods: prev.customFoods.filter((item) => item.id !== id),
    }))
  }

  // ---------- Workout sessions ----------
  const saveWorkoutSession = (session) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      workoutSessions: [...prev.workoutSessions, session],
    }))
  }

  const deleteWorkoutSession = (id) => {
    updateWithTimestamp((prev) => ({
      ...prev,
      workoutSessions: prev.workoutSessions.filter((s) => s.id !== id),
    }))
  }

  const value = {
    state,
    setState,
    storageSavedOk,
    weightAnalysis: useMemo(
      () => analyzeBodyWeight(state.bodyWeightLogs, state.profile.goalType),
      [state.bodyWeightLogs, state.profile.goalType]
    ),
    // Profile & settings
    updateProfile,
    applyNutritionTargets,
    // Body weight
    upsertBodyWeight,
    deleteBodyWeight,
    loadDemoWeights,
    // Import / reset
    importState,
    resetAllData,
    // Custom exercises
    upsertCustomExercise,
    deleteCustomExercise,
    // Custom foods
    upsertCustomFood,
    deleteCustomFood,
    // Templates
    upsertTemplate,
    duplicateTemplate,
    deleteTemplate,
    getTemplateById,
    // Nutrition
    addNutritionEntry,
    removeNutritionEntry,
    foodsDBPer100g,
    // Workout sessions
    saveWorkoutSession,
    deleteWorkoutSession,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useApp debe utilizarse dentro de AppProvider')
  }
  return ctx
}
