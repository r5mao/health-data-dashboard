import { formatDateTime12, formatTooltipDateTime } from '@/time/formatDateTime12'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CHART_AXIS_TICK, CHART_Y_AXIS_WIDTH } from '@/charts/chartAxis'
import { ChartLegendTopRight } from '@/charts/chartLegend'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { LINE_CHART_MARGIN_WITH_TOP_LEGEND } from '@/charts/lineChartMargins'
import { useChartDragZoom } from '@/charts/useChartDragZoom'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { SleepStageStackChart } from '@/components/SleepStageStackChart'
import { SleepTimelineChart } from '@/components/SleepTimelineChart'
import { db } from '@/db/schema'
import {
  bucketTimeseriesAdaptive,
  timeseriesChartGranularityFromMs,
} from '@/metrics/bucketing'
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

  const baseGran = timeseriesChartGranularityFromMs(range.end - range.start)

  const o2 = bucketTimeseriesAdaptive(ts, range.start, range.end, 'oxygen')
  const br = bucketTimeseriesAdaptive(ts, range.start, range.end, 'breathing')
  const hr = bucketTimeseriesAdaptive(ts, range.start, range.end, 'heart_rate')

  const o2Data = useMemo(() => o2.filter((d) => d.count > 0), [o2])
  const brData = useMemo(() => br.filter((d) => d.count > 0), [br])
  const hrData = useMemo(() => hr.filter((d) => d.count > 0), [hr])

  const sleepChartResetKey = useMemo(
    () => `${range.start}-${range.end}-${dataRevision}-${sleep.length}`,
    [range.start, range.end, dataRevision, sleep.length],
  )
  const chartResetKey = `${range.start}-${range.end}-${dataRevision}-${baseGran}-${ts.length}`

  const o2Zoom = useChartDragZoom(o2Data, chartResetKey)
  const brZoom = useChartDragZoom(brData, chartResetKey)
  const hrZoom = useChartDragZoom(hrData, chartResetKey)
  const o2PlotData = useMemo(
    () =>
      bucketTimeseriesAdaptive(ts, range.start, range.end, 'oxygen', o2Zoom.zoomDomain).filter(
        (d) => d.count > 0,
      ),
    [ts, range.start, range.end, o2Zoom.zoomDomain],
  )
  const brPlotData = useMemo(
    () =>
      bucketTimeseriesAdaptive(ts, range.start, range.end, 'breathing', brZoom.zoomDomain).filter(
        (d) => d.count > 0,
      ),
    [ts, range.start, range.end, brZoom.zoomDomain],
  )
  const hrPlotData = useMemo(
    () =>
      bucketTimeseriesAdaptive(
        ts,
        range.start,
        range.end,
        'heart_rate',
        hrZoom.zoomDomain,
      ).filter((d) => d.count > 0),
    [ts, range.start, range.end, hrZoom.zoomDomain],
  )

  return (
    <div className="page">
      <h2>Recovery</h2>
      <p className="muted">
        Sleep sessions, SpO₂, breathing, and heart rate in the selected range. Drag across
        a chart to zoom, or use the toolbar to change the date window.
      </p>
      {sleep.length === 0 && o2.length === 0 && br.length === 0 && hr.length === 0 ? (
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
          <CollapsibleChartCard title="Sleep sessions" variant="table" defaultCollapsed>
            {sleep.length === 0 ? (
              <p className="muted">No sleep in range.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Start</th>
                    <th>End</th>
                    <th>Total (min)</th>
                    <th>Awake</th>
                    <th>Light</th>
                    <th>Deep</th>
                  </tr>
                </thead>
                <tbody>
                  {sleep.map((s) => (
                    <tr key={`${s.startTime}-${s.endTime}`}>
                      <td>{formatDateTime12(s.startTime)}</td>
                      <td>{formatDateTime12(s.endTime)}</td>
                      <td>{s.sleepMinutes}</td>
                      <td>{s.awakeMinutes}</td>
                      <td>{s.lightMinutes}</td>
                      <td>{s.deepMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CollapsibleChartCard>
          <CollapsibleChartCard title="SpO₂ (bucketed)">
            {o2Zoom.isZoomed && (
              <div className="zoom-reset-bar">
                <span className="zoom-reset-label">Zoomed in</span>
                <button
                  type="button"
                  className="btn secondary zoom-reset-btn"
                  onClick={o2Zoom.resetZoom}
                >
                  Reset zoom
                </button>
              </div>
            )}
            <div className="drag-zoom-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={o2PlotData}
                  margin={LINE_CHART_MARGIN_WITH_TOP_LEGEND}
                  {...o2Zoom.chartHandlers}
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
                      formatTimeAxisTick(v as number, o2Zoom.visibleSpanMs)
                    }
                  />
                  <YAxis
                    domain={[80, 100]}
                    width={CHART_Y_AXIS_WIDTH}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                    tickFormatter={(v) => Number(v).toFixed(1)}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(v) => formatTooltipDateTime(Number(v))}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Number(value).toFixed(1)}%`, '']
                    }
                  />
                  <ChartLegendTopRight />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="SpO₂"
                    stroke="var(--chart-o2)"
                    dot={false}
                  />
                  {o2Zoom.selArea && (
                    <ReferenceArea
                      x1={o2Zoom.selArea.x1}
                      x2={o2Zoom.selArea.x2}
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
          <CollapsibleChartCard title="Breathing (bucketed avg)">
            {brZoom.isZoomed && (
              <div className="zoom-reset-bar">
                <span className="zoom-reset-label">Zoomed in</span>
                <button
                  type="button"
                  className="btn secondary zoom-reset-btn"
                  onClick={brZoom.resetZoom}
                >
                  Reset zoom
                </button>
              </div>
            )}
            <div className="drag-zoom-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={brPlotData}
                  margin={LINE_CHART_MARGIN_WITH_TOP_LEGEND}
                  {...brZoom.chartHandlers}
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
                      formatTimeAxisTick(v as number, brZoom.visibleSpanMs)
                    }
                  />
                  <YAxis
                    width={CHART_Y_AXIS_WIDTH + 4}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                    tickFormatter={(v) => Number(v).toFixed(1)}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(v) => formatTooltipDateTime(Number(v))}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Number(value).toFixed(1)} / min`, '']
                    }
                  />
                  <ChartLegendTopRight />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Breathing"
                    stroke="var(--chart-br)"
                    dot={false}
                  />
                  {brZoom.selArea && (
                    <ReferenceArea
                      x1={brZoom.selArea.x1}
                      x2={brZoom.selArea.x2}
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
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hrPlotData}
                  margin={LINE_CHART_MARGIN_WITH_TOP_LEGEND}
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
                    width={CHART_Y_AXIS_WIDTH + 4}
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={8}
                    tickFormatter={(v) => Number(v).toFixed(1)}
                  />
                  <Tooltip
                    separator=""
                    labelFormatter={(v) => formatTooltipDateTime(Number(v))}
                    formatter={(value) =>
                      value == null
                        ? ['—', '']
                        : [`${Number(value).toFixed(1)} bpm`, '']
                    }
                  />
                  <ChartLegendTopRight />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Heart rate"
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
      (r.metricType === 'oxygen' ||
        r.metricType === 'breathing' ||
        r.metricType === 'heart_rate'),
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
