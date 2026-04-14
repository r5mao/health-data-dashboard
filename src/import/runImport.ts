import { persistImportBundle } from '@/db/repository'
import { parseBpDoctorFitFile, BP_DOCTOR_FIT } from '@/import/sources/bpDoctorFit'
import { extractCsvEntriesFromZip } from '@/import/zipCsv'

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

export async function importCsvText(
  sourceFile: string,
  text: string,
): Promise<ImportResult | ImportFailure> {
  try {
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

export async function importCsvFile(file: File): Promise<ImportResult | ImportFailure> {
  return importCsvText(file.name, await file.text())
}

/** Each CSV inside the archive is imported separately; results are in sorted path order. */
export async function importZipFile(file: File): Promise<(ImportResult | ImportFailure)[]> {
  const zipName = file.name
  let entries: { sourceFile: string; text: string }[]
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    entries = extractCsvEntriesFromZip(zipName, bytes)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return [{ sourceFile: zipName, ok: false, error: msg }]
  }

  if (entries.length === 0) {
    return [{ sourceFile: zipName, ok: false, error: 'No CSV files found in ZIP archive.' }]
  }

  const results: (ImportResult | ImportFailure)[] = []
  for (const { sourceFile, text } of entries) {
    results.push(await importCsvText(sourceFile, text))
  }
  return results
}
