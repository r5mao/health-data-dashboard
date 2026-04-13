import { ReferenceLine } from 'recharts'

/** Stage 2 hypertension (mmHg). */
export const BP_STAGE2_SYSTOLIC = 140
export const BP_STAGE2_DIASTOLIC = 90
/** Severe / crisis-style thresholds (mmHg), common clinical cutoffs. */
export const BP_SEVERE_SYSTOLIC = 180
export const BP_SEVERE_DIASTOLIC = 120

/** Softer than data lines; longer gaps reduce visual noise. */
const DOTTED = '2 7'
const STROKE_W = 1
const REF_Z = 60

const lineBase = {
  strokeWidth: STROKE_W,
  strokeDasharray: DOTTED,
  strokeOpacity: 0.5,
  ifOverflow: 'visible' as const,
  zIndex: REF_Z,
}

function refLabel(text: string) {
  return {
    value: text,
    position: 'right' as const,
    fill: 'var(--bp-ref-label)',
    fontSize: 10,
    fontWeight: 500,
  }
}

/**
 * Horizontal dotted thresholds (behind data lines). Labels on the right identify stage vs severe and measurement.
 */
export function BpThresholdReferenceLines() {
  return (
    <>
      <ReferenceLine
        {...lineBase}
        y={BP_STAGE2_DIASTOLIC}
        stroke="var(--bp-ref-line-dia-stage2)"
        label={refLabel('Stage 2 · diastolic')}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_STAGE2_SYSTOLIC}
        stroke="var(--bp-ref-line-sys-stage2)"
        label={refLabel('Stage 2 · systolic')}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_SEVERE_DIASTOLIC}
        stroke="var(--bp-ref-line-dia-severe)"
        label={refLabel('Severe · diastolic')}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_SEVERE_SYSTOLIC}
        stroke="var(--bp-ref-line-sys-severe)"
        label={refLabel('Severe · systolic')}
      />
    </>
  )
}
