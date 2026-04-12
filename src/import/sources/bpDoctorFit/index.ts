import { emptyBundle, type ImportBundle } from '@/import/sources/bpDoctorFit/importBundle'
import {
  parseBloodOxygenCsv,
  parseBloodPressureCsv,
  parseBreathingCsv,
  parseHeartRateCsv,
  parseHeatCsv,
  parseHrvCsv,
  parsePressureCsv,
  parseSleepCsv,
  parseSportCsv,
  parseStepCsv,
  parseWeightCsv,
} from '@/import/sources/bpDoctorFit/parsers'

/**
 * Routes BP Doctor Fit export filenames to the appropriate parser.
 * Filenames are matched case-insensitively on substrings (see plan).
 */
export function parseBpDoctorFitFile(filename: string, text: string): ImportBundle {
  const key = filename.normalize('NFKC').toLowerCase().replace(/\\/g, '/')
  const base = emptyBundle()

  if (key.includes('heartrate')) {
    base.timeseries = parseHeartRateCsv(text, filename)
    return base
  }
  if (key.includes('heat_data') || /^heat.*\.csv$/i.test(filename.trim())) {
    base.timeseries = parseHeatCsv(text, filename)
    return base
  }
  if (key.includes('hrv')) {
    base.timeseries = parseHrvCsv(text, filename)
    return base
  }
  if (key.includes('sleep')) {
    base.sleep = parseSleepCsv(text, filename)
    return base
  }
  if (key.includes('sport')) {
    base.sport = parseSportCsv(text, filename)
    return base
  }
  if (key.includes('step')) {
    base.timeseries = parseStepCsv(text, filename)
    return base
  }
  if (key.includes('pressure')) {
    base.timeseries = parsePressureCsv(text, filename)
    return base
  }
  if (key.includes('weight')) {
    base.weight = parseWeightCsv(text, filename)
    return base
  }
  if (key.includes('bloodoxygen')) {
    base.timeseries = parseBloodOxygenCsv(text, filename)
    return base
  }
  if (key.includes('bloodpressure')) {
    base.bloodPressure = parseBloodPressureCsv(text, filename)
    return base
  }
  if (key.includes('breathing')) {
    base.timeseries = parseBreathingCsv(text, filename)
    return base
  }

  throw new Error(`Unsupported CSV for BP Doctor Fit adapter: ${filename}`)
}

export { BP_DOCTOR_FIT } from '@/import/sources/bpDoctorFit/constants'
