import type { ScanRecord } from '../types/hkmc'
import { formatDate } from '../lib/hkmc-parser'
import { useLang } from '../contexts/LangContext'
import { t } from '../lib/i18n'

interface ScanHistoryProps {
  history: ScanRecord[]
  onSelect: (record: ScanRecord) => void
  onClear: () => void
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

export function ScanHistory({ history, onSelect, onClear }: ScanHistoryProps) {
  const { lang } = useLang()
  const str = t(lang)

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>{str.noHistory}</p>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <span className="history-count">{str.recentN(history.length)}</span>
        <button className="btn-clear" onClick={onClear}>
          {str.clearAll}
        </button>
      </div>

      <ul className="history-list">
        {history.map(record => (
          <li key={record.id} className="history-item" onClick={() => onSelect(record)}>
            <div className="history-item-row">
              {record.imageDataUrl ? (
                <img
                  className="history-thumb"
                  src={record.imageDataUrl}
                  alt="scan"
                  loading="lazy"
                />
              ) : (
                <div className="history-thumb-placeholder"><span>📷</span></div>
              )}

              <div className="history-item-info">
                <div className="history-item-top">
                  <span className="history-part">
                    {record.partNumbers.length > 0
                      ? record.partNumbers.join(', ')
                      : str.noPartNum}
                  </span>
                  <span className="history-time">{formatTime(record.scannedAt)}</span>
                </div>
                <div className="history-item-bottom">
                  {record.productionDate && (
                    <span className="history-date">
                      {str.prodLabel} {formatDate(record.productionDate)}
                    </span>
                  )}
                  <span className="history-raw">
                    {record.raw.slice(0, 40)}{record.raw.length > 40 ? '…' : ''}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
