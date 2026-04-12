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
import { db } from '@/db/schema'
import { bucketTimeseries } from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

export function ActivityPage({
  dataRevision,
}: {
  dataRevision: number
}) {
  const { range } = useDateRange()
  const [ts, setTs] = useState<Awaited<ReturnType<typeof loadTs>>>([])
  const [sport, setSport] = useState<Awaited<ReturnType<typeof loadSport>>>([])

  useEffect(() => {
    void Promise.all([loadTs(range.start, range.end), loadSport(range.start, range.end)]).then(
      ([a, b]) => {
        setTs(a)
        setSport(b)
      },
    )
  }, [range.start, range.end, dataRevision])

  const spanDays = (range.end - range.start) / (86400000)
  const gran =
    spanDays <= 2 ? 'hour' : spanDays <= 60 ? 'day' : spanDays <= 400 ? 'week' : 'month'

  const steps = bucketTimeseries(ts, range.start, range.end, gran, 'steps')
  const cals = bucketTimeseries(ts, range.start, range.end, gran, 'calories')

  return (
    <div className="page">
      <h2>Activity</h2>
      <p className="muted">
        Steps and calories are bucketed for readability. Steps use raw samples in range;
        daily semantics follow max-per-day for totals elsewhere.
      </p>
      {steps.length === 0 && cals.length === 0 && sport.length === 0 ? (
        <p className="muted">No activity data in this range.</p>
      ) : (
        <>
          <div className="chart-wrap">
            <h3>Steps (bucketed)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={steps.filter((d) => d.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="max"
                  name="Max in bucket"
                  stroke="var(--chart-steps)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-wrap">
            <h3>Calories (bucketed avg)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cals.filter((d) => d.count > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Avg kcal"
                  stroke="var(--chart-cal)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="table-wrap">
            <h3>Sport sessions</h3>
            {sport.length === 0 ? (
              <p className="muted">No sport sessions in range.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Duration (min)</th>
                    <th>Distance (m)</th>
                    <th>kcal</th>
                    <th>Steps</th>
                  </tr>
                </thead>
                <tbody>
                  {sport.map((s, i) => (
                    <tr key={`${s.measurementTime}-${s.sportType}-${i}`}>
                      <td>{format(s.measurementTime, 'PPpp')}</td>
                      <td>{s.sportType}</td>
                      <td>{s.durationMinutes}</td>
                      <td>{s.distanceM}</td>
                      <td>{s.caloriesKcal}</td>
                      <td>{s.steps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
      (r.metricType === 'steps' || r.metricType === 'calories'),
  )
}

async function loadSport(start: number, end: number) {
  const rows = await db.sportSessions.toArray()
  return rows.filter(
    (r) =>
      r.measurementTime >= start && r.measurementTime <= end,
  )
}
