/**
 * Responsive smoke test: loads every portal route at three viewports in each
 * role, and reports horizontal overflow, console errors and clipped elements.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://localhost:3020'

const ROUTES = [
  '/', '/my-learning', '/catalogue', '/assessments', '/settings',
  '/skills-passport', '/certifications', '/career',
  '/knowledge', '/journey', '/vision', '/onboarding', '/ai-assistant',
  '/academies', '/manager', '/department', '/executive', '/organization-flow',
  '/admin/content', '/admin/learners', '/learning-ops', '/governance',
  '/analytics', '/masters', '/process-map', '/control-centre',
]

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

const ROLE = process.argv[2] ?? 'ld_admin'

const browser = await chromium.launch()
const ctx = await browser.newContext()
await ctx.addInitScript(
  ([role]) => window.localStorage.setItem('magppie-ld-role', role),
  [ROLE],
)

const problems = []

for (const vp of VIEWPORTS) {
  const page = await ctx.newPage()
  await page.setViewportSize({ width: vp.width, height: vp.height })

  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))

  for (const route of ROUTES) {
    errors.length = 0
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 45000 })
    } catch {
      problems.push(`${vp.name} ${route}: navigation timeout`)
      continue
    }
    await page.waitForTimeout(1200)

    const res = await page.evaluate(() => {
      const docW = document.documentElement.scrollWidth
      const winW = window.innerWidth
      const wide = []
      if (docW > winW + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect()
          if (r.width > 0 && r.right > winW + 1) {
            wide.push(
              `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`,
            )
            if (wide.length > 3) break
          }
        }
      }
      return { docW, winW, wide, title: document.title }
    })

    if (res.docW > res.winW + 1) {
      problems.push(
        `${vp.name} ${route}: OVERFLOW doc=${res.docW} win=${res.winW}\n    ${res.wide.join('\n    ')}`,
      )
    }
    const real = errors.filter(
      (e) => !e.includes('503') && !e.includes('Failed to load resource'),
    )
    if (real.length) {
      problems.push(`${vp.name} ${route}: CONSOLE ${real.slice(0, 2).join(' | ')}`)
    }
  }
  await page.close()
}

await browser.close()

if (problems.length === 0) {
  console.log(`PASS (${ROLE}): no overflow or console errors across ${ROUTES.length} routes x ${VIEWPORTS.length} viewports`)
} else {
  console.log(`ISSUES (${ROLE}): ${problems.length}`)
  for (const p of problems) console.log('  - ' + p)
}
