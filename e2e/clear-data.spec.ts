import { test, expect } from '@playwright/test'
import { importFixtures, navigateToTab } from './helpers'

test.describe('Clear all data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, 'BloodPressure_Data.csv')
  })

  test('cancel keeps data intact', async ({ page }) => {
    await navigateToTab(page, 'Import')
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()

    const dialog = page.locator('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Clear all data?')).toBeVisible()

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()

    const rows = page.locator('table.data-table tbody tr')
    await expect(rows).toHaveCount(1)
  })

  test('confirming clears data and shows success banner', async ({ page }) => {
    await navigateToTab(page, 'Import')
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()

    const dialog = page.locator('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Clear all data' }).click()

    const banner = page.locator('[role="status"]')
    await expect(banner).toContainText('All data cleared')
  })

  test('KPIs reset to em dash after clearing', async ({ page }) => {
    await navigateToTab(page, 'Import')
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()
    const dialog = page.locator('dialog')
    await dialog.getByRole('button', { name: 'Clear all data' }).click()
    await expect(page.locator('[role="status"]')).toContainText('All data cleared')

    await navigateToTab(page, 'Overview')
    const kpiValues = page.locator('.kpi-value')
    const count = await kpiValues.count()
    for (let i = 0; i < count; i++) {
      await expect(kpiValues.nth(i)).toHaveText('\u2014')
    }
  })

  test('records table shows "No imports yet" after clearing', async ({ page }) => {
    await navigateToTab(page, 'Import')
    await page.getByRole('button', { name: 'Clear all', exact: true }).click()
    const dialog = page.locator('dialog')
    await dialog.getByRole('button', { name: 'Clear all data' }).click()
    await expect(page.locator('[role="status"]')).toContainText('All data cleared')

    await expect(page.getByText('No imports yet')).toBeVisible()
  })
})
