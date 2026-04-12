import { describe, expect, it } from 'vitest'
import { parseBpDoctorFitFile } from '@/import/sources/bpDoctorFit/index'

describe('parseBpDoctorFitFile routing', () => {
  it('routes BloodPressure_Data.csv to blood pressure parser, not generic pressure', () => {
    const csv = `Systolic Pressure (mmHg),Diastolic Pressure (mmHg),Pulse (times/minute),Measurement Time,Data Source,Measuring Device
128,75,62,2026-02-11 21:01:22,Non-User Input,BP DOCTOR FIT Y007
`
    const bundle = parseBpDoctorFitFile('BloodPressure_Data.csv', csv)
    expect(bundle.bloodPressure).toHaveLength(1)
    expect(bundle.timeseries).toHaveLength(0)
    expect(bundle.bloodPressure[0].systolic).toBe(128)
  })
})
