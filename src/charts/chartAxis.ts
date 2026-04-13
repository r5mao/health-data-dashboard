/**
 * Shared Recharts axis tick styling: smaller type, consistent color, spacing from the axis line.
 */
export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--text)',
} as const

/** Default Y-axis width for numeric charts (room for 3–4 digit ticks + padding). */
export const CHART_Y_AXIS_WIDTH = 48

/** Left chart margin: matches default Y-axis width + small gutter (single source for all charts). */
export const CHART_MARGIN_LEFT = CHART_Y_AXIS_WIDTH + 12

/** Number of x-axis time labels for numeric time domains (evenly spaced). */
export const TIME_AXIS_TICK_COUNT = 8

/** Min/max `t` from series points (for tick placement). */
export function timeDomainFromSeries(data: { t: number }[]): [number, number] | undefined {
  if (data.length === 0) return undefined
  const ts = data.map((d) => d.t)
  return [Math.min(...ts), Math.max(...ts)]
}

/** `count` timestamps at equal intervals from `min` through `max` (inclusive). */
export function evenlySpacedTimeTicks(
  min: number,
  max: number,
  count: number = TIME_AXIS_TICK_COUNT,
): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || count < 1) return []
  if (max < min) return []
  if (min === max) return [min]
  const n = Math.max(2, count)
  const step = (max - min) / (n - 1)
  return Array.from({ length: n }, (_, i) => min + i * step)
}

export function buildEvenTimeAxis(data: { t: number }[]): {
  ticks: number[] | undefined
  spanMs: number
} {
  const d = timeDomainFromSeries(data)
  if (!d) return { ticks: undefined, spanMs: 0 }
  return {
    ticks: evenlySpacedTimeTicks(d[0], d[1], TIME_AXIS_TICK_COUNT),
    spanMs: d[1] - d[0],
  }
}

export function buildEvenTimeAxisFromDomain(domain: [number, number] | undefined): {
  ticks: number[] | undefined
  spanMs: number
} {
  if (!domain) return { ticks: undefined, spanMs: 0 }
  const [min, max] = domain
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: undefined, spanMs: 0 }
  if (max < min) return { ticks: undefined, spanMs: 0 }
  if (min === max) return { ticks: [min], spanMs: 0 }
  return {
    ticks: evenlySpacedTimeTicks(min, max, TIME_AXIS_TICK_COUNT),
    spanMs: max - min,
  }
}

/**
 * Pads a numeric time `t` domain so the first/last bars are not centered past the plot edge
 * (Recharts centers bars on `t`, which otherwise clips into the Y-axis).
 */
export function padTimeDomainForBars(
  points: { t: number }[],
  opts?: { minPadMs?: number; padFraction?: number },
): [number, number] | undefined {
  if (points.length === 0) return undefined
  const ts = points.map((p) => p.t)
  const min = Math.min(...ts)
  const max = Math.max(...ts)
  const span = Math.max(max - min, 1)
  const frac = opts?.padFraction ?? 0.04
  const minPad = opts?.minPadMs ?? 3600000
  const pad = Math.max(span * frac, minPad)
  return [min - pad, max + pad]
}
