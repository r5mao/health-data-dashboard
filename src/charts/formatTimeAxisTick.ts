import { format } from 'date-fns'

/** Format timestamp ticks based on how wide the visible window is (ms). Includes weekday. */
export function formatTimeAxisTick(ts: number, visibleSpanMs: number): string {
  if (!Number.isFinite(visibleSpanMs) || visibleSpanMs <= 0) {
    return format(ts, 'EEE, MMM d, yyyy, h:mm:ss a')
  }
  if (visibleSpanMs < 24 * 60 * 60 * 1000) {
    return format(ts, 'EEE h:mm a')
  }
  if (visibleSpanMs < 14 * 24 * 60 * 60 * 1000) {
    return format(ts, 'EEE MMM d, h:mm a')
  }
  return format(ts, 'EEE MMM d')
}
