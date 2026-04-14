import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from '@/theme/themeStorage'

describe('resolveTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns light and dark directly', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('follows prefers-color-scheme when preference is system', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((q: string) => ({
        matches: q.includes('dark'),
        media: q,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    expect(resolveTheme('system')).toBe('dark')

    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    expect(resolveTheme('system')).toBe('light')
  })
})

describe('applyResolvedTheme', () => {
  it('sets data-theme on documentElement', () => {
    applyResolvedTheme('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    applyResolvedTheme('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})

describe('readStoredTheme / writeStoredTheme', () => {
  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY)
  })
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY)
  })

  it('round-trips valid preferences', () => {
    writeStoredTheme('dark')
    expect(readStoredTheme()).toBe('dark')
    writeStoredTheme('light')
    expect(readStoredTheme()).toBe('light')
  })

  it('defaults to system when missing or invalid', () => {
    expect(readStoredTheme()).toBe('system')
    localStorage.setItem(THEME_STORAGE_KEY, 'nope')
    expect(readStoredTheme()).toBe('system')
  })
})
