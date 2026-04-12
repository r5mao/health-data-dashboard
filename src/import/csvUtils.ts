import Papa from 'papaparse'

/** Normalize header cell for matching (trim, lowercase, NFKC) */
export function normalizeHeaderCell(s: string): string {
  return s.normalize('NFKC').trim().toLowerCase()
}

/** Parse `YYYY-MM-DD HH:MM:SS` as local wall time (no timezone conversion). */
export function parseNaiveTimestamp(s: string): number {
  const t = s.trim()
  const m =
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/.exec(t)
  if (!m) {
    throw new Error(`Invalid timestamp: ${s}`)
  }
  const [, y, mo, d, h, mi, se] = m
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(se),
    0,
  ).getTime()
}

/** `HH:MM:SS` → total minutes (rounded to nearest integer). */
export function parseDurationToMinutes(hms: string): number {
  const parts = hms.trim().split(':')
  if (parts.length !== 3) {
    throw new Error(`Invalid duration: ${hms}`)
  }
  const [hs, ms, ss] = parts.map((p) => Number(p))
  if ([hs, ms, ss].some((n) => Number.isNaN(n))) {
    throw new Error(`Invalid duration: ${hms}`)
  }
  return Math.round(hs * 60 + ms + ss / 60)
}

export type ParsedCsv = {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsvWithHeaders(text: string): ParsedCsv {
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: false,
  })
  const data = result.data.filter((row) => row.some((c) => c.trim() !== ''))
  if (data.length === 0) {
    return { headers: [], rows: [] }
  }
  const headers = data[0].map((h) => h.trim())
  const rows: Record<string, string>[] = []
  for (let i = 1; i < data.length; i++) {
    const line = data[i]
    const obj: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = line[j] ?? ''
    }
    rows.push(obj)
  }
  return { headers, rows }
}

/**
 * Returns CSV text starting at the preamble line that contains the real header row,
 * so Papa can parse with header: true. Uses anchor substrings that appear in real headers.
 */
export function sliceCsvAfterPreamble(
  fullText: string,
  anchorMustInclude: string[],
): string {
  const lines = fullText.split(/\r?\n/)
  const normAnchors = anchorMustInclude.map((a) => normalizeHeaderCell(a))
  for (let i = 0; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    const normalized = cells.map(normalizeHeaderCell)
    const ok = normAnchors.every((a) =>
      normalized.some((c) => c.includes(a) || c === a),
    )
    if (ok) {
      return lines.slice(i).join('\n')
    }
  }
  throw new Error('Could not find header row for CSV preamble')
}

/** Minimal CSV line split (handles quoted fields lightly) */
function parseCsvLine(line: string): string[] {
  const result = Papa.parse<string[]>(line, {
    header: false,
  })
  return result.data[0] ?? []
}

export function parseCsvWithHeadersAfterPreamble(
  fullText: string,
  anchors: string[],
): ParsedCsv {
  const sliced = sliceCsvAfterPreamble(fullText, anchors)
  return parseCsvWithHeaders(sliced)
}

export function getCell(row: Record<string, string>, ...names: string[]): string {
  const keys = Object.keys(row)
  for (const name of names) {
    const found = keys.find(
      (k) => normalizeHeaderCell(k) === normalizeHeaderCell(name),
    )
    if (found !== undefined) {
      return row[found] ?? ''
    }
  }
  for (const name of names) {
    const found = keys.find((k) =>
      normalizeHeaderCell(k).includes(normalizeHeaderCell(name)),
    )
    if (found !== undefined) {
      return row[found] ?? ''
    }
  }
  return ''
}
