import { Brush } from 'recharts'

type Props = {
  height?: number
  onChange?: (s: { startIndex: number; endIndex: number }) => void
}

/** Range slider below the chart: drag handles to zoom the X axis. */
export function ChartBrush({ height = 32, onChange }: Props) {
  return (
    <Brush
      height={height}
      stroke="var(--border)"
      fill="var(--code-bg)"
      travellerWidth={6}
      aria-label="Zoom chart by time range"
      onChange={onChange}
    />
  )
}
