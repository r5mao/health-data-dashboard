import { describe, expect, it } from 'vitest'
import {
  parseCsvWithHeadersAfterPreamble,
  parseDurationToMinutes,
  parseNaiveTimestamp,
  sliceCsvAfterPreamble,
} from '@/import/csvUtils'

describe('parseNaiveTimestamp', () => {
  it('parses local wall time', () => {
    const t = parseNaiveTimestamp('2026-03-12 17:42:00')
    const d = new Date(t)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(12)
    expect(d.getHours()).toBe(17)
    expect(d.getMinutes()).toBe(42)
  })
})

describe('parseDurationToMinutes', () => {
  it('converts HH:MM:SS to minutes', () => {
    expect(parseDurationToMinutes('03:24:00')).toBe(204)
    expect(parseDurationToMinutes('00:23:00')).toBe(23)
    expect(parseDurationToMinutes('04:53:32')).toBe(294)
  })
})

describe('preamble', () => {
  it('skips user preamble for sleep CSV', () => {
    const raw = `User Name,
User Phone Number,
User Email,test@example.com
Sleep Duration,Deep Sleep Duration,Shallow Sleep Duration,Awakening Duration,Start Sleep Time,End Sleep Time,Data Source,Measuring Device
03:24:00,00:23:00,03:01:00,02:20:00,2026-04-08 18:26:00,2026-04-09 00:10:00,Non-User Input,BP DOCTOR FIT Y007
`
    const sliced = sliceCsvAfterPreamble(raw, [
      'sleep duration',
      'start sleep time',
    ])
    const { headers, rows } = parseCsvWithHeadersAfterPreamble(raw, [
      'sleep duration',
      'start sleep time',
    ])
    expect(sliced).toContain('Sleep Duration')
    expect(headers).toContain('Sleep Duration')
    expect(rows).toHaveLength(1)
    expect(rows[0]['Start Sleep Time']).toContain('2026-04-08')
  })

  it('handles header-only HRV export', () => {
    const raw = `User Name,
User Email,someone@example.com
HRV（RRI）,Measurement Time,Data Source,Measuring Device
`
    const { rows } = parseCsvWithHeadersAfterPreamble(raw, [
      'hrv',
      'measurement time',
    ])
    expect(rows).toHaveLength(0)
  })
})
