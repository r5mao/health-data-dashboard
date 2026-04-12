import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { useBrushTimeSpan } from '@/charts/useBrushTimeSpan'
import { ChartBrush } from '@/components/ChartBrush'
import { db } from '@/db/schema'
import { bucketBloodPressureDaily } from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

export function BloodPressurePage({
  dataRevision,
}: {
  dataRevision: number
}) {
  const { range } = useDateRange()
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof loadBp>>
  >([])

  useEffect(() => {
    void loadBp(range.start, range.end).then(setRows)
  }, [range.start, range.end, dataRevision])

  const daily = bucketBloodPressureDaily(rows, range.start, range.end)
  const series = rows.map((r) => ({
    t: r.timestamp,
    sys: r.systolic,
    dia: r.diastolic,
  }))

  const bpBrushKey = `${range.start}-${range.end}-${rows.length}-${dataRevision}`
  const { visibleSpanMs, onBrushChange } = useBrushTimeSpan(series, bpBrushKey)

  return (
    <div className="page">
      <h2>Blood pressure</h2>
      <p className="muted">
        Individual readings and daily averages in the selected range. Use the
        range bar under the readings chart to zoom into part of a day.
      </p>
      {rows.length === 0 ? (
        <p className="muted">
          No readings in this range. Import CSV or widen the range.
        </p>
      ) : (
        <>
          <div className="chart-wrap">
            <h3>Readings</h3>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart
                key={`bp-readings-${range.start}-${range.end}-${rows.length}`}
                data={series}
                margin={LINE_CHART_MARGIN_WITH_BRUSH}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="t"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={(v) =>
                    formatTimeAxisTick(v as number, visibleSpanMs)
                  }
                />
                <YAxis domain={['auto', 'auto']} unit=" mmHg" />
                <Tooltip
                  labelFormatter={(v) => format(v as number, 'PPpp')}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sys"
                  name="Systolic"
                  stroke="var(--chart-sys)"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="dia"
                  name="Diastolic"
                  stroke="var(--chart-dia)"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <ChartBrush onChange={onBrushChange} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrap">
            <h3>Daily averages</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={daily.filter((d) => d.n > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sysAvg"
                  name="Systolic avg"
                  stroke="var(--chart-sys)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="diaAvg"
                  name="Diastolic avg"
                  stroke="var(--chart-dia)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

async function loadBp(start: number, end: number) {
  return db.bloodPressure
    .where('timestamp')
    .between(start, end, true, true)
    .toArray()
}
