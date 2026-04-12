import { persistImportBundle } from '@/db/repository'
import { parseBpDoctorFitFile, BP_DOCTOR_FIT } from '@/import/sources/bpDoctorFit'

export type ImportResult = {
  sourceFile: string
  ok: true
  rowCounts: {
    timeseries: number
    bloodPressure: number
    sleep: number
    sport: number
    weight: number
  }
}

export type ImportFailure = {
  sourceFile: string
  ok: false
  error: string
}

export async function importCsvFile(file: File): Promise<ImportResult | ImportFailure> {
  const sourceFile = file.name
  try {
    const text = await file.text()
    const bundle = parseBpDoctorFitFile(sourceFile, text)
    await persistImportBundle(sourceFile, BP_DOCTOR_FIT, bundle)
    return {
      sourceFile,
      ok: true,
      rowCounts: {
        timeseries: bundle.timeseries.length,
        bloodPressure: bundle.bloodPressure.length,
        sleep: bundle.sleep.length,
        sport: bundle.sport.length,
        weight: bundle.weight.length,
      },
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { sourceFile, ok: false, error: msg }
  }
}
