import { describe, expect, it } from 'vitest'
import {
  parseBloodPressureCsv,
  parseHeartRateCsv,
  parseStepCsv,
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

  it('skips user preamble before header row', () => {
    const csv = `User Name,
User Email,test@example.com
Systolic Pressure (mmHg),Diastolic Pressure (mmHg),Pulse (times/minute),Measurement Time,Data Source,Measuring Device
128,75,62,2026-02-11 21:01:22,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBloodPressureCsv(csv, 'BloodPressure_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].systolic).toBe(128)
  })
})

describe('parseStepCsv', () => {
  it('parses preamble and step rows', () => {
    const csv = `User Name,
User Phone Number,
User Email,sylviazy@yahoo.com
Steps,Measurement Time,Data Source,Measuring Device
7390,2026-04-10 00:00:00,Non-User Input,BP DOCTOR FIT Y007
7279,2026-04-09 21:59:38,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseStepCsv(csv, 'Step_Data.csv')
    expect(rows).toHaveLength(2)
    expect(rows[0].metricType).toBe('steps')
    expect(rows[0].value).toBe(7390)
    expect(rows[1].value).toBe(7279)
  })

  it('parses without preamble', () => {
    const csv = `Steps,Measurement Time,Data Source,Measuring Device
100,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseStepCsv(csv, 'Step_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(100)
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
