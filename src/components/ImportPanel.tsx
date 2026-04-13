import { useRef, useState } from 'react'
import { importCsvFile } from '@/import/runImport'
import { clearAllData } from '@/db/repository'

type Props = {
  onImported: () => void
}

type BannerState =
  | { kind: 'success' | 'error'; message: string }
  | null

export function ImportPanel({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const clearDialogRef = useRef<HTMLDialogElement>(null)
  const [banner, setBanner] = useState<BannerState>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  async function importFiles(files: FileList | File[]) {
    if (!files?.length) return

    let importedCount = 0
    let failedCount = 0
    let touchedData = false

    for (const file of Array.from(files)) {
      try {
        const result = await importCsvFile(file)
        if (result.ok) {
          importedCount += 1
          touchedData = true
        } else {
          failedCount += 1
        }
      } catch {
        failedCount += 1
      }
    }

    if (touchedData) onImported()

    if (failedCount === 0) {
      setBanner({
        kind: 'success',
        message: `Imported ${importedCount} file${importedCount === 1 ? '' : 's'} successfully.`,
      })
    } else {
      setBanner({
        kind: 'error',
        message:
          importedCount > 0
            ? `Imported ${importedCount} file${importedCount === 1 ? '' : 's'}; ${failedCount} file${failedCount === 1 ? '' : 's'} failed.`
            : `Import failed for ${failedCount} file${failedCount === 1 ? '' : 's'}.`,
      })
    }
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    await importFiles(files ?? [])
    e.target.value = ''
  }

  async function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.csv'),
    )
    await importFiles(files)
  }

  async function confirmClearAll() {
    clearDialogRef.current?.close()
    try {
      await clearAllData()
      onImported()
      setBanner({ kind: 'success', message: 'All data cleared.' })
    } catch {
      setBanner({ kind: 'error', message: 'Failed to clear data.' })
    }
  }

  return (
    <div className="import-shell">
      {banner && (
        <div
          className={`import-banner ${banner.kind === 'success' ? 'success' : 'error'}`}
          role="status"
          aria-live="polite"
        >
          <span>{banner.message}</span>
          <button
            type="button"
            className="import-banner-close"
            aria-label="Dismiss import status"
            onClick={() => setBanner(null)}
          >
            ×
          </button>
        </div>
      )}
      <div
        className={`import-dropzone${isDragActive ? ' drag-active' : ''}`}
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragActive(true)
        }}
        onDragEnter={() => setIsDragActive(true)}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsDragActive(false)
          }
        }}
        onDrop={(e) => void onDrop(e)}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        aria-label="Drop CSV files here or press Enter to browse files"
      >
        <p className="import-dropzone-title">Drag and drop CSV files here</p>
        <p className="muted import-dropzone-subtitle">or click to browse</p>
      </div>
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
