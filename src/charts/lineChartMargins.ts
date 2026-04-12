/**
 * Horizontal room for Recharts Brush side labels: they draw just outside the plot,
 * and the left/right label can extend past the inner edge (SVG clips negative x).
 * Extra top/bottom keeps Y-axis tick labels inside the SVG and off the X-axis corner.
 */
export const LINE_CHART_MARGIN_WITH_BRUSH = {
  top: 14,
  right: 100,
  bottom: 26,
  left: 104,
} as const
