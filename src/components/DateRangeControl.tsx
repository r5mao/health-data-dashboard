import type { PresetId } from '@/time/dateRangeTypes'
import { useDateRange } from '@/time/useDateRange'

const presets: { id: PresetId; label: string }[] = [
  { id: '2d', label: '2d' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'all', label: 'All' },
]

export function DateRangeControl() {
  const { applyPreset, breadcrumbLabel, activePreset } = useDateRange()

  return (
    <div className="date-range-bar">
      <span className="breadcrumb">{breadcrumbLabel}</span>
      <div className="preset-row">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`preset-btn${activePreset === p.id ? ' active' : ''}`}
            onClick={() => applyPreset(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
