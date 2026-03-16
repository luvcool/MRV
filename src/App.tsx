import { useState, useCallback } from 'react'
import { Scanner } from './components/Scanner'
import { ParsedResult } from './components/ParsedResult'
import { ScanHistory } from './components/ScanHistory'
import { parseHKMC } from './lib/hkmc-parser'
import { useHistory } from './hooks/useHistory'
import type { ParsedHKMC, ScanRecord } from './types/hkmc'

type Tab = 'scan' | 'history'

export function App() {
  const [tab, setTab] = useState<Tab>('scan')
  const [scanning, setScanning] = useState(true)
  const [parsed, setParsed] = useState<ParsedHKMC | null>(null)
  const { history, addRecord, clearHistory } = useHistory()

  const handleScan = useCallback((raw: string) => {
    const result = parseHKMC(raw)
    setParsed(result)
    addRecord(raw, result)
    setScanning(false) // pause after scan
  }, [addRecord])

  const handleRescan = () => {
    setParsed(null)
    setScanning(true)
  }

  const handleSelectHistory = (record: ScanRecord) => {
    if (record.parsed) {
      setParsed(record.parsed)
      setTab('scan')
      setScanning(false)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="#002C5F"/>
            <path d="M4 8h4v12H4V8zm4 4h5v4H8v-4zm5-4h4v12h-4V8zm4 4h3v4h-3v-4zm3-4h4v12h-4V8z" fill="white"/>
          </svg>
        </div>
        <h1 className="header-title">HKMC 바코드 스캐너</h1>
      </header>

      {/* Tab Bar */}
      <nav className="tab-bar">
        <button
          className={`tab-btn ${tab === 'scan' ? 'active' : ''}`}
          onClick={() => setTab('scan')}
        >
          스캔
        </button>
        <button
          className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          이력
          {history.length > 0 && (
            <span className="tab-badge">{history.length}</span>
          )}
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        {tab === 'scan' && (
          <div className="scan-page">
            {/* Camera */}
            <Scanner onScan={handleScan} active={scanning} />

            {/* Scan control buttons */}
            <div className="scan-controls">
              {scanning ? (
                <button className="btn btn-secondary" onClick={() => setScanning(false)}>
                  ⏸ 일시 정지
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleRescan}>
                  📷 다시 스캔
                </button>
              )}
            </div>

            {/* Result */}
            {parsed && <ParsedResult parsed={parsed} />}

            {!parsed && !scanning && (
              <div className="no-result">
                <p>스캔된 바코드가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <ScanHistory
            history={history}
            onSelect={handleSelectHistory}
            onClear={clearHistory}
          />
        )}
      </main>
    </div>
  )
}
