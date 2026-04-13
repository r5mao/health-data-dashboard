import { format, isSameDay, isSameYear } from 'date-fns'
import { useEffect, useState } from 'react'
import { db } from '@/db/schema'
import { formatDateTime12 } from '@/time/formatDateTime12'
import type { ImportMetaRecord } from '@/types/canonical'

function formatDateRange(min: number | null | undefined, max: number | null | undefined): string {
  if (min == null && max == null) return '—'
  if (min == null) return format(max!, 'MMM d, yyyy')
  if (max == null) return format(min, 'MMM d, yyyy')

  const a = new Date(min)
  const b = new Date(max)

  if (isSameDay(a, b)) return format(a, 'MMM d, yyyy')
  if (isSameYear(a, b)) return `${format(a, 'MMM d')} – ${format(b, 'MMM d, yyyy')}`
  return `${format(a, 'MMM d, yyyy')} – ${format(b, 'MMM d, yyyy')}`
}

function totalRows(rc: ImportMetaRecord['rowCounts']): number {
  return rc.timeseries + rc.bloodPressure + rc.sleep + rc.sport + rc.weight
}

export function RecordsPage({ dataRevision }: { dataRevision: number }) {
  const [meta, setMeta] = useState<ImportMetaRecord[]>([])

  useEffect(() => {
    void loadMeta().then(setMeta)
  }, [dataRevision])

  return (
    <div className="page">
      <h2>Import</h2>
      <p className="muted">
        Previously imported files. Preamble lines with personal identifiers are
        not stored.
      </p>
      {meta.length === 0 ? (
        <p className="muted">No imports yet.</p>
      ) : (
        <div className="table-wrap table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Date Range</th>
                <th>Data Type</th>
                <th>Data Count</th>
                <th>Imported At</th>
              </tr>
            </thead>
            <tbody>
              {meta.map((m) => (
                <tr key={m.sourceFile}>
                  <td>{m.sourceFile}</td>
                  <td>{formatDateRange(m.dateMin, m.dateMax)}</td>
                  <td>{m.dataType ?? '—'}</td>
                  <td>{totalRows(m.rowCounts).toLocaleString()}</td>
                  <td>{formatDateTime12(m.importedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

async function loadMeta(): Promise<ImportMetaRecord[]> {
  const rows = await db.importMeta.toArray()
  return rows.sort((a, b) => b.importedAt - a.importedAt)
}
