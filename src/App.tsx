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
  const [currentImage, setCurrentImage] = useState<string>('')
  const { history, addRecord, clearHistory } = useHistory()

  const handleScan = useCallback((raw: string, imageDataUrl: string) => {
    const result = parseHKMC(raw)
    setParsed(result)
    setCurrentImage(imageDataUrl)
    addRecord(raw, result, imageDataUrl)
    setScanning(false)
  }, [addRecord])

  const handleRescan = () => {
    setParsed(null)
    setCurrentImage('')
    setScanning(true)
  }

  const handleSelectHistory = (record: ScanRecord) => {
    if (record.parsed) {
      setParsed(record.parsed)
      setCurrentImage(record.imageDataUrl || '')
      setTab('scan')
      setScanning(false)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <img src="/logo.png" alt="MRV Logo" className="header-logo-img" />
        <h1 className="header-title">MRV 바코드 스캐너</h1>
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
            <Scanner onScan={handleScan} active={scanning} />

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

            {parsed && <ParsedResult parsed={parsed} imageDataUrl={currentImage} />}

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
