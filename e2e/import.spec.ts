import { test, expect } from '@playwright/test'
import { ALL_FIXTURES, fixturePath, importFixtures, navigateToTab } from './helpers'

test.describe('CSV import flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('imports all fixture files and shows success banner', async ({ page }) => {
    await importFixtures(page, ...ALL_FIXTURES)

    const banner = page.locator('[role="status"]')
    await expect(banner).toContainText(`Imported ${ALL_FIXTURES.length} files successfully`)
  })

  test('records table shows a row per imported file', async ({ page }) => {
    await importFixtures(page, ...ALL_FIXTURES)

    const table = page.locator('table.data-table')
    await expect(table).toBeVisible()
    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(ALL_FIXTURES.length)
  })

  test('each import record shows a non-zero data count', async ({ page }) => {
    await importFixtures(page, ...ALL_FIXTURES)

    const table = page.locator('table.data-table')
    const rows = table.locator('tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td')
      const dataCountText = await cells.nth(3).textContent()
      const dataCount = Number(dataCountText?.trim())
      expect(dataCount).toBeGreaterThan(0)
    }
  })

  test('shows error banner for invalid file', async ({ page }) => {
    await navigateToTab(page, 'Import')

    const invalidCsvContent = 'col1,col2\nval1,val2\n'
    const buffer = Buffer.from(invalidCsvContent, 'utf-8')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer,
    })

    const banner = page.locator('[role="status"]')
    await expect(banner).toBeVisible({ timeout: 10_000 })
    await expect(banner).toHaveClass(/error/)
  })

  test('importing a single file shows singular message', async ({ page }) => {
    await importFixtures(page, 'BloodPressure_Data.csv')

    const banner = page.locator('[role="status"]')
    await expect(banner).toContainText('Imported 1 file successfully')
  })
})
