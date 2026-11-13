import { createInitialState, SCHEMA_VERSION, STORAGE_KEY } from '../data/initialState'

/**
 * Combina de forma segura un estado cargado con la estructura base actual
 * para garantizar compatibilidad hacia adelante ante nuevas fases.
 */
export function normalizeState(raw) {
  const base = createInitialState()
  if (!raw || typeof raw !== 'object') return base

  return {
    meta: {
      ...base.meta,
      ...(raw.meta && typeof raw.meta === 'object' ? raw.meta : {}),
      schemaVersion: SCHEMA_VERSION,
    },
    profile: {
      ...base.profile,
      ...(raw.profile && typeof raw.profile === 'object' ? raw.profile : {}),
    },
    nutritionTargets:
      raw.nutritionTargets && typeof raw.nutritionTargets === 'object'
        ? raw.nutritionTargets
        : null,
    bodyWeightLogs: Array.isArray(raw.bodyWeightLogs)
      ? raw.bodyWeightLogs.filter(
          (item) => item && typeof item.date === 'string' && Number(item.weightKg) > 0
        )
      : [],
    customExercises: Array.isArray(raw.customExercises) ? raw.customExercises : [],
    workoutTemplates:
      Array.isArray(raw.workoutTemplates) && raw.workoutTemplates.length > 0
        ? raw.workoutTemplates
        : base.workoutTemplates,
    workoutSessions: Array.isArray(raw.workoutSessions) ? raw.workoutSessions : [],
    customFoods: Array.isArray(raw.customFoods) ? raw.customFoods : [],
    nutritionLogs:
      raw.nutritionLogs && typeof raw.nutritionLogs === 'object' && !Array.isArray(raw.nutritionLogs)
        ? raw.nutritionLogs
        : {},
  }
}

export function loadStateFromStorage() {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) return createInitialState()
    const parsed = JSON.parse(serialized)
    return normalizeState(parsed)
  } catch (err) {
    console.error('Error leyendo localStorage:', err)
    return createInitialState()
  }
}

export function saveStateToStorage(state) {
  try {
    const serialized = JSON.stringify(state)
    window.localStorage.setItem(STORAGE_KEY, serialized)
    return true
  } catch (err) {
    console.error('Error guardando en localStorage:', err)
    return false
  }
}

export function validateBackupPayload(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'El archivo JSON no contiene un objeto de respaldo válido.' }
  }

  const hasExpectedKeys =
    'profile' in parsed || 'bodyWeightLogs' in parsed || 'meta' in parsed || 'nutritionTargets' in parsed

  if (!hasExpectedKeys) {
    return {
      valid: false,
      error: 'El archivo JSON no corresponde a una copia de seguridad de IronTrack.',
    }
  }

  if (parsed.bodyWeightLogs && !Array.isArray(parsed.bodyWeightLogs)) {
    return { valid: false, error: 'El campo bodyWeightLogs del archivo está dañado.' }
  }

  const normalized = normalizeState(parsed)
  return {
    valid: true,
    state: normalized,
    summary: {
      weightCount: normalized.bodyWeightLogs.length,
      hasTargets: Boolean(normalized.nutritionTargets),
      templatesCount: normalized.workoutTemplates.length,
      sessionsCount: normalized.workoutSessions.length,
    },
  }
}

export function downloadBackupJSON(state) {
  const dateStamp = new Date().toISOString().slice(0, 10)
  const payload = JSON.stringify(state, null, 2)
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `irontrack-backup-${dateStamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
