import type { ThemePreference } from '@/theme/themeStorage'
import { useTheme } from '@/theme/useTheme'

const options: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Auto (system)' },
]

export function ThemeControl() {
  const { preference, setPreference } = useTheme()

  return (
    <div className="theme-control">
      <label htmlFor="theme-select" className="theme-select-label">
        Theme
      </label>
      <select
        id="theme-select"
        className="theme-select"
        value={preference}
        onChange={(e) => setPreference(e.target.value as ThemePreference)}
        aria-label="Color theme"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
