import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({
  activeTab,
  onChangeTab,
  onOpenSettings,
  storageSavedOk,
  targets,
  latestWeight,
  children,
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={onChangeTab}
        onOpenSettings={onOpenSettings}
        targets={targets}
        latestWeight={latestWeight}
      />

      <div className="md:pl-72 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onOpenSettings={onOpenSettings}
          storageSavedOk={storageSavedOk}
        />

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-28 md:pb-10">
          {children}
        </main>
      </div>

      <BottomNav activeTab={activeTab} onChangeTab={onChangeTab} />
    </div>
  )
}
