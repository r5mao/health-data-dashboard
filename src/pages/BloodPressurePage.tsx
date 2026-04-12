import { formatDateTime12 } from '@/time/formatDateTime12'
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
import { BpStage2ReferenceBands } from '@/charts/bloodPressureReference'
import { CHART_AXIS_TICK, CHART_Y_AXIS_WIDTH } from '@/charts/chartAxis'
import { formatTimeAxisTick } from '@/charts/formatTimeAxisTick'
import { LINE_CHART_MARGIN_WITH_BRUSH } from '@/charts/lineChartMargins'
import { useBrushTimeSpan } from '@/charts/useBrushTimeSpan'
import { ChartBrush } from '@/components/ChartBrush'
import { CollapsibleChartCard } from '@/components/CollapsibleChartCard'
import { db } from '@/db/schema'
import { bucketBloodPressureDaily } from '@/metrics/bucketing'
import { useDateRange } from '@/time/useDateRange'

/** Recharts defaults sort labels A–Z, which puts Diastolic above Systolic. */
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

  const bpBrushKey = `${range.start}-${range.end}-${rows.length}-${dataRevision}`
  const { visibleSpanMs, onBrushChange } = useBrushTimeSpan(series, bpBrushKey)

  const bpChartMargin = {
    ...LINE_CHART_MARGIN_WITH_BRUSH,
    top: 18,
    bottom: 72,
  } as const

  return (
    <div className="page">
      <h2>Blood pressure</h2>
      <p className="muted">
        Individual readings and daily averages in the selected range. Use the
        range bar under the readings chart to zoom into part of a day.
      </p>
      <details className="page-details">
        <summary className="page-details-summary">
          About the warning bands (Stage 2 hypertension)
        </summary>
        <p className="muted page-details-body">
          Stage 2 hypertension is commonly systolic ≥140 mmHg or diastolic ≥90
          mmHg. The amber band marks the 90–140 mmHg range on the shared axis
          (diastolic threshold); the red band marks ≥140 mmHg (systolic
          threshold). Reference only—not a diagnosis.
        </p>
      </details>
      {rows.length === 0 ? (
        <p className="muted">
          No readings in this range. Import CSV or widen the range.
        </p>
      ) : (
        <>
          <CollapsibleChartCard title="Readings">
            <ResponsiveContainer width="100%" height={380}>
              <LineChart
                key={`bp-readings-${range.start}-${range.end}-${rows.length}`}
                data={series}
                margin={bpChartMargin}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <BpStage2ReferenceBands />
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
          </CollapsibleChartCard>
          <CollapsibleChartCard title="Daily averages">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={daily.filter((d) => d.n > 0)}
                margin={{ top: 14, right: 18, bottom: 58, left: CHART_Y_AXIS_WIDTH + 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <BpStage2ReferenceBands />
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
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="diaAvg"
                  name="Diastolic"
                  stroke="var(--chart-dia)"
                  dot={false}
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
