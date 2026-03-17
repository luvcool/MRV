export interface HKMCFields {
  V?: string  // 업체 코드 (4 byte)
  P?: string  // 부품 번호 (10~15 byte), may contain # for multi-part
  S?: string  // 서열 코드 (1~8 byte)
  E?: string  // EO 번호 (8~9 byte)
  T?: string  // 추적 코드 (14~36 byte)
  '1'?: string // 특이 정보 (1~40 byte)
  M?: string  // 초도품 구분 (1 byte)
  C?: string  // 업체 영역 (1~50 byte)
}

export interface TraceInfo {
  productionDate: string  // YYMMDD
  fourM: string           // 4M 정보
  lotType: string         // A=개별 Serial, @=다수 Lot
  lotTypeLabel: string
  serial: string          // 제조 시리얼
}

export interface ParsedHKMC {
  raw: string
  header: string
  fields: HKMCFields
  partNumbers: string[]   // P field split by #
  traceInfo?: TraceInfo
  parseError?: string
}

export interface ScanRecord {
  id: string
  scannedAt: string       // ISO timestamp
  partNumbers: string[]
  productionDate?: string
  raw: string
  parsed?: ParsedHKMC     // first part (backward compat)
  parts?: ParsedHKMC[]    // all parts when multi-part barcode
  imageDataUrl?: string   // captured camera frame (JPEG base64)
}
