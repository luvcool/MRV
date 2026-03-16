import type { ParsedHKMC } from '../types/hkmc'
import { formatDate } from '../lib/hkmc-parser'

interface ParsedResultProps {
  parsed: ParsedHKMC
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

export function ParsedResult({ parsed }: ParsedResultProps) {
  const { fields, header, partNumbers, traceInfo, raw } = parsed

  const rows: TableRow[] = [
    {
      label: 'Header',
      value: header,
      status: header ? 'OK' : 'MISSING',
    },
    {
      label: '업체 코드',
      value: fields.V ?? '-',
      status: fields.V ? 'OK' : 'MISSING',
    },
    {
      label: '부품 번호',
      value: partNumbers.length > 0 ? partNumbers.join(' / ') : (fields.P ?? '-'),
      status: partNumbers.length > 0 ? 'OK' : 'MISSING',
    },
    {
      label: '서열 코드',
      value: fields.S ?? '-',
      status: fields.S ? 'OK' : 'MISSING',
    },
    {
      label: 'EO 번호',
      value: fields.E ?? '-',
      status: fields.E ? 'OK' : 'MISSING',
    },
  ]

  if (traceInfo) {
    rows.push(
      {
        label: '생산일자',
        value: traceInfo.productionDate
          ? `${traceInfo.productionDate} (${formatDate(traceInfo.productionDate)})`
          : '-',
        status: traceInfo.productionDate ? 'OK' : 'MISSING',
      },
      {
        label: '부품 4M',
        value: traceInfo.fourM || '-',
        status: traceInfo.fourM ? 'OK' : 'MISSING',
      },
      {
        label: 'Lot 방식',
        value: traceInfo.lotType
          ? `${traceInfo.lotType} — ${traceInfo.lotTypeLabel}`
          : '-',
        status: traceInfo.lotType ? 'OK' : 'MISSING',
      },
      {
        label: '제조 시리얼',
        value: traceInfo.serial || '-',
        status: traceInfo.serial ? 'OK' : 'MISSING',
      },
    )
  } else if (fields.T) {
    rows.push({
      label: '추적 코드',
      value: fields.T,
      status: 'INFO',
    })
  }

  if (fields['1']) {
    rows.push({ label: '특이 정보', value: fields['1'], status: 'INFO' })
  }
  if (fields.M) {
    rows.push({ label: '초도품 구분', value: fields.M, status: 'INFO' })
  }
  if (fields.C) {
    rows.push({ label: '업체 영역', value: fields.C, status: 'INFO' })
  }

  return (
    <div className="result-card">
      {/* Raw barcode string */}
      <section className="raw-section">
        <h3 className="section-title">원문 바코드</h3>
        <div className="raw-string">{raw}</div>
      </section>

      {/* Multi-part notice */}
      {partNumbers.length > 1 && (
        <div className="multipart-banner">
          <span>🔢 Multi-Part 바코드 ({partNumbers.length}개 부품)</span>
          <ul className="multipart-list">
            {partNumbers.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* HKMC Standard Table */}
      <section>
        <h3 className="section-title">HKMC 표준 분석</h3>
        <div className="table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>결과</th>
                <th>데이터</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td className="col-label">{row.label}</td>
                  <td className="col-status">
                    <Badge status={row.status} />
                  </td>
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
