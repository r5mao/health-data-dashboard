import { formatDateTime12 } from '@/time/formatDateTime12'
import { useEffect, useMemo, useState } from 'react'
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
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { ChartBrush } from '@/components/ChartBrush'
import { SleepStageStackChart } from '@/components/SleepStageStackChart'
import { SleepTimelineChart } from '@/components/SleepTimelineChart'
import { db } from '@/db/schema'
import { bucketTimeseries, timeseriesChartGranularity } from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

export function RecoveryPage({
  dataRevision,
}: {
  dataRevision: number
}) {
  const { range } = useDateRange()
  const [ts, setTs] = useState<Awaited<ReturnType<typeof loadTs>>>([])
  const [sleep, setSleep] = useState<Awaited<ReturnType<typeof loadSleep>>>([])

  useEffect(() => {
    void Promise.all([loadTs(range.start, range.end), loadSleep(range.start, range.end)]).then(
      ([a, b]) => {
        setTs(a)
        setSleep(b)
      },
    )
  }, [range.start, range.end, dataRevision])

  const spanDays = (range.end - range.start) / 86400000
  const gran = timeseriesChartGranularity(spanDays)

  const o2 = bucketTimeseries(ts, range.start, range.end, gran, 'oxygen')
  const br = bucketTimeseries(ts, range.start, range.end, gran, 'breathing')

  const sleepChartResetKey = useMemo(
    () => `${range.start}-${range.end}-${dataRevision}-${sleep.length}`,
    [range.start, range.end, dataRevision, sleep.length],
  )

  return (
    <div className="page">
      <h2>Recovery</h2>
      <p className="muted">
        Sleep sessions, SpO₂, and breathing in the selected range. Charts use hourly buckets
        when the toolbar range is about a week or less (same as Activity).
      </p>
      {sleep.length === 0 && o2.length === 0 && br.length === 0 ? (
        <p className="muted">No recovery metrics in this range.</p>
      ) : (
        <>
          {sleep.length > 0 ? (
            <>
              <SleepTimelineChart
                sessions={sleep}
                rangeStart={range.start}
                rangeEnd={range.end}
                chartResetKey={sleepChartResetKey}
              />
              <SleepStageStackChart
                sessions={sleep}
                chartResetKey={sleepChartResetKey}
              />
            </>
          ) : null}
          <div className="table-wrap table-card">
            <h3>Sleep sessions</h3>
            {sleep.length === 0 ? (
              <p className="muted">No sleep in range.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Total (min)</th>
                    <th>Deep</th>
                    <th>Light</th>
                    <th>Awake</th>
                  </tr>
                </thead>
                <tbody>
                  {sleep.map((s) => (
                    <tr key={`${s.startTime}-${s.endTime}`}>
                      <td>{formatDateTime12(s.startTime)}</td>
                      <td>{formatDateTime12(s.endTime)}</td>
                      <td>{s.sleepMinutes}</td>
                      <td>{s.deepMinutes}</td>
                      <td>{s.lightMinutes}</td>
                      <td>{s.awakeMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="chart-wrap chart-card">
            <h3>SpO₂ (bucketed)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={o2.filter((d) => d.count > 0)}
                margin={LINE_CHART_MARGIN_WITH_BRUSH}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={[80, 100]} />
                <Tooltip separator="" />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name=""
                  stroke="var(--chart-o2)"
                  dot={false}
                />
                <ChartBrush />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrap chart-card">
            <h3>Breathing (bucketed avg)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={br.filter((d) => d.count > 0)}
                margin={LINE_CHART_MARGIN_WITH_BRUSH}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => Number(v).toFixed(1)} />
                <Tooltip
                  separator=""
                  formatter={(value) =>
                    value == null
                      ? ['—', '']
                      : [`${Number(value).toFixed(1)} / min`, '']
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name=""
                  stroke="var(--chart-br)"
                  dot={false}
                />
                <ChartBrush />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

async function loadTs(start: number, end: number) {
  const rows = await db.timeseries.toArray()
  return rows.filter(
    (r) =>
      r.timestamp >= start &&
      r.timestamp <= end &&
      (r.metricType === 'oxygen' || r.metricType === 'breathing'),
  )
}

async function loadSleep(start: number, end: number) {
  const rows = await db.sleepSessions.toArray()
  return rows.filter(
    (s) =>
      (s.startTime >= start && s.startTime <= end) ||
      (s.endTime >= start && s.endTime <= end) ||
      (s.startTime <= start && s.endTime >= end),
  )
}
