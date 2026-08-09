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

// og-image 1200x630
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await og.setContent(`<!doctype html><html><head><style>
  @font-face { font-family: 'Fraunces'; src: url('file://${root('node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2')}') format('woff2-variations'); font-weight: 100 900; }
  body { margin:0; width:1200px; height:630px; background:#f4ece4; font-family:'Fraunces',Georgia,serif; color:#3f4437; overflow:hidden; position:relative; }
  .blob1 { position:absolute; width:700px; height:700px; background:#8c8f6b; opacity:.35; border-radius:58% 42% 55% 45% / 50% 58% 42% 50%; top:-300px; right:-200px; }
  .blob2 { position:absolute; width:460px; height:460px; background:#e0c3a4; opacity:.4; border-radius:45% 55% 60% 40% / 55% 45% 55% 45%; bottom:-220px; left:-140px; }
  .wrap { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; padding:0 90px; }
  .eyebrow { font-style:italic; font-size:30px; color:#896447; margin:0 0 18px; }
  h1 { font-size:56px; line-height:1.15; margin:0 0 22px; max-width:900px; font-weight:560; }
  p { font-family:sans-serif; font-size:26px; color:#5c6050; margin:0; }
</style></head><body>
  <div class="blob1"></div><div class="blob2"></div>
  <div class="wrap">
    <p class="eyebrow">Hello! I'm McKenzie!</p>
    <h1>Teacher-Certified Early Childhood Educator</h1>
    <p>Full-time nanny childcare for one wonderful family · Bellingham, WA · Fall 2026</p>
  </div>
</body></html>`, { waitUntil: 'networkidle' })
await og.screenshot({ path: root('public/og-image.png') })
console.log('og-image written')

await browser.close()
