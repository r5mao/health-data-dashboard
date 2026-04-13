/**
 * Shared Recharts axis tick styling: smaller type, consistent color, spacing from the axis line.
 */
export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--text)',
} as const

/** Default Y-axis width for numeric charts (room for 3–4 digit ticks + padding). */
export const CHART_Y_AXIS_WIDTH = 48

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
