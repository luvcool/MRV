import { useState, useCallback } from 'react'
import type { ScanRecord, ParsedHKMC } from '../types/hkmc'

const STORAGE_KEY = 'hkmc-scan-history'
const MAX_RECORDS = 20

function loadHistory(): ScanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ScanRecord[]) : []
  } catch {
    return []
  }
}

function saveHistory(records: ScanRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // localStorage full or unavailable
  }
}

export function useHistory() {
  const [history, setHistory] = useState<ScanRecord[]>(loadHistory)

  const addRecord = useCallback((raw: string, parsed: ParsedHKMC, imageDataUrl?: string) => {
    const record: ScanRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      scannedAt: new Date().toISOString(),
      partNumbers: parsed.partNumbers,
      productionDate: parsed.traceInfo?.productionDate,
      raw,
      parsed,
      imageDataUrl: imageDataUrl || undefined,
    }

    setHistory(prev => {
      const next = [record, ...prev].slice(0, MAX_RECORDS)
      saveHistory(next)
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { history, addRecord, clearHistory }
}
