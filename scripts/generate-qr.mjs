// Generates the poster QR code as SVG + 1200px PNG with error correction H.
import { mkdir, writeFile } from 'node:fs/promises'
import QRCode from 'qrcode'

const URL = 'https://nannymckenzie.github.io/?src=poster'
const OUT = new globalThis.URL('../flyers/out/', import.meta.url)

await mkdir(OUT, { recursive: true })

const svg = await QRCode.toString(URL, {
  type: 'svg',
  errorCorrectionLevel: 'H',
  margin: 2,
  color: { dark: '#3f4437', light: '#ffffff' },
})
await writeFile(new globalThis.URL('qr.svg', OUT), svg)

const png = await QRCode.toBuffer(URL, {
  type: 'png',
  errorCorrectionLevel: 'H',
  width: 1200,
  margin: 2,
  color: { dark: '#3f4437', light: '#ffffff' },
})
await writeFile(new globalThis.URL('qr-1200.png', OUT), png)

console.log('QR codes written to flyers/out/ for', URL)
