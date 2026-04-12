/** Canonical metric kinds stored in timeseries samples */
export type MetricType =
  | 'heart_rate'
  | 'calories'
  | 'steps'
  | 'pressure'
  | 'oxygen'
  | 'breathing'
  | 'hrv'

/** Identifies which import adapter produced a row */
export type DataSourcePlatform = 'bp_doctor_fit'

export const METRIC_UNITS: Record<MetricType, string> = {
  heart_rate: 'bpm',
  calories: 'kcal',
  steps: 'steps',
  pressure: 'index',
  oxygen: '%',
  breathing: 'times/min',
  hrv: 'ms',
}

export function defaultUnitForMetric(metric: MetricType): string {
  return METRIC_UNITS[metric]
}
