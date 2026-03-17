export type Lang = 'ko' | 'en'

const strings = {
  ko: {
    appTitle: 'MRV 바코드 스캐너',
    tabScan: '스캔',
    tabHistory: '이력',
    btnPause: '⏸ 일시 정지',
    btnRescan: '📷 다시 스캔',
    noResult: '스캔된 바코드가 없습니다.',
    // ParsedResult
    captureImage: '촬영 이미지',
    rawBarcode: '원문 바코드',
    multiPartBanner: (n: number) => `🔢 Multi-Part 바코드 (${n}개 부품)`,
    stdAnalysis: 'HKMC 표준 분석',
    colField: '구분',
    colResult: '결과',
    colData: '데이터',
    fHeader: 'Header',
    fVendor: '업체 코드',
    fPart: '부품 번호',
    fSeq: '서열 코드',
    fEO: 'EO 번호',
    fProdDate: '생산일자',
    fFourM: '부품 4M',
    fLotType: 'Lot 방식',
    fSerial: '제조 시리얼',
    fTrace: '추적 코드',
    fSpecial: '특이 정보',
    fFirst: '초도품 구분',
    fVendorArea: '업체 영역',
    lotA: '개별 Serial 관리',
    lotAt: '다수 Lot 관리',
    // ScanHistory
    recentN: (n: number) => `최근 ${n}개`,
    clearAll: '전체 삭제',
    noHistory: '스캔 이력이 없습니다.',
    noPartNum: '부품번호 없음',
    prodLabel: '생산:',
    // Scanner
    camPermErr: '카메라 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해 주세요.',
    camErr: (msg: string) => `카메라 오류: ${msg}`,
    scanPaused: '스캔 중지됨',
    none: '-',
    partTab: (n: number, code: string) => code ? `부품${n} · ${code}` : `부품 ${n}`,
  },
  en: {
    appTitle: 'MRV Barcode Scanner',
    tabScan: 'Scan',
    tabHistory: 'History',
    btnPause: '⏸ Pause',
    btnRescan: '📷 Rescan',
    noResult: 'No barcode scanned.',
    captureImage: 'Captured Image',
    rawBarcode: 'Raw Barcode',
    multiPartBanner: (n: number) => `🔢 Multi-Part Barcode (${n} parts)`,
    stdAnalysis: 'HKMC Standard Analysis',
    colField: 'Field',
    colResult: 'Result',
    colData: 'Data',
    fHeader: 'Header',
    fVendor: 'Vendor Code',
    fPart: 'Part Number',
    fSeq: 'Sequence Code',
    fEO: 'EO Number',
    fProdDate: 'Production Date',
    fFourM: 'Part 4M',
    fLotType: 'Lot Type',
    fSerial: 'Mfg Serial',
    fTrace: 'Trace Code',
    fSpecial: 'Special Info',
    fFirst: 'First Article',
    fVendorArea: 'Vendor Area',
    lotA: 'Individual Serial',
    lotAt: 'Multiple Lot',
    recentN: (n: number) => `Recent ${n}`,
    clearAll: 'Clear All',
    noHistory: 'No scan history.',
    noPartNum: 'No Part Number',
    prodLabel: 'Prod:',
    camPermErr: 'Camera permission required. Please allow camera in browser settings.',
    camErr: (msg: string) => `Camera error: ${msg}`,
    scanPaused: 'Scan Paused',
    none: '-',
    partTab: (n: number, code: string) => code ? `Part${n} · ${code}` : `Part ${n}`,
  },
} as const

export interface Strings {
  appTitle: string
  tabScan: string
  tabHistory: string
  btnPause: string
  btnRescan: string
  noResult: string
  captureImage: string
  rawBarcode: string
  multiPartBanner: (n: number) => string
  stdAnalysis: string
  colField: string
  colResult: string
  colData: string
  fHeader: string
  fVendor: string
  fPart: string
  fSeq: string
  fEO: string
  fProdDate: string
  fFourM: string
  fLotType: string
  fSerial: string
  fTrace: string
  fSpecial: string
  fFirst: string
  fVendorArea: string
  lotA: string
  lotAt: string
  recentN: (n: number) => string
  clearAll: string
  noHistory: string
  noPartNum: string
  prodLabel: string
  camPermErr: string
  camErr: (msg: string) => string
  scanPaused: string
  none: string
  partTab: (n: number, code: string) => string
}

export const t = (lang: Lang): Strings => strings[lang]
