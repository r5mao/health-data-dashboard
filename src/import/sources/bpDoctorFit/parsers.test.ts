import { describe, expect, it } from 'vitest'
import {
  parseBloodPressureCsv,
  parseHeartRateCsv,
  parseWeightCsv,
} from '@/import/sources/bpDoctorFit/parsers'

describe('parseHeartRateCsv', () => {
  it('parses sample row', () => {
    const csv = `Heart Rate (times/minute),Measurement Time,Data Source,Measuring Device
73,2026-03-12 17:42:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseHeartRateCsv(csv, 'HeartRate_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].metricType).toBe('heart_rate')
    expect(rows[0].value).toBe(73)
    expect(rows[0].device).toContain('BP DOCTOR')
  })
})

describe('parseBloodPressureCsv', () => {
  it('parses systolic/diastolic/pulse', () => {
    const csv = `Systolic Pressure (mmHg),Diastolic Pressure (mmHg),Pulse (times/minute),Measurement Time,Data Source,Measuring Device
128,75,62,2026-02-11 21:01:22,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBloodPressureCsv(csv, 'BloodPressure_Data-10.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].systolic).toBe(128)
    expect(rows[0].diastolic).toBe(75)
    expect(rows[0].pulse).toBe(62)
  })
})

describe('parseWeightCsv', () => {
  it('parses preamble and single weight row', () => {
    const csv = `User Name,
User Phone Number,
User Email,sylviazy@yahoo.com
Weight (kg),Measurement Time,Data Source,Measuring Device
58.900,2026-02-11 20:43:14,User Input,
`
    const rows = parseWeightCsv(csv, 'Weight_Data-8.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].weightKg).toBeCloseTo(58.9)
  })
})
