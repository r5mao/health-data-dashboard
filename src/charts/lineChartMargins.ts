/**
 * Horizontal room for Recharts Brush side labels: they draw just outside the plot,
 * and the left/right label can extend past the inner edge (SVG clips negative x).
 */
export const LINE_CHART_MARGIN_WITH_BRUSH = {
  top: 8,
  right: 100,
  bottom: 14,
  left: 100,
} as const
