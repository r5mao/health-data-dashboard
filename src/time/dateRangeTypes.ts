export type DateRangeValue = { start: number; end: number }

export type PresetId =
  | '2d'
  | '7d'
  | '30d'
  | '60d'
  | '90d'
  | 'year'
  | 'all'

export type DateRangeContextValue = {
  range: DateRangeValue
  dataExtent: { min: number; max: number } | null
  setRange: (r: DateRangeValue) => void
  applyPreset: (id: PresetId) => void
  refreshExtent: () => Promise<void>
  breadcrumbLabel: string
  /** Last preset applied from the toolbar; matches default initial window (`30d`). */
  activePreset: PresetId | null
}
