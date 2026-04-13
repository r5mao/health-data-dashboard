import { test, expect } from '@playwright/test'

test.describe('Smoke tests', () => {
  test('loads the app with correct title and heading', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('Health Dashboard')
    await expect(page.getByRole('heading', { level: 1, name: 'Health Dashboard' })).toBeVisible()
  })

  test('displays all five tab buttons', async ({ page }) => {
    await page.goto('/')
    const tabs = ['Overview', 'Blood pressure', 'Activity', 'Recovery', 'Import']
    for (const label of tabs) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })

  test('has a theme control dropdown', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByLabel('Color theme')).toBeVisible()
  })
})
