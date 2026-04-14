import { describe, expect, it } from 'vitest'
import {
  getCell,
  normalizeHeaderCell,
  parseCsvWithHeaders,
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

  it('trims whitespace', () => {
    expect(parseNaiveTimestamp('  2026-01-01 00:00:00  ')).toBe(
      parseNaiveTimestamp('2026-01-01 00:00:00'),
    )
  })

  it('throws on invalid format', () => {
    expect(() => parseNaiveTimestamp('2026-01-01T00:00:00')).toThrow(/Invalid timestamp/)
    expect(() => parseNaiveTimestamp('not-a-date')).toThrow(/Invalid timestamp/)
  })
})

describe('parseDurationToMinutes', () => {
  it('converts HH:MM:SS to minutes', () => {
    expect(parseDurationToMinutes('03:24:00')).toBe(204)
    expect(parseDurationToMinutes('00:23:00')).toBe(23)
    expect(parseDurationToMinutes('04:53:32')).toBe(294)
  })

  it('throws when segments are wrong length or not numeric', () => {
    expect(() => parseDurationToMinutes('1:2')).toThrow(/Invalid duration/)
    expect(() => parseDurationToMinutes('ab:00:00')).toThrow(/Invalid duration/)
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

  it('throws when preamble anchors are missing', () => {
    const raw = 'a,b\nc,d\n'
    expect(() => sliceCsvAfterPreamble(raw, ['missing', 'anchors'])).toThrow(
      /Could not find header row/,
    )
  })
})

describe('normalizeHeaderCell', () => {
  it('NFKC-normalizes and lowercases', () => {
    expect(normalizeHeaderCell('  HRV（RRI）  ')).toContain('hrv')
    expect(normalizeHeaderCell('Foo')).toBe('foo')
  })
})

describe('parseCsvWithHeaders', () => {
  it('returns empty headers and rows for blank input', () => {
    expect(parseCsvWithHeaders('')).toEqual({ headers: [], rows: [] })
    expect(parseCsvWithHeaders('\n\n')).toEqual({ headers: [], rows: [] })
  })

  it('maps rows to header keys', () => {
    const { headers, rows } = parseCsvWithHeaders('A,B\n1,2\n3,4\n')
    expect(headers).toEqual(['A', 'B'])
    expect(rows).toEqual([{ A: '1', B: '2' }, { A: '3', B: '4' }])
  })
})

describe('getCell', () => {
  it('matches exact normalized header names', () => {
    const row = { 'Systolic Pressure': '120' }
    expect(getCell(row, 'systolic pressure')).toBe('120')
  })

  it('falls back to substring match', () => {
    const row = { 'Avg HR (bpm)': '72' }
    expect(getCell(row, 'hr')).toBe('72')
  })

  it('returns empty string when nothing matches', () => {
    expect(getCell({ x: '1' }, 'missing')).toBe('')
  })
})
