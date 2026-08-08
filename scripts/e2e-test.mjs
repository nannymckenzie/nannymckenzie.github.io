// End-to-end verification: drives the live deployed page, submits a real
// lead, and captures screenshots for the morning report.
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const LIVE = 'https://mckenzie-conner.github.io/mckenzie-ochoa-conner/?src=e2e-test'
const out = (p) => fileURLToPath(new URL(`../flyers/out/${p}`, import.meta.url))

const browser = await chromium.launch()

// Desktop screenshot
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await desktop.goto(LIVE, { waitUntil: 'networkidle' })
await desktop.screenshot({ path: out('site-desktop.png'), fullPage: true })
console.log('desktop screenshot ok')

// Mobile screenshot
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(LIVE, { waitUntil: 'networkidle' })
await mobile.screenshot({ path: out('site-mobile.png'), fullPage: true })
console.log('mobile screenshot ok')

// Real submission through the deployed form
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(LIVE, { waitUntil: 'networkidle' })
await page.fill('#parent_name', 'E2E Verification')
await page.fill('#email', 'e2e-verify@example.com')
await page.fill('#phone', '360-555-0199')
await page.selectOption('#contact_method', 'Email')
await page.selectOption('#town', 'Bellingham')
await page.fill('#neighborhood', 'Columbia')
await page.fill('#children_ages', 'one kid, age 3')
await page.fill('#start_date', '2026-09-01')
await page.fill('#schedule', '8am to 4pm')
await page.fill('#message', 'Automated end-to-end verification submission. Safe to delete.')
await page.waitForTimeout(3500) // satisfy the min-submit-time spam check
await page.click('#submit-btn')
await page.waitForSelector('#form-success:not([hidden])', { timeout: 15000 })
const successText = await page.textContent('#form-success h3')
await page.screenshot({ path: out('site-success.png') })
console.log('SUCCESS STATE:', successText.trim())

await browser.close()
