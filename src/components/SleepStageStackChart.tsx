import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { CHART_AXIS_TICK, padTimeDomainForBars } from '@/charts/chartAxis'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { useChartDragZoom } from '@/charts/useChartDragZoom'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import {
  formatMinutesAsHhMm,
  toSleepStackRows,
  type SleepStackRow,
} from '@/metrics/sleepChartData'
import { useMemo } from 'react'
import { formatTooltipDateTime } from '@/time/formatDateTime12'
import type { SleepSession } from '@/types/canonical'

function SleepStageTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as SleepStackRow
  return (
    <div className="recharts-default-tooltip">
      <p
        className="recharts-tooltip-label"
        style={{ marginBottom: 6, lineHeight: 1.45 }}
      >
        Start: {formatTooltipDateTime(row.startTime)}
        <br />
        End: {formatTooltipDateTime(row.endTime)}
      </p>
      <ul
        className="recharts-tooltip-item-list"
        style={{ padding: 0, margin: 0, listStyle: 'none' }}
      >
        {payload.map((entry, i) => (
          <li
            key={i}
            className="recharts-tooltip-item"
            style={{ color: entry.color, paddingTop: i === 0 ? 0 : 2 }}
          >
            <span className="recharts-tooltip-item-name">{String(entry.name)}: </span>
            <span className="recharts-tooltip-item-value">
              {formatMinutesAsHhMm(Number(entry.value))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatYAxisHours(v: number): string {
  const m = Number(v)
  if (!Number.isFinite(m)) return ''
  const h = m / 60
  if (h === 0) return '0 h'
  const rounded = Math.round(h * 10) / 10
  const text = rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1)
  return `${text} h`
}

type Props = {
  sessions: SleepSession[]
  chartResetKey: string
}

export function SleepStageStackChart({ sessions, chartResetKey }: Props) {
  const rows = toSleepStackRows(sessions)
  const zoom = useChartDragZoom(rows, chartResetKey)

  if (rows.length === 0) return null

  const data = zoom.zoomedData
  const xDomain = useMemo(() => padTimeDomainForBars(data), [data])
  const labelCount = data.length
  const bottom = labelCount > 8 ? 88 : labelCount > 4 ? 64 : 48
  const tickCount = Math.min(14, Math.max(6, labelCount))

  return (
    <CollapsibleChartCard title="Sleep stage time (per session)">
      {zoom.isZoomed && (
        <div className="zoom-reset-bar">
          <span className="zoom-reset-label">Zoomed in</span>
          <button
            type="button"
            className="btn secondary zoom-reset-btn"
            onClick={zoom.resetZoom}
          >
            Reset zoom
          </button>
        </div>
      )}
      <div className="drag-zoom-chart">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            key={chartResetKey}
            data={data}
            margin={{ top: 12, right: 16, left: 56, bottom: bottom + 4 }}
            maxBarSize={48}
            barCategoryGap="18%"
            {...zoom.chartHandlers}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="t"
              domain={xDomain ?? ['dataMin', 'dataMax']}
              tickCount={tickCount}
              minTickGap={4}
              tick={{
                ...CHART_AXIS_TICK,
                fontSize: labelCount > 5 ? 10 : 11,
              }}
              tickMargin={8}
              angle={labelCount > 5 ? -30 : 0}
              textAnchor={labelCount > 5 ? 'end' : 'middle'}
              height={labelCount > 5 ? 72 : 48}
              tickFormatter={(v) => formatTimeAxisTick(v as number, zoom.visibleSpanMs)}
            />
            <YAxis
              tickFormatter={formatYAxisHours}
              tick={{ ...CHART_AXIS_TICK }}
              tickMargin={8}
              width={52}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fill: 'var(--text)' },
              }}
            />
            <Tooltip content={SleepStageTooltip} />
            <Legend />
            <Bar
              dataKey="deep"
              name="Deep"
              stackId="stages"
              fill="var(--chart-sleep-deep)"
            />
            <Bar
              dataKey="light"
              name="Light"
              stackId="stages"
              fill="var(--chart-sleep-light)"
            />
            <Bar
              dataKey="awake"
              name="Awake"
              stackId="stages"
              fill="var(--chart-sleep-awake)"
            />
            {zoom.selArea && (
              <ReferenceArea
                x1={zoom.selArea.x1}
                x2={zoom.selArea.x2}
                fill="var(--accent)"
                fillOpacity={0.15}
                stroke="var(--accent)"
                strokeOpacity={0.4}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
        Stages show total time per session, not order during the night.
      </p>
    </CollapsibleChartCard>
  )
}
