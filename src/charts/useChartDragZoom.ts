import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ChartMouseEvent = { activeLabel?: string | number }

/**
 * Drag-to-zoom for Recharts numeric-axis charts.
 *
 * Returns filtered data, selection-overlay coordinates, chart event handlers,
 * and a reset function. When zoomed the caller should hide the Brush and show
 * a "Reset zoom" affordance instead.
 */
export function useChartDragZoom<T extends { t: number }>(
  series: T[],
  resetKey: string | number,
) {
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)
  const [selArea, setSelArea] = useState<{ x1: number; x2: number } | null>(null)
  const dragRef = useRef<{ start: number; end: number } | null>(null)

  useEffect(() => {
    setZoomDomain(null)
    dragRef.current = null
    setSelArea(null)
  }, [resetKey])

  const onMouseDown = useCallback((e: ChartMouseEvent) => {
    if (e.activeLabel == null) return
    const v = Number(e.activeLabel)
    if (!Number.isFinite(v)) return
    dragRef.current = { start: v, end: v }
    setSelArea({ x1: v, x2: v })
  }, [])

  const onMouseMove = useCallback((e: ChartMouseEvent) => {
    if (!dragRef.current) return
    if (e.activeLabel == null) return
    const v = Number(e.activeLabel)
    if (!Number.isFinite(v)) return
    dragRef.current.end = v
    setSelArea({ x1: dragRef.current.start, x2: v })
  }, [])

  const onMouseUp = useCallback(() => {
    const d = dragRef.current
    dragRef.current = null
    setSelArea(null)
    if (!d) return
    const lo = Math.min(d.start, d.end)
    const hi = Math.max(d.start, d.end)
    if (lo < hi) setZoomDomain([lo, hi])
  }, [])

  const cancelDrag = useCallback(() => {
    dragRef.current = null
    setSelArea(null)
  }, [])

  const resetZoom = useCallback(() => {
    setZoomDomain(null)
    dragRef.current = null
    setSelArea(null)
  }, [])

  const zoomedData = useMemo(
    () =>
      zoomDomain
        ? series.filter((d) => d.t >= zoomDomain[0] && d.t <= zoomDomain[1])
        : series,
    [series, zoomDomain],
  )

  const visibleSpanMs = useMemo(() => {
    if (zoomDomain) return zoomDomain[1] - zoomDomain[0]
    if (series.length < 2) return 0
    return series[series.length - 1].t - series[0].t
  }, [zoomDomain, series])

  return {
    zoomedData,
    zoomDomain,
    isZoomed: zoomDomain != null,
    selArea,
    visibleSpanMs,
    chartHandlers: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave: cancelDrag,
    },
    resetZoom,
  }
}
