import { format, startOfDay, startOfMonth } from 'date-fns'
import type { TimeseriesRow } from '@/types/canonical'
import type { MetricType } from '@/types/metric'

export type Granularity = 'hour' | 'day' | 'week' | 'month'

export type BucketPoint = {
  label: string
  t: number
  min?: number
  max?: number
  avg?: number
  count: number
}

function startOfHourMs(t: number): number {
  const d = new Date(t)
  d.setMinutes(0, 0, 0)
  return d.getTime()
}

function startOfIsoWeekMs(t: number): number {
  const d = new Date(t)
  const day = d.getDay()
  const diff = (day + 6) % 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function bucketTimeseries(
  samples: TimeseriesRow[],
  rangeStart: number,
  rangeEnd: number,
  granularity: Granularity,
  metric: MetricType,
): BucketPoint[] {
  const filtered = samples.filter(
    (r) =>
      r.metricType === metric &&
      r.timestamp >= rangeStart &&
      r.timestamp <= rangeEnd,
  )
  if (filtered.length === 0) return []

  const bucketKey = (ts: number): string => {
    if (granularity === 'hour') return String(startOfHourMs(ts))
    if (granularity === 'day') return format(ts, 'yyyy-MM-dd')
    if (granularity === 'week') return format(startOfIsoWeekMs(ts), 'yyyy-MM-dd')
    return format(startOfMonth(ts), 'yyyy-MM')
  }

  const map = new Map<string, { t: number; vals: number[] }>()
  for (const r of filtered) {
    const key = bucketKey(r.timestamp)
    const t =
      granularity === 'hour'
        ? startOfHourMs(r.timestamp)
        : granularity === 'day'
          ? startOfDay(r.timestamp).getTime()
          : granularity === 'week'
            ? startOfIsoWeekMs(r.timestamp)
            : startOfMonth(r.timestamp).getTime()
    const cur = map.get(key)
    if (!cur) {
      map.set(key, { t, vals: [r.value] })
    } else {
      cur.vals.push(r.value)
    }
  }

  const out: BucketPoint[] = [...map.entries()]
    .sort((a, b) => a[1].t - b[1].t)
    .map(([, { t, vals }]) => {
      const label =
        granularity === 'hour'
          ? format(t, 'MMM d HH:mm')
          : granularity === 'day'
            ? format(t, 'MMM d')
            : granularity === 'week'
              ? format(t, 'MMM d')
              : format(t, 'MMM yyyy')
      return {
        label,
        t,
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
        count: vals.length,
      }
    })
  return out
}

export function bucketBloodPressureDaily(
  readings: { timestamp: number; systolic: number; diastolic: number }[],
  rangeStart: number,
  rangeEnd: number,
): { label: string; t: number; sysAvg: number; diaAvg: number; n: number }[] {
  const filtered = readings.filter(
    (r) => r.timestamp >= rangeStart && r.timestamp <= rangeEnd,
  )
  const map = new Map<
    string,
    { t: number; sys: number[]; dia: number[] }
  >()
  for (const r of filtered) {
    const key = format(r.timestamp, 'yyyy-MM-dd')
    const t = startOfDay(r.timestamp).getTime()
    const cur = map.get(key)
    if (!cur) {
      map.set(key, { t, sys: [r.systolic], dia: [r.diastolic] })
    } else {
      cur.sys.push(r.systolic)
      cur.dia.push(r.diastolic)
    }
  }
  return [...map.values()]
    .sort((a, b) => a.t - b.t)
    .map(({ t, sys, dia }) => ({
      label: format(t, 'MMM d'),
      t,
      sysAvg: sys.reduce((a, b) => a + b, 0) / sys.length,
      diaAvg: dia.reduce((a, b) => a + b, 0) / dia.length,
      n: sys.length,
    }))
}
