import { formatDateTime12 } from '@/time/formatDateTime12'
import { useEffect, useState } from 'react'
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
import { useBrushTimeSpan } from '@/charts/useBrushTimeSpan'
import { ChartBrush } from '@/components/ChartBrush'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { db } from '@/db/schema'
import { bucketBloodPressureDaily } from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

function bpSeriesSortKey(dataKey: unknown): number {
  const k = String(dataKey ?? '')
  if (k === 'sys' || k === 'sysAvg') return 0
  if (k === 'dia' || k === 'diaAvg') return 1
  return 2
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

  useEffect(() => {
    void loadBp(range.start, range.end).then(setRows)
  }, [range.start, range.end, dataRevision])

  const daily = bucketBloodPressureDaily(rows, range.start, range.end)
  const series = rows.map((r) => ({
    t: r.timestamp,
    sys: r.systolic,
    dia: r.diastolic,
  }))

  const bpResetKey = `${range.start}-${range.end}-${rows.length}-${dataRevision}`
  const zoom = useChartDragZoom(series, bpResetKey)
  const brush = useBrushTimeSpan(series, bpResetKey)
  const visibleSpanMs = zoom.isZoomed ? zoom.visibleSpanMs : brush.visibleSpanMs

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
      {rows.length === 0 ? (
        <p className="muted">
          No readings in this range. Import CSV or widen the range.
        </p>
      ) : (
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
              <ResponsiveContainer width="100%" height={380}>
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
                    tick={{ ...CHART_AXIS_TICK }}
                    tickMargin={10}
                    tickFormatter={(v) =>
                      formatTimeAxisTick(v as number, visibleSpanMs)
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
                    labelFormatter={(v) => formatDateTime12(v as number)}
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
                  {!zoom.isZoomed && <ChartBrush onChange={brush.onBrushChange} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CollapsibleChartCard>
          <CollapsibleChartCard title="Daily averages">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={daily.filter((d) => d.n > 0)}
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
                  dataKey="label"
                  tick={{ ...CHART_AXIS_TICK }}
                  tickMargin={10}
                  interval="preserveStartEnd"
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
              </LineChart>
            </ResponsiveContainer>
          </CollapsibleChartCard>
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
