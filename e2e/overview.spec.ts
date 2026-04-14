import { test, expect } from '@playwright/test'
import { ALL_FIXTURES, importFixtures, navigateToTab, getKpiValue } from './helpers'

test.describe('Overview KPIs after import', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, ...ALL_FIXTURES)
    await navigateToTab(page, 'Overview')
    await expect
      .poll(async () => (await getKpiValue(page, 'Latest blood pressure')).includes('mmHg'), {
        timeout: 20_000,
      })
      .toBe(true)
  })

  test('latest blood pressure shows mmHg', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest blood pressure')
    expect(value).toContain('mmHg')
    expect(value).not.toBe('\u2014')
  })

  test('7-day BP average is populated', async ({ page }) => {
    const value = await getKpiValue(page, '7-day BP average')
    expect(value).toContain('/')
    expect(value).not.toBe('\u2014')
  })

  test('latest heart rate shows bpm', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest heart rate')
    expect(value).toContain('bpm')
  })

  test('latest SpO2 shows percentage', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest SpO')
    expect(value).toContain('%')
  })

  test('latest breathing rate shows /min', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest breathing rate')
    expect(value).toContain('/ min')
  })

  test('latest steps is populated', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest daily steps')
    expect(value).toContain('steps')
  })

  test('latest weight shows kg', async ({ page }) => {
    const value = await getKpiValue(page, 'Latest weight')
    expect(value).toContain('kg')
  })
})

test.describe('Overview KPIs without data', () => {
  test('all KPIs show em dash when no data imported', async ({ page }) => {
    await page.goto('/')
    const kpiValues = page.locator('.kpi-value')
    const count = await kpiValues.count()
    for (let i = 0; i < count; i++) {
      await expect(kpiValues.nth(i)).toHaveText('\u2014')
    }
  })
})
