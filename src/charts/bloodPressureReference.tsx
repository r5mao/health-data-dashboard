import { ReferenceLine } from 'recharts'

/** Stage 2 hypertension (mmHg). */
export const BP_STAGE2_SYSTOLIC = 140
export const BP_STAGE2_DIASTOLIC = 90
/** Severe / crisis-style thresholds (mmHg), common clinical cutoffs. */
export const BP_SEVERE_SYSTOLIC = 180
export const BP_SEVERE_DIASTOLIC = 120

const DOTTED = '4 4'
const STROKE_W = 1.5
const REF_Z = 60

const lineBase = {
  strokeWidth: STROKE_W,
  strokeDasharray: DOTTED,
  strokeOpacity: 0.95,
  ifOverflow: 'visible' as const,
  zIndex: REF_Z,
}

function refLabel(text: string, fillVar: string) {
  return {
    value: text,
    position: 'right' as const,
    fill: fillVar,
    fontSize: 10,
    fontWeight: 500,
  }
}

/** Label text: diastolic = blue, systolic = purple (same hues for Stage 2 and Severe). */
const LABEL_DIA = 'var(--bp-ref-label-dia)'
const LABEL_SYS = 'var(--bp-ref-label-sys)'

/**
 * Dotted blue/purple thresholds (behind data lines). Severe strokes are darker; labels stay series blue/purple.
 */
export function BpThresholdReferenceLines() {
  return (
    <>
      <ReferenceLine
        {...lineBase}
        y={BP_STAGE2_DIASTOLIC}
        stroke="var(--bp-ref-dia-stage2)"
        label={refLabel('Stage 2 · diastolic', LABEL_DIA)}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_STAGE2_SYSTOLIC}
        stroke="var(--bp-ref-sys-stage2)"
        label={refLabel('Stage 2 · systolic', LABEL_SYS)}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_SEVERE_DIASTOLIC}
        stroke="var(--bp-ref-dia-severe)"
        label={refLabel('Severe · diastolic', LABEL_DIA)}
      />
      <ReferenceLine
        {...lineBase}
        y={BP_SEVERE_SYSTOLIC}
        stroke="var(--bp-ref-sys-severe)"
        label={refLabel('Severe · systolic', LABEL_SYS)}
      />
    </>
  )
}
