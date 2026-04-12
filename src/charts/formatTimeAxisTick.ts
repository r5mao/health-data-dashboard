import { format } from 'date-fns'

/** Format timestamp ticks based on how wide the visible window is (ms). Includes weekday. */
export function formatTimeAxisTick(ts: number, visibleSpanMs: number): string {
  if (!Number.isFinite(visibleSpanMs) || visibleSpanMs <= 0) {
    return format(ts, 'EEE, PPpp')
  }
  if (visibleSpanMs < 24 * 60 * 60 * 1000) {
    return format(ts, 'EEE HH:mm')
  }
  if (visibleSpanMs < 14 * 24 * 60 * 60 * 1000) {
    return format(ts, 'EEE MMM d, HH:mm')
  }
  return format(ts, 'EEE MMM d')
}
