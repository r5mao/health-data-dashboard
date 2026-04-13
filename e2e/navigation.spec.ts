import { test, expect } from '@playwright/test'
import { navigateToTab } from './helpers'

const tabsAndHeadings = [
  { tab: 'Overview', heading: 'Overview' },
  { tab: 'Blood pressure', heading: 'Blood pressure' },
  { tab: 'Activity', heading: 'Activity' },
  { tab: 'Recovery', heading: 'Recovery' },
  { tab: 'Import', heading: 'Import' },
]

test.describe('Tab navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  for (const { tab, heading } of tabsAndHeadings) {
    test(`navigates to "${tab}" tab and shows correct heading`, async ({ page }) => {
      await navigateToTab(page, tab)
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
    })
  }

  test('hides date range toolbar on Import tab', async ({ page }) => {
    await navigateToTab(page, 'Blood pressure')
    await expect(page.locator('.date-range-bar')).toBeVisible()

    await navigateToTab(page, 'Import')
    await expect(page.locator('.date-range-bar')).toBeHidden()
  })

  test('shows date range toolbar on chart tabs (not Overview)', async ({ page }) => {
    await navigateToTab(page, 'Overview')
    await expect(page.locator('.date-range-bar')).toBeHidden()

    for (const tab of ['Blood pressure', 'Activity', 'Recovery']) {
      await navigateToTab(page, tab)
      await expect(page.locator('.date-range-bar')).toBeVisible()
    }
  })
})
