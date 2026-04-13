import { format, startOfDay } from 'date-fns'
import { formatDateTime12 } from '@/time/formatDateTime12'
import { useEffect, useState, type ReactNode } from 'react'
import { db } from '@/db/schema'
import {
  bloodPressureAvgLast7Days,
  latestBloodPressure,
  latestDailyStepsSummary,
  latestTimeseriesMetric,
  latestWeight,
} from '@/metrics/aggregates'
import type { MetricType } from '@/types/metric'

export function Overview({ dataRevision }: { dataRevision: number }) {
  const [bp, setBp] = useState<Awaited<
    ReturnType<typeof latestBloodPressure>
  > | null>(null)
  const [bp7, setBp7] = useState<Awaited<
    ReturnType<typeof bloodPressureAvgLast7Days>
  > | null>(null)
  const [hr, setHr] = useState<Awaited<
    ReturnType<typeof latestTimeseriesMetric>
  > | null>(null)
  const [spo2, setSpo2] = useState<Awaited<
    ReturnType<typeof latestTimeseriesMetric>
  > | null>(null)
  const [breath, setBreath] = useState<Awaited<
    ReturnType<typeof latestTimeseriesMetric>
  > | null>(null)
  const [steps, setSteps] = useState<Awaited<
    ReturnType<typeof latestDailyStepsSummary>
  > | null>(null)
  const [weight, setWeight] = useState<Awaited<
    ReturnType<typeof latestWeight>
  > | null>(null)
  const [hrTrend, setHrTrend] = useState<number[]>([])
  const [spo2Trend, setSpo2Trend] = useState<number[]>([])
  const [breathTrend, setBreathTrend] = useState<number[]>([])
  const [stepsTrend, setStepsTrend] = useState<number[]>([])
  const [weightTrend, setWeightTrend] = useState<number[]>([])

  useEffect(() => {
    void (async () => {
      const [
        lbp,
        avg7,
        lhr,
        lox,
        lbr,
        st,
        w,
        hrSeries,
        oxygenSeries,
        breathingSeries,
        stepSeries,
        weightSeries,
      ] = await Promise.all([
        latestBloodPressure(),
        bloodPressureAvgLast7Days(),
        latestTimeseriesMetric('heart_rate'),
        latestTimeseriesMetric('oxygen'),
        latestTimeseriesMetric('breathing'),
        latestDailyStepsSummary(),
        latestWeight(),
        loadMetricTrend('heart_rate', 14),
        loadMetricTrend('oxygen', 14),
        loadMetricTrend('breathing', 14),
        loadRecentDailyStepMaxima(7),
        loadRecentWeightTrend(10),
      ])
      setBp(lbp)
      setBp7(avg7)
      setHr(lhr)
      setSpo2(lox)
      setBreath(lbr)
      setSteps(st)
      setWeight(w)
      setHrTrend(hrSeries)
      setSpo2Trend(oxygenSeries)
      setBreathTrend(breathingSeries)
      setStepsTrend(stepSeries)
      setWeightTrend(weightSeries)
    })()
  }, [dataRevision])

  return (
    <div className="page">
      <h2>Overview</h2>
      <p className="muted">
        KPIs use the latest stored readings. Blood pressure average is rolling 7
        days (fixed window), not the selected chart range.
      </p>
      <div className="kpi-grid">
        <Kpi
          title="Latest blood pressure"
          value={
            bp
              ? `${bp.systolic}/${bp.diastolic} mmHg · pulse ${bp.pulse}`
              : '—'
          }
          sub={bp ? formatDateTime12(bp.timestamp) : undefined}
          visual={
            bp ? (
              <div className="kpi-gauge-row">
                <MiniGauge
                  label="Systolic"
                  value={bp.systolic}
                  min={80}
                  max={180}
                  segments={[
                    { upto: 120, color: '#16a34a' },
                    { upto: 130, color: '#eab308' },
                    { upto: 140, color: '#f97316' },
                    { upto: 180, color: '#dc2626' },
                  ]}
                  valueSuffix=""
                />
                <MiniGauge
                  label="Diastolic"
                  value={bp.diastolic}
                  min={50}
                  max={120}
                  segments={[
                    { upto: 80, color: '#16a34a' },
                    { upto: 90, color: '#eab308' },
                    { upto: 100, color: '#f97316' },
                    { upto: 120, color: '#dc2626' },
                  ]}
                  valueSuffix=""
                />
              </div>
            ) : null
          }
        />
        <Kpi
          title="7-day BP average"
          value={
            bp7
              ? `${bp7.systolic}/${bp7.diastolic} · pulse ${bp7.pulse}`
              : '—'
          }
          visual={
            bp7 ? (
              <div className="kpi-gauge-row">
                <MiniGauge
                  label="Avg sys"
                  value={bp7.systolic}
                  min={80}
                  max={180}
                  segments={[
                    { upto: 120, color: '#16a34a' },
                    { upto: 130, color: '#eab308' },
                    { upto: 140, color: '#f97316' },
                    { upto: 180, color: '#dc2626' },
                  ]}
                  valueSuffix=""
                />
                <MiniGauge
                  label="Avg dia"
                  value={bp7.diastolic}
                  min={50}
                  max={120}
                  segments={[
                    { upto: 80, color: '#16a34a' },
                    { upto: 90, color: '#eab308' },
                    { upto: 100, color: '#f97316' },
                    { upto: 120, color: '#dc2626' },
                  ]}
                  valueSuffix=""
                />
              </div>
            ) : null
          }
        />
        <Kpi
          title="Latest heart rate"
          value={hr ? `${Math.round(hr.value)} bpm` : '—'}
          sub={hr ? formatDateTime12(hr.timestamp) : undefined}
          visual={<MiniSparkline values={hrTrend} color="var(--chart-sys)" />}
        />
        <Kpi
          title="Latest SpO₂"
          value={spo2 ? `${Number(spo2.value).toFixed(1)}%` : '—'}
          sub={spo2 ? formatDateTime12(spo2.timestamp) : undefined}
          visual={
            spo2 ? (
              <MiniGauge
                label="Oxygen"
                value={spo2.value}
                min={85}
                max={100}
                segments={[
                  { upto: 92, color: '#dc2626' },
                  { upto: 95, color: '#f97316' },
                  { upto: 100, color: '#16a34a' },
                ]}
                valueSuffix="%"
              />
            ) : (
              <MiniSparkline values={spo2Trend} color="var(--chart-o2)" />
            )
          }
        />
        <Kpi
          title="Latest breathing rate"
          value={breath ? `${breath.value.toFixed(1)} / min` : '—'}
          sub={breath ? formatDateTime12(breath.timestamp) : undefined}
          visual={<MiniSparkline values={breathTrend} color="var(--chart-br)" />}
        />
        <Kpi
          title="Latest daily steps (max that day)"
          value={steps ? `${Math.round(steps.value)} steps` : '—'}
          sub={steps ? format(steps.dayStart, 'PP') : undefined}
          visual={<MiniColumnChart values={stepsTrend} color="var(--chart-steps)" />}
        />
        <Kpi
          title="Latest weight"
          value={weight ? `${weight.weightKg.toFixed(1)} kg` : '—'}
          sub={weight ? formatDateTime12(weight.timestamp) : undefined}
          visual={<MiniSparkline values={weightTrend} color="var(--chart-dia)" />}
        />
      </div>
    </div>
  )
}

