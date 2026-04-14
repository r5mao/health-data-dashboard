import { unzipSync } from 'fflate'

const UTF8 = new TextDecoder('utf-8', { fatal: false })

/**
 * Reads a ZIP file and returns UTF-8 text for each `.csv` entry (any depth).
 * Paths use `/`; `__MACOSX` metadata is skipped. `sourceFile` is
 * `${zipFileName}/${entryPath}` so imports stay distinct from loose CSV uploads.
 */
export function extractCsvEntriesFromZip(
  zipFileName: string,
  zipBytes: Uint8Array,
): { sourceFile: string; text: string }[] {
  let unzipped: Record<string, Uint8Array>
  try {
    unzipped = unzipSync(zipBytes)
  } catch {
    throw new Error('Could not read ZIP file (corrupt or not a ZIP archive).')
  }

  const out: { sourceFile: string; text: string }[] = []

  for (const [rawPath, data] of Object.entries(unzipped)) {
    if (!(data instanceof Uint8Array)) continue
    const path = rawPath.replace(/\\/g, '/')
    if (path.endsWith('/')) continue
    if (!path.toLowerCase().endsWith('.csv')) continue
    if (path.includes('__MACOSX/')) continue

    const sourceFile = `${zipFileName}/${path}`
    out.push({ sourceFile, text: UTF8.decode(data) })
  }

  return out.sort((a, b) => a.sourceFile.localeCompare(b.sourceFile))
}
