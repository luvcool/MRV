import { useState, useCallback } from 'react'
import { Scanner } from './components/Scanner'
import { ParsedResult } from './components/ParsedResult'
import { ScanHistory } from './components/ScanHistory'
import { parseMultiHKMC } from './lib/hkmc-parser'
import { useHistory } from './hooks/useHistory'
import { useLang } from './contexts/LangContext'
import { t } from './lib/i18n'
import type { ParsedHKMC, ScanRecord } from './types/hkmc'

type Tab = 'scan' | 'history'

export function App() {
  const [tab, setTab] = useState<Tab>('scan')
  const [scanning, setScanning] = useState(true)
  const [parts, setParts] = useState<ParsedHKMC[]>([])
  const [activePartIdx, setActivePartIdx] = useState(0)
  const [currentImage, setCurrentImage] = useState<string>('')
  const { history, addRecord, clearHistory } = useHistory()
  const { lang, toggle } = useLang()
  const str = t(lang)

  const handleScan = useCallback((raw: string, imageDataUrl: string) => {
    const result = parseMultiHKMC(raw)
    setParts(result)
    setActivePartIdx(0)
    setCurrentImage(imageDataUrl)
    addRecord(raw, result, imageDataUrl)
    setScanning(false)
  }, [addRecord])

  const handleRescan = () => {
    setParts([])
    setActivePartIdx(0)
    setCurrentImage('')
    setScanning(true)
  }

  const handleSelectHistory = (record: ScanRecord) => {
    const allParts = record.parts ?? (record.parsed ? [record.parsed] : [])
    if (allParts.length > 0) {
      setParts(allParts)
      setActivePartIdx(0)
      setCurrentImage(record.imageDataUrl || '')
      setTab('scan')
      setScanning(false)
    }
  }

  const currentPart = parts[activePartIdx] ?? null
  const hasResult = parts.length > 0

  return (
    <div className="app">
      <header className="app-header">
        <img src="/logo.png" alt="MRV Logo" className="header-logo-img" />
        <h1 className="header-title">{str.appTitle}</h1>
        <button className="lang-toggle" onClick={toggle}>
          {lang === 'ko' ? 'EN' : '한'}
        </button>
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${tab === 'scan' ? 'active' : ''}`}
          onClick={() => setTab('scan')}
        >
          {str.tabScan}
        </button>
        <button
          className={`tab-btn ${tab === 'history' ? 'active' : ''}`}
          onClick={() => setTab('history')}
        >
          {str.tabHistory}
          {history.length > 0 && (
            <span className="tab-badge">{history.length}</span>
          )}
        </button>
      </nav>

      <main className="app-main">
        {tab === 'scan' && (
          <div className="scan-page">

            {/* ── SCANNING MODE: full camera ── */}
            {scanning && (
              <>
                <Scanner onScan={handleScan} active={scanning} />
                <div className="scan-controls">
                  <button className="btn btn-secondary" onClick={() => setScanning(false)}>
                    {str.btnPause}
                  </button>
                </div>
              </>
            )}

            {/* ── RESULT MODE: mini camera bar ── */}
            {!scanning && (
              <div className="camera-mini-bar">
                {currentImage
                  ? <img src={currentImage} className="mini-thumb" alt="scan" />
                  : <div className="mini-thumb-ph">📷</div>
                }
                <span className="mini-label">
                  {str.scannedLabel(parts.length)}
                </span>
                <button className="btn-rescan-mini" onClick={handleRescan}>
                  {str.btnRecan}
                </button>
              </div>
            )}

            {/* ── PART TABS: sticky, shown when 2+ parts ── */}
            {hasResult && parts.length > 1 && (
              <div className="part-tabs part-tabs-sticky">
                {parts.map((p, i) => (
                  <button
                    key={i}
                    className={`part-tab-btn ${activePartIdx === i ? 'active' : ''}`}
                    onClick={() => setActivePartIdx(i)}
                  >
                    {str.partTab(i + 1, p.partNumbers[0] ?? '')}
                  </button>
                ))}
              </div>
            )}

            {/* ── RESULT ── */}
            {currentPart && (
              <ParsedResult
                parsed={currentPart}
                imageDataUrl={activePartIdx === 0 ? currentImage : ''}
              />
            )}

            {!hasResult && !scanning && (
              <div className="no-result">
                <p>{str.noResult}</p>
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
