import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { endOfDay, endOfYear, startOfDay, startOfYear, subDays } from 'date-fns'
import { getDataTimeExtent } from '@/db/repository'
import { DateRangeContext } from '@/time/dateRangeContextBase'
import type { DateRangeValue, PresetId } from '@/time/dateRangeTypes'

function clampRange(
  r: DateRangeValue,
  extent: { min: number; max: number } | null,
): DateRangeValue {
  if (!extent) return r
  const start = Math.max(r.start, extent.min)
  const end = Math.min(r.end, extent.max)
  if (start <= end) {
    return { start, end }
  }
  // Default window (e.g. last 30 days) may not overlap stored data at all.
  return {
    start: extent.min,
    end: endOfDay(extent.max).getTime(),
  }
}

export function DateRangeProvider({
  children,
  refreshKey,
}: {
  children: React.ReactNode
  refreshKey: number
}) {
  const [dataExtent, setDataExtent] = useState<{
    min: number
    max: number
  } | null>(null)
  const [range, setRangeState] = useState<DateRangeValue>(() => {
    const end = endOfDay(Date.now()).getTime()
    const start = startOfDay(subDays(end, 29)).getTime()
    return { start, end }
  })
  const [activePreset, setActivePreset] = useState<PresetId | null>('30d')

  const refreshExtent = useCallback(async () => {
    const e = await getDataTimeExtent()
    setDataExtent(e)
    if (e) {
      setRangeState((prev) => clampRange(prev, e))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const e = await getDataTimeExtent()
      if (cancelled) return
      setDataExtent(e)
      if (e) {
        setRangeState((prev) => clampRange(prev, e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const setRange = useCallback(
    (r: DateRangeValue) => {
      setRangeState(dataExtent ? clampRange(r, dataExtent) : r)
    },
    [dataExtent],
  )

  const applyPreset = useCallback(
    (id: PresetId) => {
      const anchorEnd = dataExtent?.max ?? Date.now()
      const end = endOfDay(anchorEnd).getTime()
      let next: DateRangeValue

      switch (id) {
        case '2d':
          next = {
            start: startOfDay(subDays(end, 1)).getTime(),
            end,
          }
          break
        case '7d':
          next = {
            start: startOfDay(subDays(end, 6)).getTime(),
            end,
          }
          break
        case '30d':
          next = {
            start: startOfDay(subDays(end, 29)).getTime(),
            end,
          }
          break
        case '60d':
          next = {
            start: startOfDay(subDays(end, 59)).getTime(),
            end,
          }
          break
        case '90d':
          next = {
            start: startOfDay(subDays(end, 89)).getTime(),
            end,
          }
          break
        case 'year':
          next = {
            start: startOfYear(end).getTime(),
            end: endOfYear(end).getTime(),
          }
          break
        case 'all':
          if (dataExtent) {
            next = {
              start: dataExtent.min,
              end: endOfDay(dataExtent.max).getTime(),
            }
          } else {
            next = {
              start: startOfDay(subDays(end, 29)).getTime(),
              end,
            }
          }
          break
        default:
          return
      }

      setActivePreset(id)
      setRangeState(clampRange(next, dataExtent))
    },
    [dataExtent],
  )

  const breadcrumbLabel = useMemo(() => {
    if (!dataExtent) return 'Selected range'
    const r = range
    if (r.start <= dataExtent.min && r.end >= endOfDay(dataExtent.max).getTime()) {
      return 'All data'
    }
    const d0 = new Date(r.start)
    const d1 = new Date(r.end)
    return `${d0.toLocaleDateString()} — ${d1.toLocaleDateString()}`
  }, [dataExtent, range])

  const value = useMemo(
    () => ({
      range,
      dataExtent,
      setRange,
      applyPreset,
      refreshExtent,
      breadcrumbLabel,
      activePreset,
    }),
    [
      range,
      dataExtent,
      setRange,
      applyPreset,
      refreshExtent,
      breadcrumbLabel,
      activePreset,
    ],
  )

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  )
}
