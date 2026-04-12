import { formatDateTime12 } from '@/time/formatDateTime12'
import { useEffect, useState } from 'react'
import { db } from '@/db/schema'

export function RecordsPage({ dataRevision }: { dataRevision: number }) {
  const [meta, setMeta] = useState<Awaited<ReturnType<typeof loadMeta>>>([])

  useEffect(() => {
    void loadMeta().then(setMeta)
  }, [dataRevision])

  return (
    <div className="page">
      <h2>Import</h2>
      <p className="muted">
        Row counts per source file. Preamble lines with personal identifiers are not
        stored.
      </p>
      {meta.length === 0 ? (
        <p className="muted">No imports yet.</p>
      ) : (
        <div className="table-wrap table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Imported</th>
                <th>Timeseries</th>
                <th>BP</th>
                <th>Sleep</th>
                <th>Sport</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {meta.map((m) => (
                <tr key={m.sourceFile}>
                  <td>{m.sourceFile}</td>
                  <td>{formatDateTime12(m.importedAt)}</td>
                  <td>{m.rowCounts.timeseries}</td>
                  <td>{m.rowCounts.bloodPressure}</td>
                  <td>{m.rowCounts.sleep}</td>
                  <td>{m.rowCounts.sport}</td>
                  <td>{m.rowCounts.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

async function loadMeta() {
  const rows = await db.importMeta.toArray()
  return rows.sort((a, b) => b.importedAt - a.importedAt)
}
