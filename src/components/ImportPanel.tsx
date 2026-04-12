import { useRef, useState } from 'react'
import { importCsvFile } from '@/import/runImport'
import { clearAllData } from '@/db/repository'

type Props = {
  onImported: () => void
}

export function ImportPanel({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const clearDialogRef = useRef<HTMLDialogElement>(null)
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

  async function confirmClearAll() {
    clearDialogRef.current?.close()
    await clearAllData()
    onImported()
    setStatus('All data cleared.')
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
          onClick={() => clearDialogRef.current?.showModal()}
        >
          Clear all
        </button>
      </div>
      {status && <pre className="import-status">{status}</pre>}

      <dialog
        ref={clearDialogRef}
        className="confirm-dialog"
        aria-labelledby="clear-all-title"
        aria-describedby="clear-all-desc"
      >
        <h2 id="clear-all-title" className="confirm-dialog-title">
          Clear all data?
        </h2>
        <p id="clear-all-desc" className="muted confirm-dialog-body">
          This will delete every imported row stored in this browser for this site. The
          action cannot be undone.
        </p>
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => clearDialogRef.current?.close()}
          >
            Cancel
          </button>
          <button type="button" className="btn danger" onClick={() => void confirmClearAll()}>
            Clear all data
          </button>
        </div>
      </dialog>
    </div>
  )
}
