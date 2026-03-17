import { useEffect, useRef, useState, useCallback } from 'react'
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library'
import { useLang } from '../contexts/LangContext'
import { t } from '../lib/i18n'

interface ScannerProps {
  onScan: (text: string, imageDataUrl: string) => void
  active: boolean
}

async function listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput')
  } catch {
    return []
  }
}

export function Scanner({ onScan, active }: ScannerProps) {
  const { lang } = useLang()
  const str = t(lang)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const lastScan = useRef<string>('')
  const scanCooldown = useRef<ReturnType<typeof setTimeout> | null>(null)

  const captureFrame = useCallback((): string => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) return ''
    const W = 320
    const H = Math.round((video.videoHeight * W) / (video.videoWidth || 1)) || 240
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.drawImage(video, 0, 0, W, H)
    return canvas.toDataURL('image/jpeg', 0.65)
  }, [])

  const stopScanning = useCallback(() => {
    readerRef.current?.reset()
    if (scanCooldown.current) clearTimeout(scanCooldown.current)
  }, [])

  const startScanning = useCallback(async (deviceId?: string) => {
    if (!videoRef.current) return
    stopScanning()
    setError(null)

    const hints = new Map<DecodeHintType, unknown>()
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.QR_CODE,
    ])
    hints.set(DecodeHintType.TRY_HARDER, true)

    const reader = new BrowserMultiFormatReader(hints, 200)
    readerRef.current = reader

    try {
      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, facingMode: 'environment' }
          : { facingMode: 'environment' },
      }

      await reader.decodeFromConstraints(constraints, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText()
          if (text !== lastScan.current) {
            lastScan.current = text
            const imageDataUrl = captureFrame()
            onScan(text, imageDataUrl)
            if (scanCooldown.current) clearTimeout(scanCooldown.current)
            scanCooldown.current = setTimeout(() => { lastScan.current = '' }, 2000)
          }
        } else if (err && !(err instanceof NotFoundException)) {
          // Non-fatal decode errors — ignore
        }
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
        setError(str.camPermErr)
      } else {
        setError(str.camErr(msg))
      }
    }
  }, [onScan, stopScanning, captureFrame])

  useEffect(() => {
    listVideoInputDevices().then(devices => {
      setCameras(devices)
      const rear = devices.find((d: MediaDeviceInfo) =>
        /back|rear|environment/i.test(d.label)
      )
      const id = rear?.deviceId ?? devices[0]?.deviceId ?? ''
      setSelectedCamera(id)
    })
  }, [])

  useEffect(() => {
    if (active) {
      startScanning(selectedCamera || undefined)
    } else {
      stopScanning()
    }
    return () => stopScanning()
  }, [active, selectedCamera, startScanning, stopScanning])

  return (
    <div className="scanner-container">
      {cameras.length > 1 && (
        <div className="camera-select">
          <select
            value={selectedCamera}
            onChange={e => setSelectedCamera(e.target.value)}
          >
            {cameras.map(cam => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `카메라 ${cam.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="video-wrapper">
        <video ref={videoRef} className="scanner-video" playsInline muted />
        <div className="scan-overlay">
          <div className="scan-frame" />
        </div>
        {!active && (
          <div className="scanner-paused">
            <span>{str.scanPaused}</span>
          </div>
        )}
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {error && (
        <div className="scanner-error">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  )
}
