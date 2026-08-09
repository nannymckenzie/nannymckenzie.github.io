// Generates the poster QR code as SVG + 1200px PNG with error correction H.
import { mkdir, writeFile } from 'node:fs/promises'
import QRCode from 'qrcode'

// Uppercase triggers QR alphanumeric mode (fewer modules = simpler code);
// hosts are case-insensitive and form.ts lowercases the query string.
const URL = 'HTTPS://NANNYMCKENZIE.GITHUB.IO/?SRC=POSTER'
const OUT = new globalThis.URL('../flyers/out/', import.meta.url)

await mkdir(OUT, { recursive: true })

const svg = await QRCode.toString(URL, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 2,
  color: { dark: '#3f4437', light: '#ffffff' },
})
await writeFile(new globalThis.URL('qr.svg', OUT), svg)

const png = await QRCode.toBuffer(URL, {
  type: 'png',
  errorCorrectionLevel: 'M',
  width: 1200,
  margin: 2,
  color: { dark: '#3f4437', light: '#ffffff' },
})
await writeFile(new globalThis.URL('qr-1200.png', OUT), png)

console.log('QR codes written to flyers/out/ for', URL)
