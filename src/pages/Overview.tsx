import { format } from 'date-fns'
import { formatDateTime12 } from '@/time/formatDateTime12'
import { useEffect, useState } from 'react'
import {
  bloodPressureAvgLast7Days,
  latestBloodPressure,
  latestDailyStepsSummary,
  latestTimeseriesMetric,
  latestWeight,
} from '@/metrics/aggregates'

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
      ] = await Promise.all([
        latestBloodPressure(),
        bloodPressureAvgLast7Days(),
        latestTimeseriesMetric('heart_rate'),
        latestTimeseriesMetric('oxygen'),
        latestTimeseriesMetric('breathing'),
        latestDailyStepsSummary(),
        latestWeight(),
      ])
      setBp(lbp)
      setBp7(avg7)
      setHr(lhr)
      setSpo2(lox)
      setBreath(lbr)
      setSteps(st)
      setWeight(w)
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
        />
        <Kpi
          title="7-day BP average"
          value={
            bp7
              ? `${bp7.systolic}/${bp7.diastolic} · pulse ${bp7.pulse}`
              : '—'
          }
        />
        <Kpi
          title="Latest heart rate"
          value={hr ? `${Math.round(hr.value)} bpm` : '—'}
          sub={hr ? formatDateTime12(hr.timestamp) : undefined}
        />
        <Kpi
          title="Latest SpO₂"
          value={spo2 ? `${Number(spo2.value).toFixed(1)}%` : '—'}
          sub={spo2 ? formatDateTime12(spo2.timestamp) : undefined}
        />
        <Kpi
          title="Latest breathing rate"
          value={breath ? `${breath.value.toFixed(1)} / min` : '—'}
          sub={breath ? formatDateTime12(breath.timestamp) : undefined}
        />
        <Kpi
          title="Latest daily steps (max that day)"
          value={steps ? `${Math.round(steps.value)} steps` : '—'}
          sub={steps ? format(steps.dayStart, 'PP') : undefined}
        />
        <Kpi
          title="Latest weight"
          value={weight ? `${weight.weightKg.toFixed(1)} kg` : '—'}
          sub={weight ? formatDateTime12(weight.timestamp) : undefined}
        />
      </div>
    </div>
  )
}

function Kpi({
  title,
  value,
  sub,
}: {
  title: string
  value: string
  sub?: string
}) {
  return (
    <div className="kpi">
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub muted">{sub}</div>}
    </div>
  )
}
