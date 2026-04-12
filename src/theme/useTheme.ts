import { useCallback, useEffect, useState } from 'react'
import {
  applyResolvedTheme,
  readStoredTheme,
  resolveTheme,
  type ThemePreference,
  writeStoredTheme,
} from '@/theme/themeStorage'

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    readStoredTheme(),
  )

  useEffect(() => {
    applyResolvedTheme(resolveTheme(preference))
  }, [preference])

  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyResolvedTheme(resolveTheme('system'))
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [preference])

  const setPreference = useCallback((pref: ThemePreference) => {
    writeStoredTheme(pref)
    setPreferenceState(pref)
    applyResolvedTheme(resolveTheme(pref))
  }, [])

  return {
    preference,
    setPreference,
    resolved: resolveTheme(preference),
  }
}
