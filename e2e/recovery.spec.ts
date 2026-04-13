import { test, expect } from '@playwright/test'
import { importFixtures, navigateToTab } from './helpers'

test.describe('Recovery page with data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await importFixtures(page, 'BloodOxygen_Data.csv', 'Breathing_Data.csv', 'Sleep_Data.csv')
    await navigateToTab(page, 'Recovery')
  })

  test('does not show empty state', async ({ page }) => {
    await expect(page.getByText('No recovery metrics in this range')).toBeHidden()
  })

  test('renders SpO2 chart card', async ({ page }) => {
    await expect(page.locator('.collapsible-card-title', { hasText: /SpO/i })).toBeVisible()
  })

  test('renders Breathing chart card', async ({ page }) => {
    await expect(page.locator('.collapsible-card-title', { hasText: 'Breathing' })).toBeVisible()
  })

  test('Recharts SVGs render in visible chart cards', async ({ page }) => {
    const openCards = page.locator('details.collapsible-card[open] .recharts-wrapper svg[role="application"]')
    await expect(openCards.first()).toBeVisible({ timeout: 15_000 })
    const count = await openCards.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('sleep sessions table has rows', async ({ page }) => {
    const sleepTableCard = page.locator('details.collapsible-card', {
      has: page.locator('.collapsible-card-title', { hasText: /Sleep sessions/i }),
    })
    await sleepTableCard.locator('summary').click()
    const table = sleepTableCard.locator('table.data-table')
    await expect(table).toBeVisible()
    const rows = table.locator('tbody tr')
    await expect(rows).toHaveCount(2)
  })

  test('sleep chart cards exist', async ({ page }) => {
    await expect(
      page.locator('.collapsible-card-title', { hasText: /Sleep windows/i }),
    ).toBeVisible()
    await expect(
      page.locator('.collapsible-card-title', { hasText: /Sleep stage/i }),
    ).toBeVisible()
  })
})

test.describe('Recovery page empty state', () => {
  test('shows empty message when no recovery data', async ({ page }) => {
    await page.goto('/')
    await navigateToTab(page, 'Recovery')
    await expect(page.getByText('No recovery metrics in this range')).toBeVisible()
  })
})
