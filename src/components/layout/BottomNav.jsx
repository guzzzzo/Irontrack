import { NAV_ITEMS } from './Sidebar'

export function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 pb-safe"
    >
      <div className="grid grid-cols-4 gap-1 px-2 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-14 py-1.5 px-1 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-zinc-400 active:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold tracking-tight leading-none">
                {item.shortLabel}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
