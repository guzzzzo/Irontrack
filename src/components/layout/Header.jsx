import { CheckCircle2, AlertTriangle, Dumbbell, Settings } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'

export function Header({ activeTab, onOpenSettings, storageSavedOk }) {
  const current = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0]

  return (
    <header className="sticky top-0 z-30 h-15 bg-[#07090f]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-rose-500 to-amber-400 text-slate-950 shadow-md shadow-orange-500/20">
          <Dumbbell className="h-4 w-4 stroke-[2.4]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-extrabold text-white truncate leading-tight">
            {current.label}
          </h1>
          <p className="text-xs text-slate-400 truncate">{current.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div
          className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400"
          title="Guardado automático en almacenamiento local"
        >
          {storageSavedOk ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span className="whitespace-nowrap">
            {storageSavedOk ? 'Guardado local' : 'Sin espacio local'}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Abrir ajustes y copia de seguridad"
          className="flex items-center gap-2 min-h-10 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-100 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Settings className="h-4 w-4 text-orange-400" />
          <span className="hidden sm:inline">Ajustes</span>
        </button>
      </div>
    </header>
  )
}
