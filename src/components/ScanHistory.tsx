import type { ScanRecord } from '../types/hkmc'
import { formatDate } from '../lib/hkmc-parser'

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
  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>스캔 이력이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <span className="history-count">최근 {history.length}개</span>
        <button className="btn-clear" onClick={onClear}>
          전체 삭제
        </button>
      </div>

      <ul className="history-list">
        {history.map(record => (
          <li
            key={record.id}
            className="history-item"
            onClick={() => onSelect(record)}
          >
            <div className="history-item-row">
              {/* Thumbnail */}
              {record.imageDataUrl ? (
                <img
                  className="history-thumb"
                  src={record.imageDataUrl}
                  alt="스캔 이미지"
                  loading="lazy"
                />
              ) : (
                <div className="history-thumb-placeholder">
                  <span>📷</span>
                </div>
              )}

              {/* Info */}
              <div className="history-item-info">
                <div className="history-item-top">
                  <span className="history-part">
                    {record.partNumbers.length > 0
                      ? record.partNumbers.join(', ')
                      : '부품번호 없음'}
                  </span>
                  <span className="history-time">{formatTime(record.scannedAt)}</span>
                </div>
                <div className="history-item-bottom">
                  {record.productionDate && (
                    <span className="history-date">
                      생산: {formatDate(record.productionDate)}
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
