import { ReferenceLine } from 'recharts'

/** Stage 2 hypertension (mmHg). */
export const BP_STAGE2_SYSTOLIC = 140
export const BP_STAGE2_DIASTOLIC = 90
/** Severe / crisis-style thresholds (mmHg), common clinical cutoffs. */
export const BP_SEVERE_SYSTOLIC = 180
export const BP_SEVERE_DIASTOLIC = 120

const DOTTED = '4 4'
const LINE_W = 1.5

const lineCommon = {
  strokeWidth: LINE_W,
  strokeDasharray: DOTTED,
  /** Keep lines when Y domain is auto and a threshold sits at/near the edge. */
  ifOverflow: 'visible' as const,
}

/**
 * Horizontal dotted threshold lines: Stage 2 (purple 140, blue 90) and severe (darker hues 180, 120).
 */
export function BpThresholdReferenceLines() {
  return (
    <>
      <ReferenceLine
        y={BP_STAGE2_DIASTOLIC}
        stroke="var(--bp-ref-dia-stage2)"
        {...lineCommon}
      />
      <ReferenceLine
        y={BP_STAGE2_SYSTOLIC}
        stroke="var(--bp-ref-sys-stage2)"
        {...lineCommon}
      />
      <ReferenceLine
        y={BP_SEVERE_DIASTOLIC}
        stroke="var(--bp-ref-dia-severe)"
        {...lineCommon}
      />
      <ReferenceLine
        y={BP_SEVERE_SYSTOLIC}
        stroke="var(--bp-ref-sys-severe)"
        {...lineCommon}
      />
    </>
  )
}
