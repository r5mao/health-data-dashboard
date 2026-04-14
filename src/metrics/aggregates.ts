import {
  addDays,
  endOfDay,
  startOfDay,
} from 'date-fns'
import { db } from '@/db/schema'
import type { BloodPressureRow, TimeseriesRow } from '@/types/canonical'
import type { MetricType } from '@/types/metric'

export async function latestTimeseriesMetric(
  metric: MetricType,
): Promise<TimeseriesRow | null> {
  const rows = await db.timeseries.where('metricType').equals(metric).sortBy('timestamp')
  if (rows.length === 0) return null
  return rows[rows.length - 1]!
}

/** Max steps sample per local calendar day, then take the day with latest date. */
export async function latestDailyStepsSummary(): Promise<{
  dayStart: number
  value: number
} | null> {
  const rows = await db.timeseries.where('metricType').equals('steps').toArray()
  if (rows.length === 0) return null

  const byDay = new Map<string, { max: number; dayStart: number }>()
  for (const r of rows) {
    const d = startOfDay(r.timestamp)
    const key = String(d.getTime())
    const prev = byDay.get(key)
    const val = r.value
    if (!prev || val > prev.max) {
      byDay.set(key, { max: val, dayStart: d.getTime() })
    }
  }
  let best: { max: number; dayStart: number } | null = null
  for (const v of byDay.values()) {
    if (!best || v.dayStart > best.dayStart) {
      best = v
    }
  }
  return best ? { dayStart: best.dayStart, value: best.max } : null
}

export async function bloodPressureInRange(
  start: number,
  end: number,
): Promise<BloodPressureRow[]> {
  return db.bloodPressure
    .where('timestamp')
    .between(start, end, true, true)
    .toArray()
}

export async function averageBloodPressure(
  readings: BloodPressureRow[],
): Promise<{ systolic: number; diastolic: number; pulse: number } | null> {
  if (readings.length === 0) return null
  let s = 0
  let d = 0
  let p = 0
  for (const r of readings) {
    s += r.systolic
    d += r.diastolic
    p += r.pulse
  }
  const n = readings.length
  return {
    systolic: Math.round(s / n),
    diastolic: Math.round(d / n),
    pulse: Math.round(p / n),
  }
}

/** Rolling 7-day window ending today (local), inclusive of start day. */
export async function bloodPressureAvgLast7Days(): Promise<{
  systolic: number
  diastolic: number
  pulse: number
} | null> {
  const end = endOfDay(Date.now()).getTime()
  const start = startOfDay(addDays(end, -6)).getTime()
  const rows = await bloodPressureInRange(start, end)
  return averageBloodPressure(rows)
}

export async function latestBloodPressure(): Promise<BloodPressureRow | null> {
  const rows = await db.bloodPressure.orderBy('timestamp').toArray()
  if (rows.length === 0) return null
  return rows.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
}

export async function latestWeight() {
  const rows = await db.weightMeasurements.orderBy('timestamp').toArray()
  if (rows.length === 0) return null
  return rows.reduce((a, b) => (a.timestamp >= b.timestamp ? a : b))
}
