import { Dumbbell, LayoutDashboard, Scale, Settings, Utensils } from 'lucide-react'

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Inicio',
    description: 'Resumen del día',
    icon: LayoutDashboard,
  },
  {
    id: 'workouts',
    label: 'Entrenamiento',
    shortLabel: 'Entreno',
    description: 'Rutinas y series',
    icon: Dumbbell,
  },
  {
    id: 'nutrition',
    label: 'Nutrición y Dietas',
    shortLabel: 'Nutrición',
    description: 'TMB, macros y diario',
    icon: Utensils,
  },
  {
    id: 'progress',
    label: 'Progreso y Peso',
    shortLabel: 'Peso',
    description: 'Media semanal y tendencia',
    icon: Scale,
  },
]

export function Sidebar({ activeTab, onChangeTab, onOpenSettings, targets, latestWeight }) {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-zinc-950 border-r border-zinc-800/90 z-30">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-800/80">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Dumbbell className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-zinc-50 block leading-none">
            IronTrack
          </span>
          <span className="text-xs text-zinc-400">Fuerza, Peso & Macros</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/90 border border-transparent'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{item.label}</div>
                <div className="text-xs text-zinc-500 truncate">{item.description}</div>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Peso actual</span>
            <span className="font-semibold text-zinc-100">
              {latestWeight ? `${latestWeight.weightKg.toFixed(1)} kg` : 'Sin datos'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Objetivo diario</span>
            <span className="font-semibold text-emerald-400">
              {targets ? `${targets.targetCalories} kcal` : 'Sin definir'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-sm font-medium transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 text-zinc-400" />
          <span>Ajustes y Backup JSON</span>
        </button>
      </div>
    </aside>
  )
}
