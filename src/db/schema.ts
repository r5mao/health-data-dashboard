import Dexie, { type Table } from 'dexie'
import type {
  BloodPressureRow,
  ImportMetaRecord,
  SleepSessionRow,
  SportSessionRow,
  TimeseriesRow,
  WeightMeasurementRow,
} from '@/types/canonical'

export class HealthDashboardDB extends Dexie {
  timeseries!: Table<TimeseriesRow, number>
  bloodPressure!: Table<BloodPressureRow, number>
  sleepSessions!: Table<SleepSessionRow, number>
  sportSessions!: Table<SportSessionRow, number>
  weightMeasurements!: Table<WeightMeasurementRow, number>
  importMeta!: Table<ImportMetaRecord, string>

  constructor() {
    super('health-dashboard-v1')
    this.version(1).stores({
      timeseries:
        '++id, metricType, timestamp, sourceFile, [metricType+timestamp]',
      bloodPressure: '++id, timestamp, sourceFile',
      sleepSessions: '++id, startTime, endTime, sourceFile',
      sportSessions: '++id, measurementTime, sourceFile',
      weightMeasurements: '++id, timestamp, sourceFile',
      importMeta: 'sourceFile',
    })
  }
}

export const db = new HealthDashboardDB()
