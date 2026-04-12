import { useContext } from 'react'
import { DateRangeContext } from '@/time/dateRangeContextBase'
import type { DateRangeContextValue } from '@/time/dateRangeTypes'

export function useDateRange(): DateRangeContextValue {
  const c = useContext(DateRangeContext)
  if (!c) throw new Error('useDateRange outside provider')
  return c
}
