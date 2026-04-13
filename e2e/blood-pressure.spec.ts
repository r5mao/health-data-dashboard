import { test, expect } from '@playwright/test'
import { importFixtures, navigateToTab } from './helpers'

test.describe('Blood pressure page with data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, 'BloodPressure_Data.csv')
    await navigateToTab(page, 'Blood pressure')
  })

  test('does not show empty state', async ({ page }) => {
    await expect(
      page.getByText(
        /No blood pressure, heart-rate, or pressure-index readings in this range/,
      ),
    ).toBeHidden()
  })

  test('renders Readings chart card', async ({ page }) => {
    await expect(page.locator('.collapsible-card-title', { hasText: 'Readings' })).toBeVisible()
  })

  test('renders Daily averages chart card', async ({ page }) => {
    await expect(
      page.locator('.collapsible-card-title', { hasText: 'Daily averages' }),
    ).toBeVisible()
  })

  test('Recharts SVG renders in readings chart', async ({ page }) => {
    const chartSvg = page.locator('.recharts-wrapper svg[role="application"]').first()
    await expect(chartSvg).toBeVisible()
  })
})

test.describe('Blood pressure page empty state', () => {
  test('shows empty message when no BP data imported', async ({ page }) => {
    await page.goto('/')
    await navigateToTab(page, 'Blood pressure')
    await expect(
      page.getByText(
        /No blood pressure, heart-rate, or pressure-index readings in this range/,
      ),
    ).toBeVisible()
  })
})
