import { useTheme } from '@/theme/useTheme'

export function ThemeControl() {
  const { preference, setPreference } = useTheme()

  return (
    <div
      className="theme-control"
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        className={`theme-btn${preference === 'light' ? ' active' : ''}`}
        aria-pressed={preference === 'light'}
        onClick={() => setPreference('light')}
      >
        Light
      </button>
      <button
        type="button"
        className={`theme-btn${preference === 'dark' ? ' active' : ''}`}
        aria-pressed={preference === 'dark'}
        onClick={() => setPreference('dark')}
      >
        Dark
      </button>
      <button
        type="button"
        className={`theme-btn${preference === 'system' ? ' active' : ''}`}
        aria-pressed={preference === 'system'}
        onClick={() => setPreference('system')}
      >
        Auto
      </button>
    </div>
  )
}
