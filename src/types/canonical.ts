import type { DataSourcePlatform, MetricType } from '@/types/metric'

/** Normalized time-series point (HR, steps, SpO2, etc.) */
export type TimeseriesSample = {
  metricType: MetricType
  timestamp: number
  value: number
  unit: string
  sourceFile: string
  source: DataSourcePlatform
  device: string
  dataSource: string
}

export type BloodPressureReading = {
  timestamp: number
  systolic: number
  diastolic: number
  pulse: number
  sourceFile: string
  source: DataSourcePlatform
  device: string
  dataSource: string
}

export type SleepSession = {
  startTime: number
  endTime: number
  sleepMinutes: number
  deepMinutes: number
  lightMinutes: number
  awakeMinutes: number
  sourceFile: string
  source: DataSourcePlatform
  device: string
}

export type SportSession = {
  sportType: string
  measurementTime: number
  durationMinutes: number
  distanceM: number
  caloriesKcal: number
  avgHrBpm: number | null
  avgSpeedKmh: number
  steps: number
  cadenceSpm: number
  sourceFile: string
  source: DataSourcePlatform
  device: string
}

export type WeightMeasurement = {
  timestamp: number
  weightKg: number
  sourceFile: string
  source: DataSourcePlatform
  device: string
  dataSource: string
}

/** Dexie primary keys */
export type TimeseriesRow = TimeseriesSample & { id?: number }
export type BloodPressureRow = BloodPressureReading & { id?: number }
export type SleepSessionRow = SleepSession & { id?: number }
export type SportSessionRow = SportSession & { id?: number }
export type WeightMeasurementRow = WeightMeasurement & { id?: number }

export type ImportMetaRecord = {
  sourceFile: string
  source: DataSourcePlatform
  importedAt: number
  dataType: string
  dateMin: number | null
  dateMax: number | null
  rowCounts: {
    timeseries: number
    bloodPressure: number
    sleep: number
    sport: number
    weight: number
  }
}
