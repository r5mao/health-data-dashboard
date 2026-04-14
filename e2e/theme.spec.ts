import { test, expect } from '@playwright/test'

test.describe('Theme control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('selecting Dark sets data-theme on the document root', async ({ page }) => {
    await page.locator('#theme-select').selectOption('dark')
    await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe(
      'dark',
    )
  })

  test('selecting Light sets data-theme to light', async ({ page }) => {
    await page.locator('#theme-select').selectOption('light')
    await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe(
      'light',
    )
  })

  test('Auto uses resolved light or dark', async ({ page }) => {
    await page.locator('#theme-select').selectOption('system')
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(theme === 'light' || theme === 'dark').toBe(true)
  })
})
