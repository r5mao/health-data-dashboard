import { format } from 'date-fns'
import { Brush } from 'recharts'

type Props = {
  height?: number
  onChange?: (s: { startIndex: number; endIndex: number }) => void
  /** Data field for start/end labels (bucket or sample time, usually `t`). */
  dataKey?: string
  tickFormatter?: (value: unknown, index: number) => string | number
}

/** Weekday abbrev + day + month abbrev + time (fits brush gutters with chart margins). */
function defaultTimeLabel(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return format(value, 'EEE d MMM, h:mm a')
  }
  if (value == null) return ''
  return String(value)
}

/**
 * Range strip under the chart: drag the handles (or the shaded band) to zoom the chart
 * above to a shorter slice of the same series. Side labels show that slice’s start/end time.
 */
export function ChartBrush({
  height = 36,
  onChange,
  dataKey = 't',
  tickFormatter,
}: Props) {
  return (
    <Brush
      className="chart-brush"
      height={height}
      stroke="var(--border)"
      fill="var(--code-bg)"
      travellerWidth={8}
      dataKey={dataKey}
      tickFormatter={tickFormatter ?? ((v) => defaultTimeLabel(v))}
      alwaysShowText
      aria-label="Time zoom: drag handles or shaded band to narrow what the chart above shows"
      onChange={onChange}
    />
  )
}
