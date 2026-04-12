import type {
  BloodPressureReading,
  SleepSession,
  SportSession,
  TimeseriesSample,
  WeightMeasurement,
} from '@/types/canonical'

export type ImportBundle = {
  timeseries: TimeseriesSample[]
  bloodPressure: BloodPressureReading[]
  sleep: SleepSession[]
  sport: SportSession[]
  weight: WeightMeasurement[]
}

export function emptyBundle(): ImportBundle {
  return {
    timeseries: [],
    bloodPressure: [],
    sleep: [],
    sport: [],
    weight: [],
  }
}
