import type { HKMCFields, ParsedHKMC, TraceInfo } from '../types/hkmc'

const GS = '\x1D'   // Group Separator
const RS = '\x1E'   // Record Separator
const EOT = '\x04'  // End of Transmission

const KNOWN_DI = new Set(['V', 'P', 'S', 'E', 'T', '1', 'M', 'C'])

function parseTraceCode(t: string): TraceInfo {
  // T150520S1B2A0476217
  // Pos 1-6:  YYMMDD
  // Pos 7-10: 4M info
  // Pos 11:   Lot type
  // Pos 12+:  Serial
  const productionDate = t.slice(0, 6)
  const fourM = t.slice(6, 10)
  const lotType = t.slice(10, 11)
  const serial = t.slice(11)

  const lotTypeLabel =
    lotType === 'A' ? '개별 Serial 관리'
    : lotType === '@' ? '다수 Lot 관리'
    : lotType

  return { productionDate, fourM, lotType, lotTypeLabel, serial }
}

export function parseHKMC(raw: string): ParsedHKMC {
  let header = ''

  // Normalize: remove EOT
  let str = raw.replace(new RegExp(EOT, 'g'), '')

  // Extract header: starts with ]> then RS, e.g., ]>\x1E06
  // The header section is everything before the first DI field
  let headerPrefix = ''
  if (str.startsWith(']>')) {
    // Find first GS
    const firstGS = str.indexOf(GS)
    if (firstGS !== -1) {
      headerPrefix = str.slice(0, firstGS)
      str = str.slice(firstGS + 1)
    } else {
      headerPrefix = str
      str = ''
    }
  }

  // Clean header: remove RS chars for display, keep readable portion
  header = headerPrefix.replace(new RegExp(RS, 'g'), 'RS').trim() || ']>RS06'

  // Remove trailing RS
  str = str.replace(new RegExp(RS, 'g'), '')

  // Split by GS
  const segments = str.split(GS).filter(s => s.length > 0)

  const fields: HKMCFields = {}

  for (const seg of segments) {
    if (seg.length === 0) continue

    const di = seg[0]
    const data = seg.slice(1)

    if (KNOWN_DI.has(di)) {
      (fields as Record<string, string>)[di] = data
    }
    // Unknown DI segments are silently ignored
  }

  // Multi-part: split P by #
  const partNumbers = fields.P
    ? fields.P.split('#').map(p => p.trim()).filter(p => p.length > 0)
    : []

  // Parse trace code
  let traceInfo: TraceInfo | undefined
  if (fields.T) {
    try {
      traceInfo = parseTraceCode(fields.T)
    } catch {
      // malformed trace code, skip
    }
  }

  return { raw, header, fields, partNumbers, traceInfo }
}

/** Format YYMMDD → YYYY-MM-DD */
export function formatDate(yymmdd: string): string {
  if (yymmdd.length !== 6) return yymmdd
  const yy = parseInt(yymmdd.slice(0, 2), 10)
  const mm = yymmdd.slice(2, 4)
  const dd = yymmdd.slice(4, 6)
  // Assume 2000s
  const yyyy = yy + 2000
  return `${yyyy}-${mm}-${dd}`
}
