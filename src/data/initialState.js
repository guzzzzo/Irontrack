export const STORAGE_KEY = 'irontrack_state_v1'
export const SCHEMA_VERSION = 1

export const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    label: 'Sedentario',
    factor: 1.2,
    description: 'Trabajo de oficina, poco o ningún entrenamiento semanal.',
  },
  {
    id: 'light',
    label: 'Actividad ligera',
    factor: 1.375,
    description: 'Entrenamiento 1–3 días/semana o pasos moderados.',
  },
  {
    id: 'moderate',
    label: 'Actividad moderada',
    factor: 1.55,
    description: 'Gimnasio 3–5 días/semana con intensidad media-alta.',
  },
  {
    id: 'active',
    label: 'Actividad alta',
    factor: 1.725,
    description: 'Entrenamiento intenso 6–7 días/semana o trabajo activo.',
  },
  {
    id: 'very_active',
    label: 'Muy alta',
    factor: 1.9,
    description: 'Doble sesión diaria o trabajo físico muy exigente.',
  },
]

export const GOAL_TYPES = [
  {
    id: 'cut',
    label: 'Definición',
    shortLabel: 'Déficit',
    defaultAdjustmentPct: -15,
    presets: [-10, -15, -20, -25],
    description: 'Déficit calórico controlado para perder grasa preservando masa muscular.',
  },
  {
    id: 'maintenance',
    label: 'Mantenimiento',
    shortLabel: 'Recomposición',
    defaultAdjustmentPct: 0,
    presets: [-5, 0, 5],
    description: 'Calorías de equilibrio para sostener rendimiento y recomposición.',
  },
  {
    id: 'bulk',
    label: 'Volumen limpio',
    shortLabel: 'Superávit',
    defaultAdjustmentPct: 10,
    presets: [5, 10, 15, 20],
    description: 'Superávit moderado para maximizar hipertrofia minimizando ganancia grasa.',
  },
]

export const MEAL_CATEGORIES = [
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Comida' },
  { id: 'snack', label: 'Merienda' },
  { id: 'dinner', label: 'Cena' },
  { id: 'extra', label: 'Snacks' },
]

export function createInitialState() {
  const now = new Date().toISOString()
  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
      appName: 'IronTrack',
      createdAt: now,
      updatedAt: now,
    },
    profile: {
      age: 28,
      sex: 'male',
      heightCm: 178,
      weightKg: 78.0,
      activityLevel: 'moderate',
      goalType: 'cut',
      goalAdjustmentPct: -15,
      proteinPerKg: 2.0,
      fatPerKg: 0.8,
    },
    nutritionTargets: null,
    bodyWeightLogs: [],
    customExercises: [],
    workoutTemplates: [
      {
        id: 'tpl_push_a',
        name: 'Push A (Pecho, Hombro, Tríceps)',
        description: 'Enfoque en empujes pesados y congestión pectoral',
        createdAt: now,
        exercises: [
          {
            id: 'tplex_p1',
            exerciseId: 'ex_bench_press_barbell',
            targetSets: 4,
            repMin: 6,
            repMax: 8,
            targetRir: 2,
            restSeconds: 150,
          },
          {
            id: 'tplex_p2',
            exerciseId: 'ex_incline_dumbbell_press',
            targetSets: 3,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            restSeconds: 120,
          },
          {
            id: 'tplex_p3',
            exerciseId: 'ex_shoulder_press_dumbbell',
            targetSets: 3,
            repMin: 8,
            repMax: 12,
            targetRir: 2,
            restSeconds: 90,
          },
          {
            id: 'tplex_p4',
            exerciseId: 'ex_tricep_pushdown_cable',
            targetSets: 3,
            repMin: 10,
            repMax: 15,
            targetRir: 1,
            restSeconds: 60,
          },
        ],
      },
      {
        id: 'tpl_pull_a',
        name: 'Pull A (Espalda, Bíceps, Posterior)',
        description: 'Dorsal ancho, romboides y flexores de codo',
        createdAt: now,
        exercises: [
          {
            id: 'tplex_pu1',
            exerciseId: 'ex_lat_pull_down',
            targetSets: 4,
            repMin: 8,
            repMax: 10,
            targetRir: 2,
            restSeconds: 120,
          },
          {
            id: 'tplex_pu2',
            exerciseId: 'ex_seated_row_cable',
            targetSets: 3,
            repMin: 8,
            repMax: 12,
            targetRir: 2,
            restSeconds: 90,
          },
          {
            id: 'tplex_pu3',
            exerciseId: 'ex_reverse_fly_cable',
            targetSets: 3,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            restSeconds: 60,
          },
          {
            id: 'tplex_pu4',
            exerciseId: 'ex_bicep_curl_dumbbell',
            targetSets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 1,
            restSeconds: 60,
          },
        ],
      },
      {
        id: 'tpl_legs_a',
        name: 'Pierna A (Cuádriceps, Isquios, Gemelos)',
        description: 'Patrón de sentadilla, bisagra de cadera y accesorios',
        createdAt: now,
        exercises: [
          {
            id: 'tplex_l1',
            exerciseId: 'ex_squat_barbell',
            targetSets: 4,
            repMin: 6,
            repMax: 8,
            targetRir: 2,
            restSeconds: 180,
          },
          {
            id: 'tplex_l2',
            exerciseId: 'ex_leg_press_machine',
            targetSets: 3,
            repMin: 10,
            repMax: 12,
            targetRir: 2,
            restSeconds: 120,
          },
          {
            id: 'tplex_l3',
            exerciseId: 'ex_leg_curl_machine',
            targetSets: 4,
            repMin: 10,
            repMax: 12,
            targetRir: 1,
            restSeconds: 90,
          },
          {
            id: 'tplex_l4',
            exerciseId: 'ex_calf_raise_machine',
            targetSets: 4,
            repMin: 12,
            repMax: 15,
            targetRir: 1,
            restSeconds: 60,
          },
        ],
      },
    ],
    workoutSessions: [],
    customFoods: [],
    nutritionLogs: {},
  }
}

/**
 * Genera 21 días de registros de peso realistas relativos a hoy
 * para probar medias semanales, deltas y gráfica desde Ajustes.
 */
export function createDemoWeightLogs() {
  const weights = [
    80.4, 80.1, 80.3, 79.9, 79.8, 80.0, 79.7, // Semana -2 (media ~80.03)
    79.6, 79.8, 79.4, 79.3, 79.5, 79.2, 79.1, // Semana -1 (media ~79.41)
    79.2, 78.9, 78.8, 79.0, 78.7, 78.6, 78.5, // Semana actual (media ~78.81)
  ]
  const today = new Date()
  return weights.map((weightKg, idx) => {
    const offset = weights.length - 1 - idx
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const date = `${yyyy}-${mm}-${dd}`
    return {
      id: `bw_demo_${date}`,
      date,
      weightKg,
      note: idx % 5 === 0 ? 'En ayunas post-descanso' : 'En ayunas',
      createdAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 7, 30).toISOString(),
    }
  })
}
