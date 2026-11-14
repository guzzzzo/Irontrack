import { useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileUp,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { downloadBackupJSON, validateBackupPayload } from '../../utils/storage'

export function SettingsModal({ isOpen, onClose }) {
  const { state, importState, resetAllData, loadDemoWeights } = useApp()
  const fileInputRef = useRef(null)

  const [pendingBackup, setPendingBackup] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  if (!isOpen) return null

  const handleExport = () => {
    downloadBackupJSON(state)
    setFeedback({
      type: 'success',
      text: 'Copia de seguridad descargada correctamente en formato JSON.',
    })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''))
        const result = validateBackupPayload(parsed)
        if (!result.valid) {
          setPendingBackup(null)
          setFeedback({ type: 'error', text: result.error })
          return
        }
        setPendingBackup({
          fileName: file.name,
          state: result.state,
          summary: result.summary,
        })
        setFeedback(null)
      } catch {
        setPendingBackup(null)
        setFeedback({
          type: 'error',
          text: 'No se pudo leer el archivo. Asegúrate de que sea un JSON válido.',
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmImport = () => {
    if (!pendingBackup) return
    importState(pendingBackup.state)
    setPendingBackup(null)
    setFeedback({
      type: 'success',
      text: 'Copia de seguridad restaurada y guardada en localStorage.',
    })
  }

  const handleLoadDemo = () => {
    loadDemoWeights()
    setFeedback({
      type: 'success',
      text: 'Se han añadido 21 días de peso de ejemplo (solo en fechas sin datos previos).',
    })
  }

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetAllData()
    setConfirmReset(false)
    setPendingBackup(null)
    setFeedback({
      type: 'success',
      text: 'Todos los datos locales se han restablecido al estado inicial.',
    })
  }

  const updatedLabel = state.meta?.updatedAt
    ? new Date(state.meta.updatedAt).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Reciente'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#0e1526] border border-white/15 shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-[#0e1526]/95 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-cyan-300" />
            <h2 id="settings-modal-title" className="text-lg font-bold text-white">
              Ajustes y Copia de Seguridad
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ajustes"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {feedback && (
            <div
              className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-400/35 text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Resumen de estado local */}
          <div className="rounded-xl bg-[#090d16] border border-white/10 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Último guardado automático</span>
              <span className="text-slate-100 font-medium tabular-nums">{updatedLabel}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Registros de peso corporal</span>
              <span className="font-mono tabular-nums text-cyan-300 font-bold">{state.bodyWeightLogs.length}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Objetivo calórico aplicado</span>
              <span className="font-mono tabular-nums text-amber-300 font-bold">
                {state.nutritionTargets ? `${state.nutritionTargets.targetCalories} kcal` : 'No'}
              </span>
            </div>
          </div>

          {/* Exportar / Importar JSON */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Copia de seguridad en JSON
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tus datos viven en tu dispositivo (<code className="text-cyan-300">localStorage</code>).
              Exporta un archivo JSON para respaldar o mover tu historial a otro móvil.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-bold text-sm transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 min-h-12 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <FileUp className="h-4 w-4 text-orange-300" />
                <span>Importar JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {pendingBackup && (
              <div className="rounded-xl bg-amber-500/15 border border-amber-400/35 p-4 space-y-3">
                <div className="text-sm font-semibold text-amber-200">
                  Archivo listo para restaurar: {pendingBackup.fileName}
                </div>
                <ul className="text-xs text-slate-200 space-y-1 tabular-nums">
                  <li>• Registros de peso: {pendingBackup.summary.weightCount}</li>
                  <li>
                    • Objetivo nutricional:{' '}
                    {pendingBackup.summary.hasTargets ? 'Incluido' : 'Sin configurar'}
                  </li>
                  <li>• Plantillas de entreno: {pendingBackup.summary.templatesCount}</li>
                  <li>• Sesiones registradas: {pendingBackup.summary.sessionsCount}</li>
                </ul>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="flex-1 min-h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm cursor-pointer"
                  >
                    Confirmar importación
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingBackup(null)}
                    className="min-h-11 px-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-100 text-sm cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Utilidades de prueba y reinicio */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="w-full flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span>Cargar 3 semanas de peso de ejemplo</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className={`flex-1 flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  confirmReset
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-[#090d16] hover:bg-rose-500/15 border border-rose-400/35 text-rose-300'
                }`}
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {confirmReset ? 'Confirmar: borrar todos los datos' : 'Restablecer datos locales'}
                </span>
              </button>
              {confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-11 px-4 rounded-xl bg-white/[0.08] text-slate-200 text-sm cursor-pointer"
                >
                  No
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
