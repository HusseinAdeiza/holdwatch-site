#!/usr/bin/env node
/**
 * build.ts — read the live product, bake the figures, then build.
 *
 * The site must never publish a number we cannot verify. This runs BEFORE
 * vite build and exits non-zero if the deployment cannot be reached, so a build
 * without live data fails loudly instead of shipping invented figures.
 *
 *   npm run build   ->   node build.ts && vite build
 *
 * Env:
 *   DASH_URL   the HoldWatch deployment to read (default: production)
 *   PAYPAL_REPO path to eval_report.json, if it is not already copied in
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, 'src/data/site.generated.json')

const DASH = process.env.DASH_URL ?? 'https://holdwatch-dashboard.onrender.com'
const PAYPAL = process.env.PAYPAL_REPO ?? '/root/web3alphatester/paypal'
const TIMEOUT_MS = 25_000

function die(msg: string, detail?: unknown): never {
  console.error(`\n  BUILD STOPPED — ${msg}\n`)
  if (detail) console.error(String(detail).slice(0, 600), '\n')
  console.error('  Refusing to publish figures we cannot verify.')
  process.exit(1)
}

async function get(url: string): Promise<Response> {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { signal: ctl.signal })
  } finally {
    clearTimeout(t)
  }
}

console.log(`  reading live product: ${DASH}`)

// The production route, bare — the same one the dashboard itself calls. Using
// ?ai=0 would test the fast path, which is not what a judge loads.
let events: {
  total: number
  verified: number
  covered: number
  needs_action: number
  ai_enabled: boolean
  review: { passed: boolean }
}

try {
  const res = await get(`${DASH}/api/events`)
  if (!res.ok) die(`${DASH}/api/events returned HTTP ${res.status}`)
  const text = await res.text()
  try {
    events = JSON.parse(text)
  } catch {
    die('the response was not JSON — likely an HTML error page from a proxy', text.slice(0, 200))
  }
} catch (e) {
  die(`could not reach ${DASH}`, e)
}

if (typeof events.total !== 'number' || events.total === 0) {
  die('the deployment reported zero events — refusing to publish a page about nothing', events)
}
if (typeof events.covered !== 'number' || events.covered === 0) {
  die('the deployment reported zero covered event types', events)
}

// The evaluation figures come from the product repo, and are checked against it
// rather than trusted.
const evalPath = resolve(HERE, 'src/data/eval_report.json')
if (!existsSync(evalPath)) {
  const from = resolve(PAYPAL, 'eval_report.json')
  if (!existsSync(from)) die(`no eval_report.json at ${evalPath} or ${from}`)
  mkdirSync(dirname(evalPath), { recursive: true })
  writeFileSync(evalPath, readFileSync(from))
}

const ev = JSON.parse(readFileSync(evalPath, 'utf8')) as {
  recall_on_known_hold_shapes: number
  precision_on_known_clean_shapes: number
  f1: number
  confusion: { false_negative: number; false_positive: number }
  n_scenarios: number
}

// Sanity: the eval must describe the same engine the site describes.
if (ev.confusion.false_positive !== 0) {
  die('the evaluation reports false positives — the site claims zero, so they must agree')
}

const now = new Date()
const payload = {
  total: events.total,
  verified: events.verified,
  covered: events.covered,
  needsAction: events.needs_action,
  aiEnabled: events.ai_enabled,
  reviewerPassed: events.review?.passed === true,
  readAt: now.toISOString(),
  readAtUnix: now.getTime(),
  // Real identifiers, published deliberately: they are checkable in PayPal's
  // dashboard, which is the point.
  webhookId: '10530851TK1789235',
  captureId: '6YH19408NM0071141',
  recall: ev.recall_on_known_hold_shapes,
  precision: ev.precision_on_known_clean_shapes,
  f1: ev.f1,
  misses: ev.confusion.false_negative,
  scenarios: ev.n_scenarios,
  onHoldToken: 'ONHOLD',
}

writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n')

console.log(
  `  ok — ${payload.total} events, ${payload.verified} verified, ` +
  `${payload.covered} types, recall ${payload.recall}, ${payload.precision} precision`,
)
console.log(`  wrote ${OUT.replace(HERE + '/', '')}`)
console.log(`  read at ${payload.readAt}`)
