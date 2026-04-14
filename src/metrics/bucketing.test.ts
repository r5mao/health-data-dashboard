import { describe, expect, it } from 'vitest'
import type { TimeseriesRow } from '@/types/canonical'
import type { MetricType } from '@/types/metric'
import {
  HOURLY_BUCKET_MAX_SPAN_DAYS,
  bloodPressureHourOfDayAverages,
  bucketBloodPressureDaily,
  bucketTimeseries,
  bucketTimeseriesAdaptive,
  timeseriesChartGranularity,
  timeseriesChartGranularityFromMs,
} from '@/metrics/bucketing'

const DAY_MS = 86400000

function sample(
  metric: MetricType,
  timestamp: number,
  value: number,
): TimeseriesRow {
  return {
    metricType: metric,
    timestamp,
    value,
    unit: 'u',
    sourceFile: 't.csv',
    source: 'bp_doctor_fit',
    device: 'd',
    dataSource: 'src',
  }
}

describe('timeseriesChartGranularity', () => {
  it('uses hourly buckets up to HOURLY_BUCKET_MAX_SPAN_DAYS', () => {
    expect(timeseriesChartGranularity(HOURLY_BUCKET_MAX_SPAN_DAYS)).toBe('hour')
  })

  it('switches to day granularity after hourly window', () => {
    expect(timeseriesChartGranularity(HOURLY_BUCKET_MAX_SPAN_DAYS + 1)).toBe('day')
  })

  it('uses week between 61 and 400 days', () => {
    expect(timeseriesChartGranularity(61)).toBe('week')
    expect(timeseriesChartGranularity(400)).toBe('week')
  })

  it('uses month for very long spans', () => {
    expect(timeseriesChartGranularity(401)).toBe('month')
  })
})

describe('timeseriesChartGranularityFromMs', () => {
  it('treats negative span as zero (hour)', () => {
    expect(timeseriesChartGranularityFromMs(-1000)).toBe('hour')
  })

  it('maps span in ms to the same tiers as span in days', () => {
    expect(timeseriesChartGranularityFromMs(7 * DAY_MS)).toBe('hour')
    expect(timeseriesChartGranularityFromMs(8 * DAY_MS)).toBe('day')
  })
})

describe('bucketTimeseries', () => {
  const rangeStart = new Date(2026, 3, 10, 0, 0, 0).getTime()
  const rangeEnd = new Date(2026, 3, 12, 23, 59, 59).getTime()

  it('returns empty array when no samples match metric or range', () => {
    const t0 = new Date(2026, 3, 11, 12, 0, 0).getTime()
    expect(
      bucketTimeseries(
        [sample('heart_rate', t0, 70)],
        rangeStart,
        rangeEnd,
        'hour',
        'steps',
      ),
    ).toEqual([])
    expect(
      bucketTimeseries(
        [sample('steps', rangeStart - DAY_MS, 100)],
        rangeStart,
        rangeEnd,
        'hour',
        'steps',
      ),
    ).toEqual([])
  })

  it('aggregates multiple points in the same hour', () => {
    const t1 = new Date(2026, 3, 11, 14, 10, 0).getTime()
    const t2 = new Date(2026, 3, 11, 14, 45, 0).getTime()
    const rows = [
      sample('steps', t1, 100),
      sample('steps', t2, 200),
    ]
    const out = bucketTimeseries(rows, rangeStart, rangeEnd, 'hour', 'steps')
    expect(out).toHaveLength(1)
    expect(out[0].count).toBe(2)
    expect(out[0].min).toBe(100)
    expect(out[0].max).toBe(200)
    expect(out[0].avg).toBe(150)
  })
})

