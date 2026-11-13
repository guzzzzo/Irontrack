import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AppShell } from './components/layout/AppShell'
import { SettingsModal } from './components/settings/SettingsModal'
import { DashboardPage } from './pages/DashboardPage'
import { WorkoutsPage } from './pages/WorkoutsPage'
import { NutritionPage } from './pages/NutritionPage'
import { ProgressPage } from './pages/ProgressPage'

function AppContent() {
  const { state, storageSavedOk, weightAnalysis } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleNavigate = (tab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onChangeTab={handleNavigate}
        onOpenSettings={() => setSettingsOpen(true)}
        storageSavedOk={storageSavedOk}
        targets={state.nutritionTargets}
        latestWeight={weightAnalysis.latestLog}
      >
        {activeTab === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {activeTab === 'workouts' && <WorkoutsPage />}
        {activeTab === 'nutrition' && <NutritionPage />}
        {activeTab === 'progress' && <ProgressPage />}
      </AppShell>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
