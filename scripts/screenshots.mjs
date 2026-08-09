// Utility: PNG previews of the flyers (for review) + the og-image asset.
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url))
const browser = await chromium.launch()

// Flyer previews at US Letter aspect (850x1100 CSS px)
const page = await browser.newPage({ viewport: { width: 816, height: 1056 } })
for (const name of ['flyer-a', 'flyer-b', 'flyer-c']) {
  await page.goto(`file://${root(`flyers/${name}.html`)}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: root(`flyers/out/${name}.png`), fullPage: false })
  console.log('Preview', name)
}

// og-image: public/og-image.png is exported from the Figma "Share Card" page
// (file R2SYtD77KvVrU274Gxht8j) — do not regenerate it here.

await browser.close()
