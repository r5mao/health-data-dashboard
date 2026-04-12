import { useState } from 'react'
import { DateRangeProvider } from '@/time/DateRangeProvider'
import { DateRangeControl } from '@/components/DateRangeControl'
import { ImportPanel } from '@/components/ImportPanel'
import { Overview } from '@/pages/Overview'
import { BloodPressurePage } from '@/pages/BloodPressurePage'
import { ActivityPage } from '@/pages/ActivityPage'
import { RecoveryPage } from '@/pages/RecoveryPage'
import { RecordsPage } from '@/pages/RecordsPage'
import './App.css'

type Tab = 'overview' | 'bp' | 'activity' | 'recovery' | 'records'

export default function App() {
  const [tab, setTab] = useState<Tab>('overview')
  const [dataRevision, setDataRevision] = useState(0)

  return (
    <DateRangeProvider refreshKey={dataRevision}>
      <div className="app">
        <header className="app-header">
          <div className="brand">
            <h1>Health Dashboard</h1>
            <p className="muted">Local-only. Import CSV exports to view trends.</p>
          </div>
          <ImportPanel
            onImported={() => setDataRevision((n) => n + 1)}
          />
        </header>

        <nav className="tabs" aria-label="Main">
          <TabButton id="overview" current={tab} setTab={setTab} label="Overview" />
          <TabButton id="bp" current={tab} setTab={setTab} label="Blood pressure" />
          <TabButton id="activity" current={tab} setTab={setTab} label="Activity" />
          <TabButton id="recovery" current={tab} setTab={setTab} label="Recovery" />
          <TabButton id="records" current={tab} setTab={setTab} label="Records" />
        </nav>

        <div className="toolbar">
          <DateRangeControl />
        </div>

        <main className="main">
          {tab === 'overview' && <Overview dataRevision={dataRevision} />}
          {tab === 'bp' && <BloodPressurePage dataRevision={dataRevision} />}
          {tab === 'activity' && <ActivityPage dataRevision={dataRevision} />}
          {tab === 'recovery' && <RecoveryPage dataRevision={dataRevision} />}
          {tab === 'records' && <RecordsPage dataRevision={dataRevision} />}
        </main>
      </div>
    </DateRangeProvider>
  )
}

function TabButton({
  id,
  current,
  setTab,
  label,
}: {
  id: Tab
  current: Tab
  setTab: (t: Tab) => void
  label: string
}) {
  return (
    <button
      type="button"
      className={`tab-btn${current === id ? ' active' : ''}`}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  )
}
