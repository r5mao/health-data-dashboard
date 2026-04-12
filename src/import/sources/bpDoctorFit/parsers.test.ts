import { describe, expect, it } from 'vitest'
import {
  parseBloodOxygenCsv,
  parseBloodPressureCsv,
  parseBreathingCsv,
  parseHeartRateCsv,
  parseHeatCsv,
  parsePressureCsv,
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

  it('skips user preamble before header row', () => {
    const csv = `User Name,
User Email,test@example.com
Heart Rate (times/minute),Measurement Time,Data Source,Measuring Device
73,2026-03-12 17:42:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseHeartRateCsv(csv, 'HeartRate_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(73)
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

describe('parseHeatCsv', () => {
  it('skips user preamble before header row', () => {
    const csv = `User Name,
User Email,test@example.com
Calories Burned (kcal),Measurement Time,Data Source,Measuring Device
120,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseHeatCsv(csv, 'Heat_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].metricType).toBe('calories')
    expect(rows[0].value).toBe(120)
  })

  it('parses without preamble', () => {
    const csv = `Calories Burned (kcal),Measurement Time,Data Source,Measuring Device
99,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseHeatCsv(csv, 'Heat_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(99)
  })
})

describe('parsePressureCsv', () => {
  it('skips user preamble before header row', () => {
    const csv = `User Name,
User Email,test@example.com
Pressure,Measurement Time,Data Source,Measuring Device
42,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parsePressureCsv(csv, 'Pressure_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].metricType).toBe('pressure')
    expect(rows[0].value).toBe(42)
  })

  it('parses without preamble', () => {
    const csv = `Pressure,Measurement Time,Data Source,Measuring Device
10,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parsePressureCsv(csv, 'Pressure_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(10)
  })
})

describe('parseBloodOxygenCsv', () => {
  it('skips user preamble before header row', () => {
    const csv = `User Name,
User Email,test@example.com
Blood Oxygen (%),Measurement Time,Data Source,Measuring Device
98,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBloodOxygenCsv(csv, 'BloodOxygen_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].metricType).toBe('oxygen')
    expect(rows[0].value).toBe(98)
  })

  it('parses without preamble', () => {
    const csv = `Blood Oxygen (%),Measurement Time,Data Source,Measuring Device
97,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBloodOxygenCsv(csv, 'BloodOxygen_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(97)
  })
})

describe('parseBreathingCsv', () => {
  it('skips user preamble before header row (matches real Breathing_Data.csv)', () => {
    const csv = `User Name,
User Email,test@example.com
Breathing (times/minute),Measurement Time,Data Source,Measuring Device
16,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBreathingCsv(csv, 'Breathing_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].metricType).toBe('breathing')
    expect(rows[0].value).toBe(16)
  })

  it('parses without preamble', () => {
    const csv = `Breathing (times/minute),Measurement Time,Data Source,Measuring Device
18,2026-04-10 12:00:00,Non-User Input,BP DOCTOR FIT Y007
`
    const rows = parseBreathingCsv(csv, 'Breathing_Data.csv')
    expect(rows).toHaveLength(1)
    expect(rows[0].value).toBe(18)
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
