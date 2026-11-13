import { useMemo, useState } from 'react'
import { LineChart, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { formatShortDateES, getISOWeekInfo } from '../../utils/calculations'

const RANGE_OPTIONS = [
  { id: '14', label: '14 días' },
  { id: '30', label: '30 días' },
  { id: 'all', label: 'Todo' },
]

export function WeightTrendChart() {
  const { weightAnalysis, loadDemoWeights } = useApp()
  const [range, setRange] = useState('30')
  const [selectedIndex, setSelectedIndex] = useState(null)

  const { sortedAsc, weeklySummariesAsc } = weightAnalysis

  const filteredPoints = useMemo(() => {
    if (range === 'all') return sortedAsc
    const limit = Number(range)
    return sortedAsc.slice(-limit)
  }, [sortedAsc, range])

  const weeklyAvgMap = useMemo(() => {
    const map = new Map()
    for (const w of weeklySummariesAsc) {
      map.set(w.key, w.averageKg)
    }
    return map
  }, [weeklySummariesAsc])

  const chartData = useMemo(() => {
    if (filteredPoints.length === 0) return null

    const enriched = filteredPoints.map((p) => {
      const wInfo = getISOWeekInfo(p.date)
      return {
        ...p,
        weekKey: wInfo?.key,
        weekAvg: wInfo ? weeklyAvgMap.get(wInfo.key) : p.weightKg,
      }
    })

    const values = enriched.flatMap((p) => [p.weightKg, p.weekAvg].filter(Boolean))
    const rawMin = Math.min(...values)
    const rawMax = Math.max(...values)
    const padding = Math.max(0.6, (rawMax - rawMin) * 0.22)
    const minY = Math.floor((rawMin - padding) * 10) / 10
    const maxY = Math.ceil((rawMax + padding) * 10) / 10
    const spanY = maxY - minY || 1

    const width = 640
    const height = 240
    const padLeft = 48
    const padRight = 18
    const padTop = 20
    const padBottom = 32
    const plotW = width - padLeft - padRight
    const plotH = height - padTop - padBottom

    const coords = enriched.map((p, idx) => {
      const x =
        enriched.length === 1
          ? padLeft + plotW / 2
          : padLeft + (idx / (enriched.length - 1)) * plotW
      const yDaily = padTop + ((maxY - p.weightKg) / spanY) * plotH
      const yAvg = padTop + ((maxY - p.weekAvg) / spanY) * plotH
      return {
        ...p,
        x,
        yDaily,
        yAvg,
      }
    })

    const dailyPath = coords
      .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yDaily.toFixed(1)}`)
      .join(' ')

    const avgPath = coords
      .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.yAvg.toFixed(1)}`)
      .join(' ')

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
      const val = maxY - t * spanY
      return {
        val: val.toFixed(1),
        y: padTop + t * plotH,
      }
    })

    return {
      width,
      height,
      padLeft,
      padRight,
      padBottom,
      coords,
      dailyPath,
      avgPath,
      yTicks,
    }
  }, [filteredPoints, weeklyAvgMap])

  const activePoint =
    chartData && chartData.coords.length > 0
      ? chartData.coords[
          selectedIndex !== null && selectedIndex < chartData.coords.length
            ? selectedIndex
            : chartData.coords.length - 1
        ]
      : null

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
            <LineChart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-50">Tendencia de Peso Corporal</h2>
            <p className="text-xs text-zinc-400">Peso diario frente a media semanal</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-zinc-950 border border-zinc-800 p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setRange(opt.id)
                setSelectedIndex(null)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                range === opt.id
                  ? 'bg-zinc-800 text-zinc-50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {!chartData ? (
        <div className="rounded-xl bg-zinc-950/70 border border-dashed border-zinc-800 p-6 text-center space-y-3">
          <p className="text-sm text-zinc-300 font-medium">
            Aún no hay suficientes pesajes para dibujar la tendencia.
          </p>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Registra tus pesos en el formulario superior o carga un ejemplo de 3 semanas para
            visualizar la curva diaria y las medias semanales.
          </p>
          <button
            type="button"
            onClick={loadDemoWeights}
            className="inline-flex items-center gap-2 min-h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-cyan-300 border border-zinc-700 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Cargar 3 semanas de ejemplo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Inspector del punto seleccionado */}
          {activePoint && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-950/80 border border-zinc-800 px-3.5 py-2.5 text-xs">
              <span className="font-semibold text-zinc-200">
                {formatShortDateES(activePoint.date)}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Diario: <strong className="text-zinc-50">{activePoint.weightKg.toFixed(1)} kg</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Media sem:{' '}
                  <strong className="text-emerald-300">{activePoint.weekAvg?.toFixed(2)} kg</strong>
                </span>
              </div>
            </div>
          )}

          {/* Gráfica SVG */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-56 sm:h-64 select-none"
              role="img"
              aria-label="Gráfica de tendencia de peso corporal"
            >
              {/* Líneas horizontales y eje Y */}
              {chartData.yTicks.map((tick, idx) => (
                <g key={idx}>
                  <line
                    x1={chartData.padLeft}
                    x2={chartData.width - chartData.padRight}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="#27272a"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartData.padLeft - 8}
                    y={tick.y + 4}
                    textAnchor="end"
                    className="fill-zinc-500 text-[11px]"
                  >
                    {tick.val}
                  </text>
                </g>
              ))}

              {/* Línea de media semanal */}
              {chartData.coords.length > 1 && (
                <path
                  d={chartData.avgPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Línea diaria */}
              {chartData.coords.length > 1 && (
                <path
                  d={chartData.dailyPath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.75"
                  strokeOpacity="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Puntos interactivos */}
              {chartData.coords.map((pt, idx) => {
                const isSelected = activePoint?.id === pt.id
                return (
                  <g
                    key={pt.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedIndex(idx)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    {/* Área táctil invisible más amplia */}
                    <circle cx={pt.x} cy={pt.yDaily} r="14" fill="transparent" />
                    {isSelected && (
                      <line
                        x1={pt.x}
                        x2={pt.x}
                        y1={16}
                        y2={chartData.height - chartData.padBottom}
                        stroke="#3f3f46"
                        strokeWidth="1"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.yDaily}
                      r={isSelected ? 5.5 : 3.5}
                      fill={isSelected ? '#22d3ee' : '#09090b'}
                      stroke="#22d3ee"
                      strokeWidth="2"
                    />
                  </g>
                )
              })}

              {/* Etiquetas inicio / medio / fin en eje X */}
              {chartData.coords.length > 0 && (
                <>
                  <text
                    x={chartData.coords[0].x}
                    y={chartData.height - 8}
                    textAnchor="start"
                    className="fill-zinc-500 text-[11px]"
                  >
                    {formatShortDateES(chartData.coords[0].date)}
                  </text>
                  {chartData.coords.length > 2 && (
                    <text
                      x={chartData.coords[Math.floor(chartData.coords.length / 2)].x}
                      y={chartData.height - 8}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[11px]"
                    >
                      {formatShortDateES(
                        chartData.coords[Math.floor(chartData.coords.length / 2)].date
                      )}
                    </text>
                  )}
                  {chartData.coords.length > 1 && (
                    <text
                      x={chartData.coords[chartData.coords.length - 1].x}
                      y={chartData.height - 8}
                      textAnchor="end"
                      className="fill-zinc-500 text-[11px]"
                    >
                      {formatShortDateES(
                        chartData.coords[chartData.coords.length - 1].date
                      )}
                    </text>
                  )}
                </>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              Peso diario
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-emerald-400 rounded-full" />
              Media semanal (suavizada)
            </span>
            <span className="ml-auto text-zinc-500">Toca cualquier punto para ver detalle</span>
          </div>
        </div>
      )}
    </div>
  )
}
