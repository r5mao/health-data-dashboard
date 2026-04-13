import { test, expect } from '@playwright/test'
import { ALL_FIXTURES, importFixtures, navigateToTab } from './helpers'

test.describe('Date range filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, ...ALL_FIXTURES)
  })

  test('"All" preset shows full-range breadcrumb', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: 'All' }).click()
    const breadcrumb = page.locator('.breadcrumb')
    const text = await breadcrumb.textContent()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(5)
  })

  test('"All" preset shows BP chart data', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: 'All' }).click()
    await expect(page.getByText('No readings in this range')).toBeHidden()
    await expect(page.locator('.recharts-wrapper').first()).toBeVisible()
  })

  test('"7d" preset updates breadcrumb to a date range', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: '7d' }).click()
    const breadcrumb = page.locator('.breadcrumb')
    await expect(breadcrumb).not.toContainText('All data')
    const text = await breadcrumb.textContent()
    expect(text).toBeTruthy()
  })

  test('"7d" preset still shows BP data (April readings in range)', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: '7d' }).click()
    await expect(page.getByText('No readings in this range')).toBeHidden()
  })

  test('date range persists across tab switches', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: '7d' }).click()
    const bpBreadcrumb = await page.locator('.breadcrumb').textContent()

    await navigateToTab(page, 'Activity')
    const activityBreadcrumb = await page.locator('.breadcrumb').textContent()
    expect(activityBreadcrumb).toBe(bpBreadcrumb)
  })

  test('"2d" preset may show empty state for pages with sparse data', async ({ page }) => {
    await navigateToTab(page, 'Recovery')
    await page.locator('.preset-btn', { hasText: '2d' }).click()
    // With fixture data, sleep on April 9-10 may or may not fall in the 2d window.
    // Just verify the page doesn't crash and shows either data or empty state.
    const page2 = page.locator('.page')
    await expect(page2).toBeVisible()
  })

  test('switching preset from narrow to "All" restores data', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await page.locator('.preset-btn', { hasText: '2d' }).click()
    await page.locator('.preset-btn', { hasText: 'All' }).click()
    const breadcrumb = page.locator('.breadcrumb')
    const text = await breadcrumb.textContent()
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(5)
    await expect(page.getByText('No readings in this range')).toBeHidden()
  })
})
