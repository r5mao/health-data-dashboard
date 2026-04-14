import { test, expect } from '@playwright/test'
import { applyAllDatePreset, importFixtures, navigateToTab } from './helpers'

test.describe('Activity page with data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, 'Step_Data.csv', 'Heat_Data.csv', 'Sport_Data.csv')
    await navigateToTab(page, 'Activity')
    await applyAllDatePreset(page)
  })

  test('does not show empty state', async ({ page }) => {
    await expect(page.getByText('No activity data in this range')).toBeHidden()
  })

  test('renders Steps chart card', async ({ page }) => {
    await expect(page.locator('.collapsible-card-title', { hasText: 'Steps' })).toBeVisible()
  })

  test('renders Calories chart card', async ({ page }) => {
    await expect(page.locator('.collapsible-card-title', { hasText: 'Calories' })).toBeVisible()
  })

  test('Recharts SVGs render with data', async ({ page }) => {
    const wrappers = page.locator('.recharts-wrapper')
    await expect(wrappers.first()).toBeVisible()
    const count = await wrappers.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('sport sessions table has rows', async ({ page }) => {
    const sportCard = page.locator('details.collapsible-card', {
      has: page.locator('.collapsible-card-title', { hasText: 'Sport' }),
    })
    await sportCard.locator('summary').click()
    const table = sportCard.locator('table.data-table')
    await expect(table).toBeVisible()
    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(2)
  })
})

test.describe('Activity page empty state', () => {
  test('shows empty message when no activity data', async ({ page }) => {
    await page.goto('/')
    await navigateToTab(page, 'Activity')
    await expect(page.getByText('No activity data in this range')).toBeVisible()
  })
})
