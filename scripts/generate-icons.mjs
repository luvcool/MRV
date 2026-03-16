/**
 * Generates minimal PNG icons for PWA.
 * No external dependencies — uses Node.js built-in zlib.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

function uint32BE(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n, 0)
  return b
}

function crc32(buf) {
  let c = 0xFFFFFFFF
  const table = []
  for (let i = 0; i < 256; i++) {
    let k = i
    for (let j = 0; j < 8; j++) k = k & 1 ? 0xEDB88320 ^ (k >>> 1) : k >>> 1
    table[i] = k
  }
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeBytes, data])
  const crcVal = crc32(crcData)
  return Buffer.concat([uint32BE(data.length), typeBytes, data, uint32BE(crcVal)])
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdr = Buffer.concat([
    uint32BE(size), uint32BE(size),
    Buffer.from([8, 2, 0, 0, 0]) // 8-bit RGB
  ])

  // Raw pixel data: each row starts with filter byte 0
  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)
  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0 // filter: None

    for (let x = 0; x < size; x++) {
      const px = base + 1 + x * 3
      // Draw "H" letter in lighter color in center
      const cx = Math.abs(x - size / 2)
      const cy = Math.abs(y - size / 2)
      const isH = (
        // Left bar
        (cx >= size * 0.28 && cx <= size * 0.36 && cy <= size * 0.35) ||
        // Right bar
        (cx <= size * 0.08 && cy <= size * 0.35 && x > size / 2 - size * 0.08) ||
        // Crossbar
        (cy <= size * 0.06 && cx <= size * 0.28)
      ) && false // disable H for simplicity, just solid color

      // Rounded corners mask
      const dx = Math.max(0, Math.abs(x - size / 2) - size / 2 + size * 0.18)
      const dy = Math.max(0, Math.abs(y - size / 2) - size / 2 + size * 0.18)
      const inCorner = dx * dx + dy * dy > (size * 0.18) * (size * 0.18)

      if (inCorner) {
        raw[px] = 255; raw[px+1] = 255; raw[px+2] = 255
      } else {
        raw[px] = r; raw[px+1] = g; raw[px+2] = b
      }
    }
  }

  const idat = deflateSync(raw, { level: 6 })
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', iend),
  ])
}

mkdirSync(join(ROOT, 'public/icons'), { recursive: true })

// HKMC Navy: #002C5F = rgb(0, 44, 95)
writeFileSync(join(ROOT, 'public/icons/icon-192.png'), makePNG(192, 0, 44, 95))
writeFileSync(join(ROOT, 'public/icons/icon-512.png'), makePNG(512, 0, 44, 95))

console.log('Icons generated: public/icons/icon-192.png, public/icons/icon-512.png')
