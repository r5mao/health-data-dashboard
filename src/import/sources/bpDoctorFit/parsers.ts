import {
  getCell,
  parseCsvWithHeadersAfterPreamble,
  parseDurationToMinutes,
  parseNaiveTimestamp,
} from '@/import/csvUtils'
import { defaultUnitForMetric } from '@/types/metric'
import type {
  BloodPressureReading,
  SleepSession,
  SportSession,
  TimeseriesSample,
  WeightMeasurement,
} from '@/types/canonical'
import { BP_DOCTOR_FIT } from '@/import/sources/bpDoctorFit/constants'

function ts(
  metric: TimeseriesSample['metricType'],
  value: number,
  timestamp: number,
  sourceFile: string,
  device: string,
  dataSource: string,
): TimeseriesSample {
  return {
    metricType: metric,
    timestamp,
    value,
    unit: defaultUnitForMetric(metric),
    sourceFile,
    source: BP_DOCTOR_FIT,
    device,
    dataSource,
  }
}

export function parseHeartRateCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'heart rate',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(
      row,
      'Heart Rate (times/minute)',
      'Heart Rate',
    ).trim()
    if (!v) continue
    const hr = Number(v)
    if (Number.isNaN(hr)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'heart_rate',
        hr,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parseHeatCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'calories burned',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(row, 'Calories Burned (kcal)', 'Calories Burned').trim()
    if (!v) continue
    const kcal = Number(v)
    if (Number.isNaN(kcal)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'calories',
        kcal,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parseHrvCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'hrv',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(row, 'HRV（RRI）', 'HRV(RRI)', 'HRV').trim()
    if (!v) continue
    const ms = Number(v)
    if (Number.isNaN(ms)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'hrv',
        ms,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parseSleepCsv(text: string, sourceFile: string): SleepSession[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'sleep duration',
    'start sleep time',
  ])
  const out: SleepSession[] = []
  for (const row of rows) {
    const start = getCell(row, 'Start Sleep Time').trim()
    const end = getCell(row, 'End Sleep Time').trim()
    if (!start || !end) continue
    out.push({
      startTime: parseNaiveTimestamp(start),
      endTime: parseNaiveTimestamp(end),
      sleepMinutes: parseDurationToMinutes(
        getCell(row, 'Sleep Duration').trim() || '0:0:0',
      ),
      deepMinutes: parseDurationToMinutes(
        getCell(row, 'Deep Sleep Duration').trim() || '0:0:0',
      ),
      lightMinutes: parseDurationToMinutes(
        getCell(row, 'Shallow Sleep Duration').trim() || '0:0:0',
      ),
      awakeMinutes: parseDurationToMinutes(
        getCell(row, 'Awakening Duration').trim() || '0:0:0',
      ),
      sourceFile,
      source: BP_DOCTOR_FIT,
      device: getCell(row, 'Measuring Device').trim(),
    })
  }
  return out
}

export function parseSportCsv(text: string, sourceFile: string): SportSession[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'sport type',
    'measurement time',
  ])
  const out: SportSession[] = []
  for (const row of rows) {
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    const dur = getCell(row, 'Exercise Duration').trim()
    const hrRaw = getCell(row, 'Average Heart Rate (times/minute)').trim()
    const avgHr = hrRaw === '' || Number.isNaN(Number(hrRaw)) ? null : Number(hrRaw)
    out.push({
      sportType: getCell(row, 'Sport Type').trim(),
      measurementTime: parseNaiveTimestamp(mt),
      durationMinutes: dur ? parseDurationToMinutes(dur) : 0,
      distanceM: Number(getCell(row, 'Distance (m)') || 0) || 0,
      caloriesKcal: Number(getCell(row, 'Calories Burned (kcal)') || 0) || 0,
      avgHrBpm: avgHr,
      avgSpeedKmh: Number(getCell(row, 'Average Speed (km/h)') || 0) || 0,
      steps: Number(getCell(row, 'Steps') || 0) || 0,
      cadenceSpm: Number(getCell(row, 'Average Cadence (steps/minute)') || 0) || 0,
      sourceFile,
      source: BP_DOCTOR_FIT,
      device: getCell(row, 'Measuring Device').trim(),
    })
  }
  return out
}

export function parseStepCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'steps',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(row, 'Steps').trim()
    if (!v) continue
    const steps = Number(v)
    if (Number.isNaN(steps)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'steps',
        steps,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parsePressureCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'pressure',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(row, 'Pressure').trim()
    if (!v) continue
    const p = Number(v)
    if (Number.isNaN(p)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'pressure',
        p,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parseWeightCsv(text: string, sourceFile: string): WeightMeasurement[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, ['weight (kg)', 'measurement time'])
  const out: WeightMeasurement[] = []
  for (const row of rows) {
    const w = getCell(row, 'Weight (kg)').trim()
    if (!w) continue
    const kg = Number(w.replace(',', '.'))
    if (Number.isNaN(kg)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push({
      timestamp: parseNaiveTimestamp(mt),
      weightKg: kg,
      sourceFile,
      source: BP_DOCTOR_FIT,
      device: getCell(row, 'Measuring Device').trim(),
      dataSource: getCell(row, 'Data Source').trim(),
    })
  }
  return out
}

export function parseBloodOxygenCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'blood oxygen',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(
      row,
      'Blood Oxygen (%)',
      'Blood Oxygen',
    ).trim()
    if (!v) continue
    const pct = Number(v)
    if (Number.isNaN(pct)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'oxygen',
        pct,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}

export function parseBloodPressureCsv(text: string, sourceFile: string): BloodPressureReading[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'systolic',
    'measurement time',
  ])
  const out: BloodPressureReading[] = []
  for (const row of rows) {
    const sys = getCell(row, 'Systolic Pressure (mmHg)', 'Systolic').trim()
    const dia = getCell(row, 'Diastolic Pressure (mmHg)', 'Diastolic').trim()
    const pulse = getCell(row, 'Pulse (times/minute)', 'Pulse').trim()
    const mt = getCell(row, 'Measurement Time').trim()
    if (!sys || !dia || !mt) continue
    out.push({
      timestamp: parseNaiveTimestamp(mt),
      systolic: Number(sys),
      diastolic: Number(dia),
      pulse: pulse ? Number(pulse) : 0,
      sourceFile,
      source: BP_DOCTOR_FIT,
      device: getCell(row, 'Measuring Device').trim(),
      dataSource: getCell(row, 'Data Source').trim(),
    })
  }
  return out
}

export function parseBreathingCsv(text: string, sourceFile: string): TimeseriesSample[] {
  const { rows } = parseCsvWithHeadersAfterPreamble(text, [
    'breathing',
    'measurement time',
  ])
  const out: TimeseriesSample[] = []
  for (const row of rows) {
    const v = getCell(row, 'Breathing (times/minute)', 'Breathing').trim()
    if (!v) continue
    const b = Number(v)
    if (Number.isNaN(b)) continue
    const mt = getCell(row, 'Measurement Time').trim()
    if (!mt) continue
    out.push(
      ts(
        'breathing',
        b,
        parseNaiveTimestamp(mt),
        sourceFile,
        getCell(row, 'Measuring Device').trim(),
        getCell(row, 'Data Source').trim(),
      ),
    )
  }
  return out
}
