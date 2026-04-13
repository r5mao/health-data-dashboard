import { type Page, expect } from '@playwright/test'
import path from 'node:path'

const FIXTURES_DIR = path.join(import.meta.dirname, 'fixtures')

export function fixturePath(...filenames: string[]): string[] {
  return filenames.map((f) => path.join(FIXTURES_DIR, f))
}

export const ALL_FIXTURES = [
  'BloodPressure_Data.csv',
  'HeartRate_Data.csv',
  'Step_Data.csv',
  'Heat_Data.csv',
  'BloodOxygen_Data.csv',
  'Breathing_Data.csv',
  'Weight_Data.csv',
  'Sleep_Data.csv',
  'Sport_Data.csv',
]

export async function navigateToTab(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click()
}

export async function importFixtures(page: Page, ...filenames: string[]) {
  await navigateToTab(page, 'Import')
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(fixturePath(...filenames))
  await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 15_000 })
}

export async function getKpiValue(page: Page, title: string): Promise<string> {
  const card = page.locator('.kpi', { has: page.locator('.kpi-title', { hasText: title }) })
  return (await card.locator('.kpi-value').textContent()) ?? ''
}
