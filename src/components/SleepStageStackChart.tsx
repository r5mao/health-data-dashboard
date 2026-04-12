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
import { toSleepStackRows } from '@/metrics/sleepChartData'
import type { SleepSession } from '@/types/canonical'

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
    <div className="chart-wrap chart-card">
      <h3>Sleep stage minutes (per session)</h3>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          key={chartResetKey}
          data={rows}
          margin={{ top: 8, right: 16, left: 8, bottom }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval={0}
            tick={{ fontSize: 12 }}
            angle={labelCount > 5 ? -30 : 0}
            textAnchor={labelCount > 5 ? 'end' : 'middle'}
            height={labelCount > 5 ? 72 : 36}
          />
          <YAxis tickFormatter={(v) => `${v}`} width={44} />
          <Tooltip
            separator=""
            labelFormatter={(label) => String(label)}
            formatter={(value, name) => [`${value} min`, String(name)]}
            labelStyle={{ color: 'var(--text-h)' }}
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
        Stages show total minutes per session, not order during the night.
      </p>
    </div>
  )
}
