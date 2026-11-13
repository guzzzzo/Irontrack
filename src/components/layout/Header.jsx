import { Dumbbell, Settings } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'

export function Header({ activeTab, onOpenSettings, storageSavedOk }) {
  const current = NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0]

  return (
    <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
          <Dumbbell className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-zinc-50 truncate leading-tight">
            {current.label}
          </h1>
          <p className="text-xs text-zinc-400 truncate">{current.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400"
          title="Guardado automático en almacenamiento local"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              storageSavedOk ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span>{storageSavedOk ? 'Autoguardado' : 'Sin espacio local'}</span>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Abrir ajustes y copia de seguridad"
          className="flex items-center gap-2 min-h-11 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-800 border border-zinc-700/80 text-zinc-100 text-sm font-medium transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 text-zinc-300" />
          <span className="hidden sm:inline">Ajustes</span>
        </button>
      </div>
    </header>
  )
}
