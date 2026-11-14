import { Dumbbell, LayoutDashboard, Scale, Settings, Utensils } from 'lucide-react'

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'Inicio',
    description: 'Resumen del día',
    icon: LayoutDashboard,
    accentText: 'text-emerald-300',
    accentIcon: 'text-emerald-400',
    accentBg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/12 to-transparent',
    accentBorder: 'border-emerald-400/35',
    mobileActive: 'text-emerald-300 bg-emerald-500/15',
    badgeDot: 'bg-emerald-400',
  },
  {
    id: 'workouts',
    label: 'Entrenamiento',
    shortLabel: 'Entreno',
    description: 'Rutinas y series',
    icon: Dumbbell,
    accentText: 'text-orange-300',
    accentIcon: 'text-orange-400',
    accentBg: 'bg-gradient-to-r from-orange-500/20 via-amber-500/12 to-transparent',
    accentBorder: 'border-orange-400/35',
    mobileActive: 'text-orange-300 bg-orange-500/15',
    badgeDot: 'bg-orange-400',
  },
  {
    id: 'nutrition',
    label: 'Nutrición y Dietas',
    shortLabel: 'Nutrición',
    description: 'TMB, macros y diario',
    icon: Utensils,
    accentText: 'text-rose-300',
    accentIcon: 'text-rose-400',
    accentBg: 'bg-gradient-to-r from-rose-500/20 via-fuchsia-500/12 to-transparent',
    accentBorder: 'border-rose-400/35',
    mobileActive: 'text-rose-300 bg-rose-500/15',
    badgeDot: 'bg-rose-400',
  },
  {
    id: 'progress',
    label: 'Progreso y Peso',
    shortLabel: 'Peso',
    description: 'Media semanal y tendencia',
    icon: Scale,
    accentText: 'text-cyan-300',
    accentIcon: 'text-cyan-400',
    accentBg: 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/12 to-transparent',
    accentBorder: 'border-cyan-400/35',
    mobileActive: 'text-cyan-300 bg-cyan-500/15',
    badgeDot: 'bg-cyan-400',
  },
]

export function Sidebar({ activeTab, onChangeTab, onOpenSettings, targets, latestWeight }) {
  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-[#090d16]/95 backdrop-blur-xl border-r border-white/10 z-30">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-400 text-slate-950 shadow-lg shadow-orange-500/25">
          <Dumbbell className="h-5 w-5 stroke-[2.4]" />
        </div>
        <div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white block leading-none">
            IronTrack
          </span>
          <span className="text-xs text-slate-400">Fuerza · Peso · Macros</span>
        </div>
      </div>

      <nav className="flex-1 px-3.5 py-5 space-y-2 overflow-y-auto" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                isActive
                  ? `${item.accentBg} ${item.accentText} ${item.accentBorder} shadow-sm`
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border-transparent'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isActive ? 'bg-white/10' : 'bg-white/[0.03]'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? item.accentIcon : 'text-slate-400'}`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{item.label}</div>
                <div className="text-xs text-slate-400/90 truncate">{item.description}</div>
              </div>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="rounded-xl bg-[#0d1322] border border-white/10 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Peso actual</span>
            <span className="font-mono tabular-nums font-bold text-cyan-300">
              {latestWeight ? `${latestWeight.weightKg.toFixed(1)} kg` : 'Sin datos'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Objetivo diario</span>
            <span className="font-mono tabular-nums font-bold text-amber-300">
              {targets ? `${targets.targetCalories} kcal` : 'Sin definir'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2.5 min-h-11 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] border border-white/10 text-slate-100 text-sm font-semibold transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 text-orange-400" />
          <span className="whitespace-nowrap">Ajustes y Backup JSON</span>
        </button>
      </div>
    </aside>
  )
}
