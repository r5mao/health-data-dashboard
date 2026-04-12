import { ReferenceArea } from 'recharts'

/** ACC/AHA-style Stage 2 hypertension thresholds (mmHg). */
export const BP_STAGE2_SYSTOLIC = 140
export const BP_STAGE2_DIASTOLIC = 90
/** Upper Y bound for reference bands (Y-axis auto-domain extends as needed). */
export const BP_REFERENCE_Y_MAX = 400

/**
 * Soft horizontal bands behind BP lines (blue 90–140 / purple ≥140), matching chart line colors.
 */
export function BpStage2ReferenceBands() {
  return (
    <>
      <ReferenceArea
        y1={BP_STAGE2_DIASTOLIC}
        y2={BP_STAGE2_SYSTOLIC}
        fill="var(--bp-ref-dia-zone)"
        fillOpacity={1}
        strokeOpacity={0}
        ifOverflow="hidden"
      />
      <ReferenceArea
        y1={BP_STAGE2_SYSTOLIC}
        y2={BP_REFERENCE_Y_MAX}
        fill="var(--bp-ref-sys-zone)"
        fillOpacity={1}
        strokeOpacity={0}
        ifOverflow="hidden"
      />
    </>
  )
}
