export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'health-dashboard-theme'

export function readStoredTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* ignore */
  }
  return 'system'
}

export function writeStoredTheme(pref: ThemePreference) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    /* ignore */
  }
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'light') return 'light'
  if (pref === 'dark') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyResolvedTheme(resolved: 'light' | 'dark') {
  document.documentElement.dataset.theme = resolved
}
