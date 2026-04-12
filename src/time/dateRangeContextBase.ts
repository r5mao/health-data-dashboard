import { createContext } from 'react'
import type { DateRangeContextValue } from '@/time/dateRangeTypes'

export const DateRangeContext = createContext<DateRangeContextValue | null>(null)
