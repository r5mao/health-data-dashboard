import { format } from 'date-fns'

/** Format timestamp ticks based on how wide the visible window is (ms). */
export function formatTimeAxisTick(ts: number, visibleSpanMs: number): string {
  if (!Number.isFinite(visibleSpanMs) || visibleSpanMs <= 0) {
    return format(ts, 'PPpp')
  }
  if (visibleSpanMs < 24 * 60 * 60 * 1000) {
    return format(ts, 'HH:mm')
  }
  if (visibleSpanMs < 14 * 24 * 60 * 60 * 1000) {
    return format(ts, 'MMM d HH:mm')
  }
  return format(ts, 'MMM d')
}
