import { ACTIVITY_LEVELS } from '../data/initialState'

export function roundTo(value, decimals = 1) {
  const factor = 10 ** decimals
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor
}

export function getTodayISO() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function parseISODateUTC(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return date
}

export function formatUTCDateISO(date) {
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatShortDateES(dateStr) {
  const date = parseISODateUTC(dateStr)
  if (!date) return dateStr || ''
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function formatFullDateES(dateStr) {
  const date = parseISODateUTC(dateStr)
  if (!date) return dateStr || ''
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/**
 * Calcula información de semana ISO (Lunes a Domingo) sin errores de zona horaria.
 */
export function getISOWeekInfo(dateStr) {
  const date = parseISODateUTC(dateStr)
  if (!date) return null

  const dayNum = date.getUTCDay() || 7
  const thursday = new Date(date)
  thursday.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const isoYear = thursday.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const weekNo = Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7)

  const monday = new Date(date)
  monday.setUTCDate(date.getUTCDate() - (dayNum - 1))
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  return {
    key: `${isoYear}-W${String(weekNo).padStart(2, '0')}`,
    isoYear,
    weekNo,
    startDate: formatUTCDateISO(monday),
    endDate: formatUTCDateISO(sunday),
  }
}

/**
 * Fórmula Mifflin-St Jeor para TMB + GET + Reparto de macros.
 */
export function calculateDietPlan(profile) {
  const age = Math.max(14, Math.min(100, Number(profile.age) || 0))
  const heightCm = Math.max(100, Math.min(240, Number(profile.heightCm) || 0))
  const weightKg = Math.max(30, Math.min(300, Number(profile.weightKg) || 0))
  const sex = profile.sex === 'female' ? 'female' : 'male'
  const proteinPerKg = Math.max(0.8, Math.min(3.5, Number(profile.proteinPerKg) || 2.0))
  const fatPerKg = Math.max(0.3, Math.min(2.0, Number(profile.fatPerKg) || 0.8))
  const adjustmentPct = Number(profile.goalAdjustmentPct) || 0

  const activityObj =
    ACTIVITY_LEVELS.find((lvl) => lvl.id === profile.activityLevel) || ACTIVITY_LEVELS[2]

  const sexOffset = sex === 'male' ? 5 : -161
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset)
  const tdee = Math.round(bmr * activityObj.factor)
  const targetCalories = Math.max(800, Math.round(tdee * (1 + adjustmentPct / 100)))

  const proteinG = Math.round(weightKg * proteinPerKg)
  const fatsG = Math.round(weightKg * fatPerKg)
  const proteinKcal = proteinG * 4
  const fatsKcal = fatsG * 9
  const remainingKcal = targetCalories - (proteinKcal + fatsKcal)
  const carbsG = Math.max(0, Math.round(remainingKcal / 4))
  const carbsKcal = carbsG * 4

  const macroCaloriesTotal = proteinKcal + fatsKcal + carbsKcal
  const denominator = macroCaloriesTotal || 1

  return {
    bmr,
    tdee,
    activityFactor: activityObj.factor,
    activityLabel: activityObj.label,
    goalType: profile.goalType || 'cut',
    goalAdjustmentPct: adjustmentPct,
    targetCalories,
    macroCaloriesTotal,
    proteinG,
    fatsG,
    carbsG,
    proteinKcal,
    fatsKcal,
    carbsKcal,
    proteinPct: Math.round((proteinKcal / denominator) * 100),
    fatsPct: Math.round((fatsKcal / denominator) * 100),
    carbsPct: Math.round((carbsKcal / denominator) * 100),
    carbsOverflow: remainingKcal < 0,
    lowCalorieWarning: targetCalories < bmr,
  }
}

/**
 * Agrupa registros de peso por semana ISO, calcula medias semanales,
 * diferencia respecto a la semana anterior y detecta estancamientos de 2 semanas.
 */
export function analyzeBodyWeight(logs = [], goalType = 'cut') {
  const sortedAsc = [...logs]
    .filter((entry) => parseISODateUTC(entry.date) && Number(entry.weightKg) > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const sortedDesc = [...sortedAsc].reverse()
  const latestLog = sortedDesc[0] || null
  const previousLog = sortedDesc[1] || null

  const weekMap = new Map()
  for (const entry of sortedAsc) {
    const weekInfo = getISOWeekInfo(entry.date)
    if (!weekInfo) continue
    if (!weekMap.has(weekInfo.key)) {
      weekMap.set(weekInfo.key, {
        ...weekInfo,
        entries: [],
      })
    }
    weekMap.get(weekInfo.key).entries.push(entry)
  }

  const weeklySummariesAsc = Array.from(weekMap.values())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map((week) => {
      const sum = week.entries.reduce((acc, item) => acc + Number(item.weightKg), 0)
      const averageKg = roundTo(sum / week.entries.length, 2)
      return {
        ...week,
        averageKg,
        count: week.entries.length,
        minKg: Math.min(...week.entries.map((e) => Number(e.weightKg))),
        maxKg: Math.max(...week.entries.map((e) => Number(e.weightKg))),
      }
    })

  // Añadir delta respecto a la semana registrada inmediatamente anterior
  for (let i = 0; i < weeklySummariesAsc.length; i += 1) {
    const curr = weeklySummariesAsc[i]
    const prev = i > 0 ? weeklySummariesAsc[i - 1] : null
    if (prev) {
      const currStart = parseISODateUTC(curr.startDate)
      const prevStart = parseISODateUTC(prev.startDate)
      const weeksApart = Math.round((currStart - prevStart) / (7 * 86400000))
      const deltaKg = roundTo(curr.averageKg - prev.averageKg, 2)
      const deltaPct = roundTo((deltaKg / prev.averageKg) * 100, 2)
      curr.deltaKg = deltaKg
      curr.deltaPct = deltaPct
      curr.weeksApart = weeksApart
      curr.prevWeekKey = prev.key
    } else {
      curr.deltaKg = null
      curr.deltaPct = null
      curr.weeksApart = null
      curr.prevWeekKey = null
    }
  }

  const weeklySummariesDesc = [...weeklySummariesAsc].reverse()
  const todayWeek = getISOWeekInfo(getTodayISO())
  const currentWeekSummary =
    weeklySummariesDesc.find((w) => w.key === todayWeek?.key) || weeklySummariesDesc[0] || null

  const currentIdx = currentWeekSummary
    ? weeklySummariesAsc.findIndex((w) => w.key === currentWeekSummary.key)
    : -1
  const previousWeekSummary = currentIdx > 0 ? weeklySummariesAsc[currentIdx - 1] : null

  // Detección de estancamiento de 2 semanas (cuando hay al menos 3 semanas registradas)
  let stagnationAlert = null
  if (weeklySummariesAsc.length >= 3) {
    const wLast = weeklySummariesAsc[weeklySummariesAsc.length - 1]
    const wPrev = weeklySummariesAsc[weeklySummariesAsc.length - 2]
    const wTwoAgo = weeklySummariesAsc[weeklySummariesAsc.length - 3]
    const twoWeekChange = roundTo(wLast.averageKg - wTwoAgo.averageKg, 2)

    if (goalType === 'cut' && wLast.averageKg >= wPrev.averageKg - 0.05 && twoWeekChange >= -0.15) {
      stagnationAlert = {
        type: 'cut_plateau',
        title: 'Posible meseta en definición (2 semanas)',
        message: `Tu media semanal apenas bajó (${twoWeekChange > 0 ? '+' : ''}${twoWeekChange} kg en 2 semanas). Considera reducir ~150 kcal diarias o añadir 1.500–2.000 pasos al día.`,
      }
    } else if (
      goalType === 'bulk' &&
      wLast.averageKg <= wPrev.averageKg + 0.05 &&
      twoWeekChange <= 0.15
    ) {
      stagnationAlert = {
        type: 'bulk_plateau',
        title: 'Posible estancamiento en volumen (2 semanas)',
        message: `Tu media semanal no ha subido en 2 semanas (${twoWeekChange > 0 ? '+' : ''}${twoWeekChange} kg). Considera sumar +150–200 kcal limpias al día.`,
      }
    }
  }

  return {
    sortedAsc,
    sortedDesc,
    latestLog,
    previousLog,
    dailyDeltaKg:
      latestLog && previousLog
        ? roundTo(Number(latestLog.weightKg) - Number(previousLog.weightKg), 2)
        : null,
    weeklySummariesAsc,
    weeklySummariesDesc,
    currentWeekSummary,
    previousWeekSummary,
    isCurrentCalendarWeek: Boolean(
      currentWeekSummary && todayWeek && currentWeekSummary.key === todayWeek.key
    ),
    stagnationAlert,
  }
}

/**
 * Fórmula de Epley para 1RM estimado (lista para Módulo de Gimnasio).
 */
export function calculateEpley1RM(weightKg, reps) {
  const w = Number(weightKg)
  const r = Number(reps)
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0
  if (r === 1) return roundTo(w, 1)
  return roundTo(w * (1 + r / 30), 1)
}

/**
 * Evalúa Sobrecarga Progresiva comparando una serie actual con la serie anterior.
 */
export function compareSetProgression(currentSet, previousSet) {
  if (!previousSet) return 'baseline'
  if (currentSet.weightKg > previousSet.weightKg) return 'improved'
  if (currentSet.weightKg === previousSet.weightKg && currentSet.reps > previousSet.reps) {
    return 'improved'
  }
  if (
    currentSet.weightKg === previousSet.weightKg &&
    currentSet.reps === previousSet.reps &&
    Number(currentSet.rir) < Number(previousSet.rir)
  ) {
    return 'improved'
  }
  if (
    currentSet.weightKg === previousSet.weightKg &&
    currentSet.reps === previousSet.reps &&
    Number(currentSet.rir) === Number(previousSet.rir)
  ) {
    return 'maintained'
  }
  return 'regressed'
}
