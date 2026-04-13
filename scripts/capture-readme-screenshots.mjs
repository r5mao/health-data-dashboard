/**
 * Generates screenshots for README.md. Requires dev server:
 *   npm run dev -- --host 127.0.0.1 --port 5173
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'docs', 'images')
const base = 'http://127.0.0.1:5173'

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

async function shot(name) {
  await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true })
}

await page.goto(base, { waitUntil: 'load' })
await page.getByRole('heading', { level: 1, name: 'Health Dashboard' }).waitFor({
  state: 'visible',
  timeout: 30_000,
})
await shot('overview')

await page.getByRole('button', { name: 'Blood pressure', exact: true }).click()
await page.getByRole('heading', { level: 2, name: 'Blood pressure' }).waitFor()
await shot('blood-pressure')

await page.getByRole('button', { name: 'Import', exact: true }).click()
await page.getByRole('heading', { level: 2, name: 'Import' }).waitFor()
await shot('import')

await browser.close()
console.log('Wrote PNGs to docs/images/')
