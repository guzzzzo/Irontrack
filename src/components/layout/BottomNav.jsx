import { NAV_ITEMS } from './Sidebar'

export function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 pb-safe"
    >
      <div className="grid grid-cols-4 gap-1.5 px-2.5 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 min-h-13 py-1.5 px-1 rounded-xl transition-all duration-150 cursor-pointer ${
                isActive
                  ? item.mobileActive
                  : 'text-slate-400 active:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? item.accentIcon : ''}`} />
              <span className="text-[11px] font-semibold tracking-tight leading-none whitespace-nowrap">
                {item.shortLabel}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
