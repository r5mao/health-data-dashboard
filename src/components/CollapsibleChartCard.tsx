import { useState, type ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** When true, the card starts collapsed (header only). */
  defaultCollapsed?: boolean
  children: ReactNode
  variant?: 'chart' | 'table'
}

export function CollapsibleChartCard({
  title,
  defaultCollapsed = false,
  children,
  variant = 'chart',
}: Props) {
  const className =
    variant === 'table'
      ? 'table-wrap table-card collapsible-card'
      : 'chart-wrap chart-card collapsible-card'

  const [open, setOpen] = useState(!defaultCollapsed)

  return (
    <details
      className={className}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="collapsible-card-summary">
        <span className="collapsible-card-title">{title}</span>
      </summary>
      <div className="collapsible-card-body">{children}</div>
    </details>
  )
}
