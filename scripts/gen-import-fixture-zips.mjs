/**
 * Generates ZIP fixtures for import tests. Run with Node so `fflate` resolves
 * to the Node build, which produces standard archives (browser `zipSync` is
 * not suitable for generating test blobs in Vitest).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { strToU8, zipSync } from 'fflate'

const root = dirname(fileURLToPath(import.meta.url))
const fixtureDir = join(root, '..', 'src', 'import', 'fixtures')
mkdirSync(fixtureDir, { recursive: true })

const nested = zipSync({
  folder: { 'BloodPressure_Data.csv': strToU8('a,b\n1,2') },
  'readme.txt': strToU8('x'),
})
writeFileSync(join(fixtureDir, 'nested-csv.zip'), nested)

const macosx = zipSync({
  __MACOSX: { '._HeartRate_Data.csv': strToU8('bad') },
  'HeartRate_Data.csv': strToU8('ok'),
})
writeFileSync(join(fixtureDir, 'with-macosx.zip'), macosx)

console.log('Wrote', fixtureDir)