describe('bucketTimeseriesAdaptive', () => {
  it('uses full range when zoom domain is absent', () => {
    const start = new Date(2026, 3, 1, 0, 0, 0).getTime()
    const end = new Date(2026, 3, 3, 23, 0, 0).getTime()
    const mid = new Date(2026, 3, 2, 12, 0, 0).getTime()
    const rows = [sample('steps', mid, 50)]
    const full = bucketTimeseriesAdaptive(rows, start, end, 'steps', null)
    const zoomed = bucketTimeseriesAdaptive(rows, start, end, 'steps', [mid - 1000, mid + 1000])
    expect(full.length).toBeGreaterThan(0)
    expect(zoomed.length).toBeGreaterThan(0)
  })

  it('returns empty when the zoom window contains no samples', () => {
    const fullStart = new Date(2026, 3, 1).getTime()
    const fullEnd = new Date(2026, 3, 10, 23, 59, 59).getTime()
    const sampleTime = new Date(2026, 3, 5, 12, 0, 0).getTime()
    const rows = [sample('steps', sampleTime, 1)]
    const zoomStart = new Date(2026, 3, 1, 0, 0, 0).getTime()
    const zoomEnd = new Date(2026, 3, 1, 1, 0, 0).getTime()
    expect(bucketTimeseriesAdaptive(rows, fullStart, fullEnd, 'steps', [zoomStart, zoomEnd])).toEqual(
      [],
    )
  })
})

describe('bucketBloodPressureDaily', () => {
  it('averages multiple readings on the same calendar day', () => {
    const d = new Date(2026, 3, 11)
    const morning = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 0, 0).getTime()
    const evening = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0, 0).getTime()
    const rangeStart = new Date(2026, 3, 10).getTime()
    const rangeEnd = new Date(2026, 3, 12, 23, 59, 59).getTime()
    const out = bucketBloodPressureDaily(
      [
        { timestamp: morning, systolic: 120, diastolic: 80 },
        { timestamp: evening, systolic: 130, diastolic: 85 },
      ],
      rangeStart,
      rangeEnd,
    )
    expect(out).toHaveLength(1)
    expect(out[0].n).toBe(2)
    expect(out[0].sysAvg).toBe(125)
    expect(out[0].diaAvg).toBe(82.5)
  })
})

describe('bloodPressureHourOfDayAverages', () => {
  const noon = new Date(2026, 3, 11, 12, 30, 0).getTime()
  const midnight = new Date(2026, 3, 11, 0, 15, 0).getTime()

  it('returns nulls for hours with no readings', () => {
    const pts = bloodPressureHourOfDayAverages(
      [{ timestamp: noon, systolic: 120, diastolic: 80 }],
      'mean',
    )
    expect(pts[12].sys).toBe(120)
    expect(pts[0].sys).toBeNull()
    expect(pts[0].n).toBe(0)
  })

  it('computes mean by default', () => {
    const pts = bloodPressureHourOfDayAverages(
      [
        { timestamp: noon, systolic: 100, diastolic: 60 },
        { timestamp: noon + 60_000, systolic: 120, diastolic: 80 },
      ],
      'mean',
    )
    expect(pts[12].sys).toBe(110)
    expect(pts[12].dia).toBe(70)
  })

  it('computes median for even-sized buckets', () => {
    const pts = bloodPressureHourOfDayAverages(
      [
        { timestamp: noon, systolic: 100, diastolic: 60 },
        { timestamp: noon + 60_000, systolic: 120, diastolic: 80 },
        { timestamp: noon + 120_000, systolic: 140, diastolic: 90 },
        { timestamp: noon + 180_000, systolic: 160, diastolic: 100 },
      ],
      'median',
    )
    expect(pts[12].sys).toBe(130)
    expect(pts[12].dia).toBe(85)
  })

  it('uses distinct hours for midnight vs noon', () => {
    const pts = bloodPressureHourOfDayAverages(
      [
        { timestamp: midnight, systolic: 110, diastolic: 70 },
        { timestamp: noon, systolic: 120, diastolic: 80 },
      ],
      'mean',
    )
    expect(pts[0].sys).toBe(110)
    expect(pts[12].sys).toBe(120)
  })
})
