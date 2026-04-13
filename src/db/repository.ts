import { db } from '@/db/schema'
import type { ImportBundle } from '@/import/sources/bpDoctorFit/importBundle'
import type { MetricType, DataSourcePlatform } from '@/types/metric'

const METRIC_LABELS: Record<MetricType, string> = {
  heart_rate: 'Heart rate',
  calories: 'Calories',
  steps: 'Steps',
  pressure: 'Pressure index',
  oxygen: 'Blood oxygen',
  breathing: 'Breathing rate',
  hrv: 'HRV',
}

function deriveDataType(bundle: ImportBundle): string {
  if (bundle.bloodPressure.length) return 'Blood pressure'
  if (bundle.sleep.length) return 'Sleep'
  if (bundle.sport.length) return 'Sport'
  if (bundle.weight.length) return 'Weight'
  if (bundle.timeseries.length) {
    const mt = bundle.timeseries[0].metricType
    return METRIC_LABELS[mt] ?? mt
  }
  return '—'
}

function bundleDateExtent(bundle: ImportBundle): { dateMin: number | null; dateMax: number | null } {
  const ts: number[] = []
  for (const r of bundle.timeseries) ts.push(r.timestamp)
  for (const r of bundle.bloodPressure) ts.push(r.timestamp)
  for (const r of bundle.sleep) { ts.push(r.startTime); ts.push(r.endTime) }
  for (const r of bundle.sport) ts.push(r.measurementTime)
  for (const r of bundle.weight) ts.push(r.timestamp)
  if (ts.length === 0) return { dateMin: null, dateMax: null }
  return { dateMin: Math.min(...ts), dateMax: Math.max(...ts) }
}

/** Remove all rows previously imported from this file (re-import replaces). */
export async function deleteBySourceFile(sourceFile: string): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.timeseries,
      db.bloodPressure,
      db.sleepSessions,
      db.sportSessions,
      db.weightMeasurements,
    ],
    async () => {
      await db.timeseries.where('sourceFile').equals(sourceFile).delete()
      await db.bloodPressure.where('sourceFile').equals(sourceFile).delete()
      await db.sleepSessions.where('sourceFile').equals(sourceFile).delete()
      await db.sportSessions.where('sourceFile').equals(sourceFile).delete()
      await db.weightMeasurements.where('sourceFile').equals(sourceFile).delete()
    },
  )
}

export async function persistImportBundle(
  sourceFile: string,
  source: DataSourcePlatform,
  bundle: ImportBundle,
): Promise<void> {
  const rowCounts = {
    timeseries: bundle.timeseries.length,
    bloodPressure: bundle.bloodPressure.length,
    sleep: bundle.sleep.length,
    sport: bundle.sport.length,
    weight: bundle.weight.length,
  }

  await deleteBySourceFile(sourceFile)

  await db.transaction(
    'rw',
    [
      db.timeseries,
      db.bloodPressure,
      db.sleepSessions,
      db.sportSessions,
      db.weightMeasurements,
      db.importMeta,
    ],
    async () => {
      if (bundle.timeseries.length) {
        await db.timeseries.bulkAdd(bundle.timeseries)
      }
      if (bundle.bloodPressure.length) {
        await db.bloodPressure.bulkAdd(bundle.bloodPressure)
      }
      if (bundle.sleep.length) {
        await db.sleepSessions.bulkAdd(bundle.sleep)
      }
      if (bundle.sport.length) {
        await db.sportSessions.bulkAdd(bundle.sport)
      }
      if (bundle.weight.length) {
        await db.weightMeasurements.bulkAdd(bundle.weight)
      }
      const { dateMin, dateMax } = bundleDateExtent(bundle)
      await db.importMeta.put({
        sourceFile,
        source,
        importedAt: Date.now(),
        dataType: deriveDataType(bundle),
        dateMin,
        dateMax,
        rowCounts,
      })
    },
  )
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.timeseries,
      db.bloodPressure,
      db.sleepSessions,
      db.sportSessions,
      db.weightMeasurements,
      db.importMeta,
    ],
    async () => {
      await db.timeseries.clear()
      await db.bloodPressure.clear()
      await db.sleepSessions.clear()
      await db.sportSessions.clear()
      await db.weightMeasurements.clear()
      await db.importMeta.clear()
    },
  )
}

export async function getDataTimeExtent(): Promise<{
  min: number
  max: number
} | null> {
  const candidates: number[] = []

  const tsMin = await db.timeseries.orderBy('timestamp').first()
  const tsMax = await db.timeseries.orderBy('timestamp').last()
  if (tsMin) candidates.push(tsMin.timestamp)
  if (tsMax) candidates.push(tsMax.timestamp)

  const bpMin = await db.bloodPressure.orderBy('timestamp').first()
  const bpMax = await db.bloodPressure.orderBy('timestamp').last()
  if (bpMin) candidates.push(bpMin.timestamp)
  if (bpMax) candidates.push(bpMax.timestamp)

  const sMin = await db.sleepSessions.orderBy('startTime').first()
  const sMax = await db.sleepSessions.orderBy('endTime').last()
  if (sMin) candidates.push(sMin.startTime)
  if (sMax) candidates.push(sMax.endTime)

  const spMin = await db.sportSessions.orderBy('measurementTime').first()
  const spMax = await db.sportSessions.orderBy('measurementTime').last()
  if (spMin) candidates.push(spMin.measurementTime)
  if (spMax) candidates.push(spMax.measurementTime)

  const wMin = await db.weightMeasurements.orderBy('timestamp').first()
  const wMax = await db.weightMeasurements.orderBy('timestamp').last()
  if (wMin) candidates.push(wMin.timestamp)
  if (wMax) candidates.push(wMax.timestamp)

  if (candidates.length === 0) return null
  return { min: Math.min(...candidates), max: Math.max(...candidates) }
}