function Kpi({
  title,
  value,
  sub,
  visual,
}: {
  title: string
  value: string
  sub?: string
  visual?: ReactNode
}) {
  return (
    <div className="kpi">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-visual">{visual ?? <div className="kpi-visual-empty" />}</div>
      {sub && <div className="kpi-sub muted">{sub}</div>}
    </div>
  )
}

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return <div className="kpi-visual-empty" />
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = 4
  const width = 116
  const height = 40
  const range = max - min || 1
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2)
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return { x, y }
  })
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(2)} ${(height - pad).toFixed(2)} L${points[0].x.toFixed(2)} ${(height - pad).toFixed(2)} Z`
  const last = points[points.length - 1]

  return (
    <svg
      className="kpi-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Recent trend"
    >
      <path d={areaPath} fill={color} opacity={0.18} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r={2.8} fill={color} />
    </svg>
  )
}

function MiniColumnChart({ values, color }: { values: number[]; color: string }) {
  if (values.length === 0) return <div className="kpi-visual-empty" />
  const width = 120
  const height = 58
  const padLeft = 6
  const padRight = 4
  const padTop = 5
  const padBottom = 9
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom
  const max = Math.max(...values, 1)
  const gap = 3
  const barW = Math.max(4, (plotW - gap * (values.length - 1)) / values.length)

  return (
    <svg
      className="kpi-column-chart"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Recent daily steps column chart"
    >
      <line
        x1={padLeft}
        y1={height - padBottom}
        x2={width - padRight}
        y2={height - padBottom}
        stroke="color-mix(in srgb, var(--border) 80%, transparent)"
        strokeWidth={1}
      />
      {values.map((v, idx) => {
        const h = Math.max(3, (v / max) * plotH)
        const x = padLeft + idx * (barW + gap)
        const y = height - padBottom - h
        return (
          <rect
            key={idx}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={2}
            fill={color}
            opacity={0.9}
          />
        )
      })}
    </svg>
  )
}

function MiniGauge({
  label,
  value,
  min,
  max,
  segments,
  valueSuffix,
}: {
  label: string
  value: number
  min: number
  max: number
  segments: Array<{ upto: number; color: string }>
  valueSuffix: string
}) {
  const clamped = Math.min(Math.max(value, min), max)
  const ratio = (clamped - min) / Math.max(1, max - min)
  const needleAngle = -130 + ratio * 260
  const centerX = 60
  const centerY = 56
  const radius = 40
  const start = -130
  const segmentArcs: Array<{ startAngle: number; endAngle: number; color: string }> = []
  let current = min
  for (const segment of segments) {
    const segEnd = Math.min(segment.upto, max)
    if (segEnd > current) {
      const startAngle = start + ((current - min) / (max - min)) * 260
      const endAngle = start + ((segEnd - min) / (max - min)) * 260
      segmentArcs.push({ startAngle, endAngle, color: segment.color })
      current = segEnd
    }
  }

  return (
    <div className="kpi-mini-gauge">
      <svg width={120} height={72} viewBox="0 0 120 72" role="img" aria-label={label}>
        {segmentArcs.map((arc, idx) => (
          <path
            key={idx}
            d={describeArc(centerX, centerY, radius, arc.startAngle, arc.endAngle)}
            fill="none"
            stroke={arc.color}
            strokeWidth={8}
            strokeLinecap="round"
          />
        ))}
        <line
          x1={centerX}
          y1={centerY}
          x2={centerX + Math.cos((needleAngle * Math.PI) / 180) * 28}
          y2={centerY + Math.sin((needleAngle * Math.PI) / 180) * 28}
          stroke="var(--text-h)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={centerX} cy={centerY} r={3.2} fill="var(--text-h)" />
      </svg>
      <div className="kpi-mini-gauge-label">{label}</div>
      <div className="kpi-mini-gauge-value">
        {Math.round(value)}
        {valueSuffix}
      </div>
    </div>
  )
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const start = polarToCartesian(cx, cy, radius, endAngleDeg)
  const end = polarToCartesian(cx, cy, radius, startAngleDeg)
  const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const radians = (angleDeg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  }
}

async function loadMetricTrend(metricType: MetricType, limit: number): Promise<number[]> {
  const rows = await db.timeseries.where('metricType').equals(metricType).sortBy('timestamp')
  return rows.slice(-limit).map((r) => r.value)
}

async function loadRecentDailyStepMaxima(days: number): Promise<number[]> {
  const rows = await db.timeseries.where('metricType').equals('steps').toArray()
  if (rows.length === 0) return []
  const byDay = new Map<number, number>()
  for (const row of rows) {
    const day = startOfDay(row.timestamp).getTime()
    const prev = byDay.get(day)
    if (prev == null || row.value > prev) byDay.set(day, row.value)
  }
  return [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-days)
    .map((entry) => entry[1])
}

async function loadRecentWeightTrend(limit: number): Promise<number[]> {
  const rows = await db.weightMeasurements.orderBy('timestamp').toArray()
  return rows.slice(-limit).map((r) => r.weightKg)
}
