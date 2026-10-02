/**
 * Walkthrough.tsx — the request path, step by step.
 *
 * Each step is what the code actually does, with the real endpoint, method and
 * status. The AI step is shown last and marked optional, because that is the
 * order and the dependency in the real pipeline.
 */
import { useState } from 'react'
import { Panel, SectionHead } from './primitives'

interface Step {
  id: string
  n: string
  title: string
  does: string
  code: string
  detail: string
  optional?: boolean
}

const STEPS: readonly Step[] = [
  {
    id: 'receive',
    n: '01',
    title: 'PayPal posts the event',
    does: 'Webhook delivery to a public HTTPS endpoint',
    code: 'POST /  ·  PAYMENT.PAYOUTS-ITEM.HELD',
    detail:
      'PayPal retries delivery up to 25 times over 3 days, so the intake is keyed on transmission_id + event_type rather than the event id — the simulate endpoint reuses one id across types, which silently collapsed distinct events in our first build.',
  },
  {
    id: 'verify',
    n: '02',
    title: 'Signature is checked against PayPal',
    does: 'Trust anchor is PayPal, not local arithmetic',
    code: 'POST /v1/notifications/verify-webhook-signature',
    detail:
      'We first implemented this as a local CRC32 and it returned false for every genuine event while looking correct. Local checksums are also symmetric, so one observed triple would let an attacker forge others. Anything failing verification is rejected at intake with HTTP 400 — a monitor that renders unverified events would amplify the attack it claims to detect.',
  },
  {
    id: 'dedup',
    n: '03',
    title: 'Re-deliveries collapse',
    does: 'Replay-safe before anything is stored',
    code: 'seen = transmission_id + event_type',
    detail:
      'Duplicate suppression happens before the event reaches disk or the UI, so a retried delivery cannot inflate a count or re-trigger a notification.',
  },
  {
    id: 'rules',
    n: '04',
    title: 'The rule engine decides the facts',
    does: 'Deterministic. This layer is the source of truth',
    code: 'explainer.py → headline · impact · cause · actions',
    detail:
      `Covers ${19} event types. Each produces an impact statement, the fields extracted from the payload, and an ordered action list. The engine also carries its own confidence: where PayPal does not disclose a reason, it says so instead of inferring one.`,
  },
  {
    id: 'ai',
    n: '05',
    title: 'The model phrases and tailors',
    does: 'Optional, guarded, never authoritative',
    code: 'ai.py → tailor · cover unknown types · answer follow-ups',
    detail:
      'Given the rule output as ground truth, the model rewrites it for the specific amount and recipient, explains event types with no rule, and answers follow-ups. Its output is re-screened: text asserting an unverified cause is discarded. Without a key this step is skipped and the product is unchanged.',
    optional: true,
  },
  {
    id: 'surface',
    n: '06',
    title: 'The dashboard renders it',
    does: 'Severity-coded, with the evidence one click away',
    code: 'GET /api/events',
    detail:
      'Cards are ordered by severity and each exposes the raw payload fields it was derived from. An outside reviewer runs on this live output, checking for duplicate explanations, missing actions, and confidence claims the event does not support.',
  },
]

export function Walkthrough() {
  const [active, setActive] = useState(0)
  const step = STEPS[active] ?? STEPS[0]!

  return (
    <section className="section section--tight" id="pipeline">
      <div className="wrap">
        <SectionHead
          eyebrow="Request path"
          title="What actually happens when a payout is held"
          lede="Six steps, in the order they execute. Five are deterministic and required; the sixth is the model, and the product is complete without it."
        />

        <div className="walk">
          <ol className="walk__rail" role="tablist" aria-label="Pipeline steps">
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? 'walk__step walk__step--on' : 'walk__step'}
                  onClick={() => setActive(i)}
                >
                  <span className="walk__n tnum">{s.n}</span>
                  <span className="walk__title">
                    {s.title}
                    {s.optional ? <span className="walk__opt">optional</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <Panel className="walk__detail" variant="ink" key={step.id}>
            <p className="walk__does">{step.does}</p>
            <code className="walk__code">{step.code}</code>
            <p className="walk__body">{step.detail}</p>
            <div className="walk__progress" aria-hidden="true">
              <span style={{ width: `${((active + 1) / STEPS.length) * 100}%` }} />
            </div>
            <p className="walk__count tnum">
              Step {active + 1} of {STEPS.length}
            </p>
          </Panel>
        </div>
      </div>
    </section>
  )
}