import { format } from 'date-fns'

/** Full calendar date + time with 12-hour clock (tables, tooltips, overview). */
export function formatDateTime12(ts: number | Date): string {
  return format(ts, 'MMM d, yyyy, h:mm:ss a')
}
