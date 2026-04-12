import { format } from 'date-fns'
import type { SleepSession } from '@/types/canonical'

export function sortSessionsByEndTime(sessions: SleepSession[]): SleepSession[] {
  return [...sessions].sort((a, b) => a.endTime - b.endTime)
}

export type SleepTimelineRow = {
  row: number
  tMid: number
  startTime: number
  endTime: number
  sleepMinutes: number
  device: string
  rowLabel: string
  /** Constant for ZAxis point size (tooltip hit target). */
  z: number
}

export function toSleepTimelineRows(sessions: SleepSession[]): SleepTimelineRow[] {
  const sorted = sortSessionsByEndTime(sessions)
  return sorted.map((s, row) => ({
    row,
    tMid: (s.startTime + s.endTime) / 2,
    startTime: s.startTime,
    endTime: s.endTime,
    sleepMinutes: s.sleepMinutes,
    device: s.device,
    rowLabel: format(s.endTime, 'EEE MMM d'),
    z: 1,
  }))
}

export type SleepStackRow = {
  label: string
  deep: number
  light: number
  awake: number
  endTime: number
}

export function toSleepStackRows(sessions: SleepSession[]): SleepStackRow[] {
  const sorted = sortSessionsByEndTime(sessions)
  return sorted.map((s) => ({
    label: format(s.endTime, 'MMM d, HH:mm'),
    deep: s.deepMinutes,
    light: s.lightMinutes,
    awake: s.awakeMinutes,
    endTime: s.endTime,
  }))
}
