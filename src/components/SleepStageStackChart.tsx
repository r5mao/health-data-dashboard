import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { formatMinutesAsHhMm, toSleepStackRows } from '@/metrics/sleepChartData'
import type { SleepSession } from '@/types/canonical'

/** Y-axis domain is minutes; labels are hours. */
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
  if (rows.length === 0) return null

  const labelCount = rows.length
  const bottom = labelCount > 8 ? 88 : labelCount > 4 ? 64 : 48

  return (
    <CollapsibleChartCard title="Sleep stage time (per session)">
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          key={chartResetKey}
          data={rows}
          margin={{ top: 8, right: 16, left: 12, bottom }}
          maxBarSize={48}
          barCategoryGap="18%"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            tick={{ fontSize: 12 }}
            angle={labelCount > 5 ? -30 : 0}
            textAnchor={labelCount > 5 ? 'end' : 'middle'}
            height={labelCount > 5 ? 72 : 48}
          />
          <YAxis
            tickFormatter={formatYAxisHours}
            width={52}
            label={{
              value: 'Hours',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'var(--text)' },
            }}
          />
          <Tooltip
            separator="     "
            labelFormatter={(label) => String(label)}
            formatter={(value, name) => [
              formatMinutesAsHhMm(Number(value)),
              String(name),
            ]}
            labelStyle={{ color: 'var(--text-h)' }}
            itemStyle={{ paddingTop: 2, paddingBottom: 2 }}
          />
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
        </BarChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
        Stages show total time per session, not order during the night.
      </p>
    </CollapsibleChartCard>
  )
}
