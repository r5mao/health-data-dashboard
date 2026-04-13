import type { ComponentProps, CSSProperties } from 'react'
import { Legend } from 'recharts'

/** Shared compact legend: top-right row, smaller type (matches BP / Activity / Recovery tabs). */
export const CHART_LEGEND_WRAPPER_STYLE = {
  fontSize: 11,
  paddingBottom: 2,
} as const

function mergeWrapperStyle(
  a: typeof CHART_LEGEND_WRAPPER_STYLE,
  b: ComponentProps<typeof Legend>['wrapperStyle'],
): CSSProperties {
  return { ...a, ...(b && typeof b === 'object' && !Array.isArray(b) ? b : {}) }
}

export type ChartLegendTopRightProps = Omit<
  ComponentProps<typeof Legend>,
  'verticalAlign' | 'align' | 'layout'
>

export function ChartLegendTopRight({
  iconSize = 10,
  wrapperStyle,
  ...rest
}: ChartLegendTopRightProps) {
  return (
    <Legend
      verticalAlign="top"
      align="right"
      layout="horizontal"
      iconSize={iconSize}
      wrapperStyle={mergeWrapperStyle(CHART_LEGEND_WRAPPER_STYLE, wrapperStyle)}
      {...rest}
    />
  )
}
