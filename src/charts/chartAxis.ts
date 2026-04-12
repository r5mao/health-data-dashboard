/**
 * Shared Recharts axis tick styling: smaller type, consistent color, spacing from the axis line.
 */
export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: 'var(--text)',
} as const

/** Default Y-axis width for numeric charts (room for 3–4 digit ticks + padding). */
export const CHART_Y_AXIS_WIDTH = 48
