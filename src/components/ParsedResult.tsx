import type { ParsedHKMC } from '../types/hkmc'
import { formatDate } from '../lib/hkmc-parser'
import { useLang } from '../contexts/LangContext'
import { t } from '../lib/i18n'

interface ParsedResultProps {
  parsed: ParsedHKMC
  imageDataUrl?: string
}

type TableRow = {
  label: string
  value: string
  status: 'OK' | 'MISSING' | 'INFO'
}

function Badge({ status }: { status: TableRow['status'] }) {
  const cls = status === 'OK' ? 'badge-ok' : status === 'MISSING' ? 'badge-missing' : 'badge-info'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function ParsedResult({ parsed, imageDataUrl }: ParsedResultProps) {
  const { lang } = useLang()
  const str = t(lang)
  const { fields, header, partNumbers, traceInfo, raw } = parsed

  const none = str.none

  const rows: TableRow[] = [
    {
      label: str.fHeader,
      value: header || none,
      status: header ? 'OK' : 'MISSING',
    },
    {
      label: str.fVendor,
      value: fields.V ?? none,
      status: fields.V ? 'OK' : 'MISSING',
    },
    {
      label: str.fPart,
      value: partNumbers.length > 0 ? partNumbers.join(' / ') : (fields.P ?? none),
      status: partNumbers.length > 0 ? 'OK' : 'MISSING',
    },
    {
      label: str.fSeq,
      value: fields.S ?? none,
      status: fields.S ? 'OK' : 'MISSING',
    },
    {
      label: str.fEO,
      value: fields.E ?? none,
      status: fields.E ? 'OK' : 'MISSING',
    },
  ]

  if (traceInfo) {
    const lotLabel =
      traceInfo.lotType === 'A' ? str.lotA
      : traceInfo.lotType === '@' ? str.lotAt
      : traceInfo.lotType

    rows.push(
      {
        label: str.fProdDate,
        value: traceInfo.productionDate
          ? `${traceInfo.productionDate} (${formatDate(traceInfo.productionDate)})`
          : none,
        status: traceInfo.productionDate ? 'OK' : 'MISSING',
      },
      {
        label: str.fFourM,
        value: traceInfo.fourM || none,
        status: traceInfo.fourM ? 'OK' : 'MISSING',
      },
      {
        label: str.fLotType,
        value: traceInfo.lotType ? `${traceInfo.lotType} — ${lotLabel}` : none,
        status: traceInfo.lotType ? 'OK' : 'MISSING',
      },
      {
        label: str.fSerial,
        value: traceInfo.serial || none,
        status: traceInfo.serial ? 'OK' : 'MISSING',
      },
    )
  } else if (fields.T) {
    rows.push({ label: str.fTrace, value: fields.T, status: 'INFO' })
  }

  if (fields['1']) rows.push({ label: str.fSpecial, value: fields['1'], status: 'INFO' })
  if (fields.M)   rows.push({ label: str.fFirst,   value: fields.M,    status: 'INFO' })
  if (fields.C)   rows.push({ label: str.fVendorArea, value: fields.C, status: 'INFO' })

  return (
    <div className="result-card">
      {/* Captured image */}
      {imageDataUrl && (
        <section className="capture-section">
          <h3 className="section-title">{str.captureImage}</h3>
          <img src={imageDataUrl} alt="scan capture" className="capture-img" />
        </section>
      )}

      {/* Raw barcode string */}
      <section className="raw-section">
        <h3 className="section-title">{str.rawBarcode}</h3>
        <div className="raw-string">{raw}</div>
      </section>

      {/* Multi-part notice */}
      {partNumbers.length > 1 && (
        <div className="multipart-banner">
          <span>{str.multiPartBanner(partNumbers.length)}</span>
          <ul className="multipart-list">
            {partNumbers.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {/* HKMC Standard Table */}
      <section>
        <h3 className="section-title">{str.stdAnalysis}</h3>
        <div className="table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th>{str.colField}</th>
                <th>{str.colResult}</th>
                <th>{str.colData}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="col-label">{row.label}</td>
                  <td className="col-status"><Badge status={row.status} /></td>
                  <td className="col-value">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
