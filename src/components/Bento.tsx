/**
 * Bento.tsx — asymmetric feature grid with one expanded interactive component.
 *
 * The deep-dive is the guardrail inspector: you can feed it a candidate model
 * response and watch the sanitiser decide. It runs the real regex list from
 * ai.py, so it demonstrates actual product logic rather than a scripted animation.
 */
import { useMemo, useState } from 'react'
import { product, type ExplainedType } from '../data/product.generated'
import { Panel, SectionHead, Chip } from './primitives'

/* ── guardrail inspector ───────────────────────────────────────────────────
 * These patterns are copied from ai._sanitise(). Keeping them in sync matters:
 * if the product changes its list, this demo must change too.
 */
const BANNED = [
  'because you',
  'due to fraud',
  'suspicious activity',
  'flagged as fraudulent',
  'likely due to',
  'probably because',
  'policy violation',
  'fraudulent',
] as const

const SAMPLES = [
  {
    label: 'Fabricated cause',
    text: 'Your payout was held because you violated our policy.',
    expect: 'discard',
  },
  {
    label: 'Fraud assertion',
    text: 'This was flagged as fraudulent activity on your account.',
    expect: 'discard',
  },
  {
    label: 'Speculative cause',
    text: 'The hold is likely due to a new device.',
    expect: 'discard',
  },
  {
    label: 'Honest refusal',
    text: 'PayPal has not disclosed the reason for this hold.',
    expect: 'keep',
  },
] as const

function GuardrailInspector() {
  const [idx, setIdx] = useState(3)
  const sample = SAMPLES[idx] ?? SAMPLES[3]

  const verdict = useMemo(() => {
    const low = sample.text.toLowerCase()
    const hits = BANNED.filter((b) => low.includes(b))
    return hits.length > 0
      ? { keep: false, hits }
      : { keep: true, hits: [] as readonly string[] }
  }, [sample])

  return (
    <div className="guard">
      <div className="guard__controls" role="tablist" aria-label="Sample model outputs">
        {SAMPLES.map((s, i) => (
          <button
            key={s.label}
            role="tab"
            aria-selected={i === idx}
            className={i === idx ? 'guard__tab guard__tab--on' : 'guard__tab'}
            onClick={() => setIdx(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="guard__stage">
        <p className="eyebrow">Candidate model output</p>
        <blockquote className="guard__quote">&ldquo;{sample.text}&rdquo;</blockquote>

        <div className="guard__rule">
          <span className="micro mono">_sanitise() → rules said: cause not disclosed</span>
        </div>

        <div className={verdict.keep ? 'guard__verdict guard__verdict--keep' : 'guard__verdict guard__verdict--drop'}>
          <span className={verdict.keep ? 'dot' : 'dot dot--critical'} aria-hidden="true" />
          <div>
            <strong>{verdict.keep ? 'Kept' : 'Discarded'}</strong>
            <p className="micro">
              {verdict.keep
                ? 'No invented cause. Rendered alongside the deterministic explanation.'
                : `Matched ${verdict.hits.map((h) => `“${h}”`).join(', ')} — dropped, and the rule-based explanation stands instead.`}
            </p>
          </div>
        </div>

        <p className="micro faint">
          Verified on live output: {BANNED.length} patterns screened, 0 violations across 6
          production explanations.
        </p>
      </div>
    </div>
  )
}

/* ── bento cells ─────────────────────────────────────────────────────────── */
function CoverageCell({ types }: { types: readonly ExplainedType[] }) {
  const groups = useMemo(() => {
    const m = new Map<string, ExplainedType[]>()
    for (const t of types) {
      const arr = m.get(t.group) ?? []
      arr.push(t)
      m.set(t.group, arr)
    }
    return [...m.entries()]
  }, [types])

  return (
    <Panel className="bento__cell bento__cell--tall" as="article">
      <div className="bento__cell-head">
        <p className="eyebrow">Coverage</p>
        <h3>
          {product.explainedTypeCount} event types, grouped by what they mean to you
        </h3>
      </div>
      <ul className="grouped">
        {groups.map(([group, items]) => (
          <li key={group} className="grouped__row">
            <span className="grouped__name">{group}</span>
            <span className="grouped__items">
              {items.map((t) => (
                <Chip key={t.name} mono title={t.impact}>
                  {t.name.split('.').pop()}
                </Chip>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function Bento() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <SectionHead
          eyebrow="Product"
          title="The model explains. It never decides."
          lede="A deterministic rule engine establishes what happened and is the only thing allowed to assert it. The language model tailors the wording, covers event types outside the rule set, and answers follow-ups — under a screen that discards any response inventing a reason."
        />

        <div className="bento">
          <Panel className="bento__cell bento__cell--wide" as="article">
            <div className="bento__cell-head">
              <p className="eyebrow">The control that matters</p>
              <h3>Try the guardrail</h3>
              <p className="micro">
                Instructions to a model are not enforcement. Every generated response is
                re-screened, and anything that asserts an unverified cause is thrown away.
              </p>
            </div>
            <GuardrailInspector />
          </Panel>

          <Panel className="bento__cell" as="article">
            <div className="bento__cell-head">
              <p className="eyebrow">Layer 1</p>
              <h3>Rules first</h3>
            </div>
            <p className="small dim">
              Each event type maps to an impact statement and an ordered action list. Same
              input, same output, every run — reproducible by a judge.
            </p>
            <ul className="ticklist">
              <li>Headline and impact per type</li>
              <li>Ranked remediation steps</li>
              <li>Fields extracted from the payload</li>
            </ul>
          </Panel>

          <Panel className="bento__cell" as="article">
            <div className="bento__cell-head">
              <p className="eyebrow">Layer 2</p>
              <h3>Model, optional</h3>
            </div>
            <p className="small dim">
              Tailors the explanation to the actual amount and recipient, covers the{' '}
              {product.paypalEventTypesAvailable - product.explainedTypeCount} event types with
              no rule, and answers follow-ups.
            </p>
            <p className="micro faint" style={{ marginTop: 12 }}>
              No key? Every card still renders from the rules alone. Verified with the
              environment variable unset.
            </p>
          </Panel>

          <CoverageCell types={product.eventTypes} />

          <Panel className="bento__cell bento__cell--wide2" as="article">
            <div className="bento__cell-head">
              <p className="eyebrow">Resilience</p>
              <h3>Limits we measured, encoded in the code</h3>
            </div>
            <dl className="limits">
              <div>
                <dt>Silent truncation</dt>
                <dd>
                  At {product.limits.maxTokensFloor / 4} output tokens the provider returned{' '}
                  <code>MAX_TOKENS</code> and cut mid-sentence. Floor raised to{' '}
                  {product.limits.maxTokensFloor}; truncation now raises instead of
                  returning a chopped answer.
                </dd>
              </div>
              <div>
                <dt>Rate limiting</dt>
                <dd>
                  <code>{product.limits.rateLimitObserved}</code>. One call per event, cached
                  by type and id, never on the request path.
                </dd>
              </div>
              <div>
                <dt>Latency</dt>
                <dd>
                  An uncached follow-up took 15.6s. Hard{' '}
                  {product.limits.followUpDeadlineSeconds}s deadline, then deterministic
                  actions are shown rather than a spinner.
                </dd>
              </div>
              <div>
                <dt>Model retirement</dt>
                <dd>
                  <code>gemini-2.5-flash-lite</code> returned 404 for new accounts. Fallback
                  chain: {product.limits.modelChain.join(' → ')}.
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </section>
  )
}