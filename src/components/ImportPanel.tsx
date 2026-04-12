import { useRef, useState } from 'react'
import { importCsvFile } from '@/import/runImport'
import { clearAllData } from '@/db/repository'

type Props = {
  onImported: () => void
}

export function ImportPanel({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setStatus('Importing…')
    const lines: string[] = []
    for (const f of Array.from(files)) {
      const r = await importCsvFile(f)
      if (r.ok) {
        lines.push(
          `${r.sourceFile}: ${r.rowCounts.timeseries + r.rowCounts.bloodPressure + r.rowCounts.sleep + r.rowCounts.sport + r.rowCounts.weight} rows`,
        )
      } else {
        lines.push(`${r.sourceFile}: ${r.error}`)
      }
    }
    setStatus(lines.join('\n'))
    onImported()
    e.target.value = ''
  }

  return (
    <div className="import-shell">
      <div className="import-panel">
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="file-input"
          onChange={onChange}
        />
        <button
          type="button"
          className="btn secondary"
          onClick={() => inputRef.current?.click()}
        >
          Import CSV
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={async () => {
            if (
              confirm(
                'Delete all imported data in this browser? This cannot be undone.',
              )
            ) {
              await clearAllData()
              onImported()
              setStatus('All data cleared.')
            }
          }}
        >
          Clear all
        </button>
      </div>
      {status && <pre className="import-status">{status}</pre>}
    </div>
  )
}
