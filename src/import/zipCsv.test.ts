import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { extractCsvEntriesFromZip } from '@/import/zipCsv'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadFixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(__dirname, 'fixtures', name)))
}

describe('extractCsvEntriesFromZip', () => {
  it('extracts nested CSV paths and prefixes with zip filename', () => {
    const entries = extractCsvEntriesFromZip('export.zip', loadFixture('nested-csv.zip'))
    expect(entries).toHaveLength(1)
    expect(entries[0].sourceFile).toBe('export.zip/folder/BloodPressure_Data.csv')
    expect(entries[0].text).toBe('a,b\n1,2')
  })

  it('skips __MACOSX metadata', () => {
    const entries = extractCsvEntriesFromZip('a.zip', loadFixture('with-macosx.zip'))
    expect(entries).toHaveLength(1)
    expect(entries[0].sourceFile).toBe('a.zip/HeartRate_Data.csv')
    expect(entries[0].text).toBe('ok')
  })
})
