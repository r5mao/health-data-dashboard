/** Decorative tab icons (16×16); keep in sync with stroke weight for visual balance. */
const icon = { className: 'tab-icon-svg' as const, width: 16, height: 16 }

export function IconOverview() {
  return (
    <svg {...icon} viewBox="0 0 24 24" aria-hidden>
      <rect
        x="3"
        y="3"
        width="7"
        height="9"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="3"
        width="7"
        height="5"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="14"
        y="11"
        width="7"
        height="10"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="3"
        y="15"
        width="7"
        height="6"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export function IconBloodPressure() {
  return (
    <svg {...icon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h3l1.5-2.5L11 15l2-8 2.5 5H19"
      />
    </svg>
  )
}

export function IconActivity() {
  return (
    <svg {...icon} viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="5" r="2" fill="currentColor" stroke="none" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21l1-6 2.5 3 2-7 3.5 4h3"
      />
    </svg>
  )
}

export function IconRecovery() {
  return (
    <svg {...icon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 14.5A8.5 8.5 0 0112.5 6 8.4 8.4 0 0013 21a9 9 0 008-6.5z"
      />
    </svg>
  )
}

export function IconImport() {
  return (
    <svg {...icon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5M5 18h14"
      />
    </svg>
  )
}
