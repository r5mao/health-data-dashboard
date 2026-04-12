import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * Tracks Recharts Brush selection and the visible time span (ms) for tick formatting.
 * Pass a `resetKey` that changes when range/data/granularity changes so zoom resets.
 */
export function useBrushTimeSpan<T extends { t: number }>(
  series: T[],
  resetKey: string | number,
) {
  const [brushIdx, setBrushIdx] = useState<{
    startIndex: number
    endIndex: number
  } | null>(null)

  useEffect(() => {
    setBrushIdx(null)
  }, [resetKey])

  const visibleSpanMs = useMemo(() => {
    if (series.length === 0) return 0
    const s = brushIdx?.startIndex ?? 0
    const e = brushIdx?.endIndex ?? series.length - 1
    const lo = Math.min(s, e)
    const hi = Math.max(s, e)
    const t0 = series[lo]?.t
    const t1 = series[hi]?.t
    if (t0 == null || t1 == null) return 0
    return Math.max(0, t1 - t0)
  }, [series, brushIdx])

  const onBrushChange = useCallback(
    (s: { startIndex: number; endIndex: number }) => {
      setBrushIdx({ startIndex: s.startIndex, endIndex: s.endIndex })
    },
    [],
  )

  return { visibleSpanMs, onBrushChange }
}
