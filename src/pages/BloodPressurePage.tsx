import { formatTooltipDateTime } from '@/time/formatDateTime12'
import { useEffect, useMemo, useState } from 'react'
import {
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
import { BpThresholdReferenceLines } from '@/charts/bloodPressureReference'
import { CHART_AXIS_TICK, CHART_Y_AXIS_WIDTH } from '@/charts/chartAxis'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { useChartDragZoom } from '@/charts/useChartDragZoom'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { db } from '@/db/schema'
import {
  bloodPressureHourOfDayAverages,
  bucketBloodPressureDaily,
  bucketTimeseriesAdaptive,
  timeseriesChartGranularityFromMs,
} from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

function bpSeriesSortKey(dataKey: unknown): number {
  const k = String(dataKey ?? '')
  if (k === 'sys' || k === 'sysAvg') return 0
  if (k === 'dia' || k === 'diaAvg') return 1
  return 2
}

/** Clock hour 0–23 → short label (12a, 3p, …). */
function formatBpHourTick(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24
  if (h === 0) return '12a'
  if (h < 12) return `${h}a`
  if (h === 12) return '12p'
  return `${h - 12}p`
}

/** Tooltip: hour slot as "12a–1a". */
function formatBpHourRangeLabel(hour: number): string {
  const h = ((Math.floor(hour) % 24) + 24) % 24
  return `${formatBpHourTick(h)}–${formatBpHourTick(h + 1)}`
}

function BloodPressureLegend() {
  return (
    <Legend
      verticalAlign="bottom"
      align="center"
      layout="vertical"
      wrapperStyle={{ paddingTop: 6 }}
      itemSorter={(item) => bpSeriesSortKey(item.dataKey)}
    />
  )
}

export function BloodPressurePage({
  dataRevision,
}: {
  dataRevision: number
}) {
  const { range } = useDateRange()
  const [rows, setRows] = useState<
    Awaited<ReturnType<typeof loadBp>>
  >([])
  const [hrRows, setHrRows] = useState<Awaited<ReturnType<typeof loadHeartRate>>>([])
  const [pressureRows, setPressureRows] = useState<Awaited<ReturnType<typeof loadPressure>>>([])

  useEffect(() => {
    void Promise.all([
      loadBp(range.start, range.end),
      loadHeartRate(range.start, range.end),
      loadPressure(range.start, range.end),
    ]).then(([bp, hr, pressure]) => {
        setRows(bp)
        setHrRows(hr)
        setPressureRows(pressure)
      })
  }, [range.start, range.end, dataRevision])

  const baseGran = timeseriesChartGranularityFromMs(range.end - range.start)
  const daily = bucketBloodPressureDaily(rows, range.start, range.end)
  const dailyData = daily.filter((d) => d.n > 0)
  const hourOfDayData = useMemo(() => bloodPressureHourOfDayAverages(rows), [rows])
  const hr = useMemo(
    () => bucketTimeseriesAdaptive(hrRows, range.start, range.end, 'heart_rate'),
    [hrRows, range.start, range.end],
  )
  const pressure = useMemo(
    () => bucketTimeseriesAdaptive(pressureRows, range.start, range.end, 'pressure'),
    [pressureRows, range.start, range.end],
  )
  const hrData = useMemo(() => hr.filter((d) => d.count > 0), [hr])
  const pressureData = useMemo(() => pressure.filter((d) => d.count > 0), [pressure])
  const series = rows.map((r) => ({
    t: r.timestamp,
    sys: r.systolic,
    dia: r.diastolic,
  }))

  const bpResetKey = `${range.start}-${range.end}-${rows.length}-${hrData.length}-${pressureData.length}-${baseGran}-${dataRevision}`
  const zoom = useChartDragZoom(series, bpResetKey)

  const dailyZoom = useChartDragZoom(dailyData, bpResetKey)
  const hrZoom = useChartDragZoom(hrData, bpResetKey)
  const pressureZoom = useChartDragZoom(pressureData, bpResetKey)
  const hrPlotData = useMemo(
    () =>
      bucketTimeseriesAdaptive(
        hrRows,
        range.start,
        range.end,
        'heart_rate',
        hrZoom.zoomDomain,
      ).filter((d) => d.count > 0),
    [hrRows, range.start, range.end, hrZoom.zoomDomain],
  )
  const pressurePlotData = useMemo(
    () =>
      bucketTimeseriesAdaptive(
        pressureRows,
        range.start,
        range.end,
        'pressure',
        pressureZoom.zoomDomain,
      ).filter((d) => d.count > 0),
    [pressureRows, range.start, range.end, pressureZoom.zoomDomain],
  )

  const bpChartMargin = {
    ...LINE_CHART_MARGIN_WITH_BRUSH,
    top: 18,
    bottom: 72,
    right: 168,
  } as const

  return (
    <div className="page">
      <h2>Blood pressure</h2>
      <p className="muted">
        Individual readings and daily averages in the selected range. Drag
        across the readings chart to zoom, or use the range bar underneath.
      </p>
      <details className="page-details">
        <summary className="page-details-summary">
          About the threshold lines
        </summary>
        <p className="muted page-details-body">
          Faint dotted lines mark common reference levels; labels on the right
          of the chart name each line (Stage 2 vs severe, diastolic vs
          systolic). Not medical advice—use your clinician's targets.
        </p>
      </details>
      {rows.length === 0 && hrData.length === 0 && pressureData.length === 0 ? (
        <p className="muted">
          No blood pressure, heart-rate, or pressure-index readings in this range.
          Import CSV or widen the range.
        </p>
      ) : (
        <>
          {rows.length > 0 ? (
            <>
              <CollapsibleChartCard title="Readings">
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
                  <ResponsiveContainer width="100%" height={480}>
                    <LineChart
                      key={`bp-readings-${range.start}-${range.end}-${rows.length}`}
                      data={zoom.zoomedData}
                      margin={bpChartMargin}
                      {...zoom.chartHandlers}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <BpThresholdReferenceLines />
                      <XAxis
                        type="number"
                        dataKey="t"
                        domain={['dataMin', 'dataMax']}
                        tickCount={12}
                        minTickGap={6}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={10}
                        tickFormatter={(v) =>
                          formatTimeAxisTick(v as number, zoom.visibleSpanMs)
                        }
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        unit=" mmHg"
                        width={CHART_Y_AXIS_WIDTH + 8}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={8}
                      />
                      <Tooltip
                        separator=""
                        labelFormatter={(v) => formatTooltipDateTime(v as number)}
                        formatter={(value) =>
                          value == null
                            ? ['—', '']
                            : [`${Math.round(Number(value))} mmHg`, '']
                        }
                        itemSorter={(item) => bpSeriesSortKey(item.dataKey)}
                      />
                      <BloodPressureLegend />
                      <Line
                        type="monotone"
                        dataKey="sys"
                        name="Systolic"
                        stroke="var(--chart-sys)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive={false}
                        zIndex={500}
                      />
                      <Line
                        type="monotone"
                        dataKey="dia"
                        name="Diastolic"
                        stroke="var(--chart-dia)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        isAnimationActive={false}
                        zIndex={500}
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
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CollapsibleChartCard>
              <CollapsibleChartCard title="Daily averages">
                {dailyZoom.isZoomed && (
                  <div className="zoom-reset-bar">
                    <span className="zoom-reset-label">Zoomed in</span>
                    <button
                      type="button"
                      className="btn secondary zoom-reset-btn"
                      onClick={dailyZoom.resetZoom}
                    >
                      Reset zoom
                    </button>
                  </div>
                )}
                <div className="drag-zoom-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={dailyZoom.zoomedData}
                      margin={{
                        top: 14,
                        right: 148,
                        bottom: 58,
                        left: CHART_Y_AXIS_WIDTH + 12,
                      }}
                      {...dailyZoom.chartHandlers}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <BpThresholdReferenceLines />
                      <XAxis
                        type="number"
                        dataKey="t"
                        domain={['dataMin', 'dataMax']}
                        tickCount={12}
                        minTickGap={6}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={10}
                        tickFormatter={(v) =>
                          formatTimeAxisTick(v as number, dailyZoom.visibleSpanMs)
                        }
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        width={CHART_Y_AXIS_WIDTH + 8}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={8}
                        unit=" mmHg"
                      />
                      <Tooltip
                        separator=""
                        labelFormatter={(v) => formatTooltipDateTime(Number(v))}
                        formatter={(value) =>
                          value == null
                            ? ['—', '']
                            : [`${Number(value).toFixed(1)} mmHg`, '']
                        }
                        itemSorter={(item) => bpSeriesSortKey(item.dataKey)}
                      />
                      <BloodPressureLegend />
                      <Line
                        type="monotone"
                        dataKey="sysAvg"
                        name="Systolic"
                        stroke="var(--chart-sys)"
                        strokeWidth={2}
                        dot={false}
                        zIndex={500}
                      />
                      <Line
                        type="monotone"
                        dataKey="diaAvg"
                        name="Diastolic"
                        stroke="var(--chart-dia)"
                        strokeWidth={2}
                        dot={false}
                        zIndex={500}
                      />
                      {dailyZoom.selArea && (
                        <ReferenceArea
                          x1={dailyZoom.selArea.x1}
                          x2={dailyZoom.selArea.x2}
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
              <CollapsibleChartCard title="Average by hour of day">
                <p className="muted" style={{ marginBottom: 10, fontSize: 14 }}>
                  X-axis is one day (12a → 11p, local time). For each hour, the mean of all
                  systolic and diastolic readings in that hour across the selected range.
                  Purple systolic, blue diastolic—same as Readings. Hours with no data show a
                  gap.
                </p>
                <div className="drag-zoom-chart">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={hourOfDayData}
                      margin={{
                        top: 14,
                        right: 148,
                        bottom: 58,
                        left: CHART_Y_AXIS_WIDTH + 12,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <BpThresholdReferenceLines />
                      <XAxis
                        type="number"
                        dataKey="hour"
                        domain={[-0.5, 23.5]}
                        ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={10}
                        tickFormatter={(v) => formatBpHourTick(Number(v))}
                        label={{
                          value: 'Time of day (local)',
                          position: 'insideBottom',
                          offset: -4,
                          style: { fill: 'var(--text)', fontSize: 11 },
                        }}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        width={CHART_Y_AXIS_WIDTH + 8}
                        tick={{ ...CHART_AXIS_TICK }}
                        tickMargin={8}
                        unit=" mmHg"
                      />
                      <Tooltip
                        separator=""
                        labelFormatter={(v) => formatBpHourRangeLabel(Number(v))}
                        formatter={(value) =>
                          value == null
                            ? ['—', '']
                            : [`${Number(value).toFixed(1)} mmHg`, '']
                        }
                        itemSorter={(item) => bpSeriesSortKey(item.dataKey)}
                      />
                      <BloodPressureLegend />
                      <Line
                        type="monotone"
                        dataKey="sys"
                        name="Systolic"
                        stroke="var(--chart-sys)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                        isAnimationActive={false}
                        zIndex={500}
                      />
                      <Line
                        type="monotone"
                        dataKey="dia"
                        name="Diastolic"
                        stroke="var(--chart-dia)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls={false}
                        isAnimationActive={false}
                        zIndex={500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CollapsibleChartCard>
            </>
          ) : (
            <p className="muted">No blood pressure readings in this range.</p>
          )}
          {hrData.length > 0 ? (
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
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart
                    key={`bp-hr-${bpResetKey}-${hrData.length}`}
                    data={hrPlotData}
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
                          : [`${Number(value).toFixed(1)} bpm`, '']
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
          ) : (
            <p className="muted">No heart rate readings in this range.</p>
          )}
          {pressureData.length > 0 ? (
            <CollapsibleChartCard title="Pressure index (bucketed avg)">
              {pressureZoom.isZoomed && (
                <div className="zoom-reset-bar">
                  <span className="zoom-reset-label">Zoomed in</span>
                  <button
                    type="button"
                    className="btn secondary zoom-reset-btn"
                    onClick={pressureZoom.resetZoom}
                  >
                    Reset zoom
                  </button>
                </div>
              )}
              <div className="drag-zoom-chart">
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart
                    key={`bp-pressure-${bpResetKey}-${pressureData.length}`}
                    data={pressurePlotData}
                    margin={LINE_CHART_MARGIN_WITH_BRUSH}
                    {...pressureZoom.chartHandlers}
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
                        formatTimeAxisTick(v as number, pressureZoom.visibleSpanMs)
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
                          : [`${Number(value).toFixed(1)} index`, '']
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avg"
                      name=""
                      stroke="var(--chart-pressure)"
                      dot={false}
                    />
                    {pressureZoom.selArea && (
                      <ReferenceArea
                        x1={pressureZoom.selArea.x1}
                        x2={pressureZoom.selArea.x2}
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
          ) : (
            <p className="muted">No pressure-index readings in this range.</p>
          )}
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

async function loadHeartRate(start: number, end: number) {
  const rows = await db.timeseries.where('metricType').equals('heart_rate').toArray()
  return rows.filter((r) => r.timestamp >= start && r.timestamp <= end)
}

async function loadPressure(start: number, end: number) {
  const rows = await db.timeseries.where('metricType').equals('pressure').toArray()
  return rows.filter((r) => r.timestamp >= start && r.timestamp <= end)
}
