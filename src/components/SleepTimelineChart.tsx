import {
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { formatDateTime12 } from '@/time/formatDateTime12'
import { CHART_AXIS_TICK } from '@/charts/chartAxis'
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { toSleepTimelineRows, type SleepTimelineRow } from '@/metrics/sleepChartData'
import type { SleepSession } from '@/types/canonical'

type Props = {
  sessions: SleepSession[]
  rangeStart: number
  rangeEnd: number
  chartResetKey: string
}

export function SleepTimelineChart({
  sessions,
  rangeStart,
  rangeEnd,
  chartResetKey,
}: Props) {
  const rows: SleepTimelineRow[] = toSleepTimelineRows(sessions)
  const spanMs = rangeEnd - rangeStart
  const n = rows.length
  const chartHeight = Math.min(520, Math.max(200, 56 + n * 36))

  if (n === 0) return null

  return (
    <CollapsibleChartCard title="Sleep windows" defaultCollapsed>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ScatterChart
          key={chartResetKey}
          data={rows}
          margin={LINE_CHART_MARGIN_WITH_BRUSH}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="tMid"
            domain={[rangeStart, rangeEnd]}
            allowDataOverflow
            tick={{ ...CHART_AXIS_TICK }}
            tickMargin={10}
            tickFormatter={(v) => formatTimeAxisTick(v as number, spanMs)}
          />
          <YAxis
            type="number"
            dataKey="row"
            domain={[-0.5, Math.max(0, n - 0.5)]}
            allowDecimals={false}
            ticks={rows.map((r) => r.row)}
            tickFormatter={(v) => rows[Number(v)]?.rowLabel ?? ''}
            tick={{ ...CHART_AXIS_TICK, fontSize: 10 }}
            tickMargin={6}
            width={118}
          />
          <ZAxis type="number" dataKey="z" range={[140, 140]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as SleepTimelineRow
              return (
                <div
                  className="recharts-default-tooltip"
                  style={{
                    background: 'var(--surface-raised)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                  }}
                >
                  <p
                    className="recharts-tooltip-label"
                    style={{ margin: '0 0 4px', color: 'var(--text-h)' }}
                  >
                    {formatDateTime12(p.startTime)} → {formatDateTime12(p.endTime)}
                  </p>
                  <p style={{ margin: 0, color: 'var(--text)' }}>
                    Total {p.sleepMinutes} min
                    {p.device ? ` · ${p.device}` : ''}
                  </p>
                </div>
              )
            }}
          />
          {rows.map((r) => (
            <ReferenceArea
              key={`${r.startTime}-${r.endTime}-${r.row}`}
              x1={r.startTime}
              x2={r.endTime}
              y1={r.row - 0.4}
              y2={r.row + 0.4}
              fill="var(--chart-sleep-window)"
              stroke="var(--border)"
              strokeWidth={1}
              ifOverflow="visible"
              pointerEvents="none"
            />
          ))}
          <Scatter
            name="Sleep"
            dataKey="row"
            fill="transparent"
            stroke="none"
            legendType="none"
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </CollapsibleChartCard>
  )
}
