import { formatDateTime12, formatTooltipDateTime } from '@/time/formatDateTime12'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_AXIS_TICK, CHART_Y_AXIS_WIDTH } from '@/charts/chartAxis'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { useChartDragZoom } from '@/charts/useChartDragZoom'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { db } from '@/db/schema'
import { bucketTimeseries, timeseriesChartGranularity } from '@/metrics/bucketing'
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

  const spanDays = (range.end - range.start) / 86400000
  const gran = timeseriesChartGranularity(spanDays)

  const steps = useMemo(
    () => bucketTimeseries(ts, range.start, range.end, gran, 'steps'),
    [ts, range.start, range.end, gran],
  )
  const cals = useMemo(
    () => bucketTimeseries(ts, range.start, range.end, gran, 'calories'),
    [ts, range.start, range.end, gran],
  )
  const hr = useMemo(
    () => bucketTimeseries(ts, range.start, range.end, gran, 'heart_rate'),
    [ts, range.start, range.end, gran],
  )

  const stepsData = useMemo(() => steps.filter((d) => d.count > 0), [steps])
  const calsData = useMemo(() => cals.filter((d) => d.count > 0), [cals])
  const hrData = useMemo(() => hr.filter((d) => d.count > 0), [hr])

  const chartResetKey = `${range.start}-${range.end}-${dataRevision}-${gran}-${ts.length}`

  const stepsZoom = useChartDragZoom(stepsData, chartResetKey)
  const calsZoom = useChartDragZoom(calsData, chartResetKey)
  const hrZoom = useChartDragZoom(hrData, chartResetKey)

  return (
    <div className="page">
      <h2>Activity</h2>
      <details className="page-details">
        <summary className="page-details-summary">How steps and chart zoom work</summary>
        <p className="muted page-details-body">
          Steps, calories, and heart rate use hourly buckets when the toolbar date range is
          about a week or less; wider ranges use day/week/month buckets. Use the 2d or 7d
          preset (or any short range) for hourly detail. Drag across a chart to zoom into a
          time window, or use the range bar underneath. The two zoom mechanisms are
          independent—drag zoom replaces the range bar while active.
        </p>
      </details>
      {steps.length === 0 && cals.length === 0 && hr.length === 0 && sport.length === 0 ? (
        <p className="muted">No activity data in this range.</p>
      ) : (
        <>
          <CollapsibleChartCard title="Steps (bucketed)">
            {stepsZoom.isZoomed && (
              <div className="zoom-reset-bar">
                <span className="zoom-reset-label">Zoomed in</span>
                <button
                  type="button"
                  className="btn secondary zoom-reset-btn"
                  onClick={stepsZoom.resetZoom}
                >
                  Reset zoom
                </button>
              </div>
            )}
            <div className="drag-zoom-chart">
              <ResponsiveContainer width="100%" height={340}>
                <BarChart
                  key={`steps-${chartResetKey}-${stepsData.length}`}
                  data={stepsZoom.zoomedData}
                  margin={LINE_CHART_MARGIN_WITH_BRUSH}
                  barCategoryGap="18%"
                  {...stepsZoom.chartHandlers}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="t"
                    domain={['dataMin', 'dataMax']}
                    tickCount={12}
                    minTickGap={6}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={10}
                    tickFormatter={(v) =>
                      formatTimeAxisTick(v as number, stepsZoom.visibleSpanMs)
                    }
                  />
                  <YAxis
                    width={CHART_Y_AXIS_WIDTH}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(_, payload) => {
                      const t = payload?.[0]?.payload?.t as number | undefined
                      return t != null ? formatTooltipDateTime(t) : ''
                    }}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Math.round(Number(value))}`, '']
                    }
                  />
                  <Bar dataKey="max" name="" fill="var(--chart-steps)" maxBarSize={36} />
                  {stepsZoom.selArea && (
                    <ReferenceArea
                      x1={stepsZoom.selArea.x1}
                      x2={stepsZoom.selArea.x2}
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      stroke="var(--accent)"
                      strokeOpacity={0.4}
                    />
                  )}

                </BarChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleChartCard>
          <CollapsibleChartCard title="Calories (bucketed avg)">
            {calsZoom.isZoomed && (
              <div className="zoom-reset-bar">
                <span className="zoom-reset-label">Zoomed in</span>
                <button
                  type="button"
                  className="btn secondary zoom-reset-btn"
                  onClick={calsZoom.resetZoom}
                >
                  Reset zoom
                </button>
              </div>
            )}
            <div className="drag-zoom-chart">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  key={`cals-${chartResetKey}-${calsData.length}`}
                  data={calsZoom.zoomedData}
                  margin={LINE_CHART_MARGIN_WITH_BRUSH}
                  {...calsZoom.chartHandlers}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="t"
                    domain={['dataMin', 'dataMax']}
                    tickCount={12}
                    minTickGap={6}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={10}
                    tickFormatter={(v) =>
                      formatTimeAxisTick(v as number, calsZoom.visibleSpanMs)
                    }
                  />
                  <YAxis
                    width={CHART_Y_AXIS_WIDTH}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(_, payload) => {
                      const t = payload?.[0]?.payload?.t as number | undefined
                      return t != null ? formatTooltipDateTime(t) : ''
                    }}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Number(value).toFixed(1)} bpm`, '']
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name=""
                    stroke="var(--chart-cal)"
                    dot={false}
                  />
                  {calsZoom.selArea && (
                    <ReferenceArea
                      x1={calsZoom.selArea.x1}
                      x2={calsZoom.selArea.x2}
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      stroke="var(--accent)"
                      strokeOpacity={0.4}
                    />
                  )}

                </LineChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleChartCard>
          <CollapsibleChartCard title="Heart rate (bucketed avg)">
            {hrZoom.isZoomed && (
              <div className="zoom-reset-bar">
                <span className="zoom-reset-label">Zoomed in</span>
                <button
                  type="button"
                  className="btn secondary zoom-reset-btn"
                  onClick={hrZoom.resetZoom}
                >
                  Reset zoom
                </button>
              </div>
            )}
            <div className="drag-zoom-chart">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  key={`hr-${chartResetKey}-${hrData.length}`}
                  data={hrZoom.zoomedData}
                  margin={LINE_CHART_MARGIN_WITH_BRUSH}
                  {...hrZoom.chartHandlers}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="t"
                    domain={['dataMin', 'dataMax']}
                    tickCount={12}
                    minTickGap={6}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={10}
                    tickFormatter={(v) =>
                      formatTimeAxisTick(v as number, hrZoom.visibleSpanMs)
                    }
                  />
                  <YAxis
                    width={CHART_Y_AXIS_WIDTH}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(_, payload) => {
                      const t = payload?.[0]?.payload?.t as number | undefined
                      return t != null ? formatTooltipDateTime(t) : ''
                    }}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Number(value).toFixed(1)}`, '']
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name=""
                    stroke="var(--chart-hr)"
                    dot={false}
                  />
                  {hrZoom.selArea && (
                    <ReferenceArea
                      x1={hrZoom.selArea.x1}
                      x2={hrZoom.selArea.x2}
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      stroke="var(--accent)"
                      strokeOpacity={0.4}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleChartCard>
          <CollapsibleChartCard title="Sport sessions" variant="table" defaultCollapsed>
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
                      <td>{formatDateTime12(s.measurementTime)}</td>
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
          </CollapsibleChartCard>
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
      (r.metricType === 'steps' ||
        r.metricType === 'calories' ||
        r.metricType === 'heart_rate'),
  )
}

async function loadSport(start: number, end: number) {
  const rows = await db.sportSessions.toArray()
  return rows.filter(
    (r) =>
      r.measurementTime >= start && r.measurementTime <= end,
  )
}
