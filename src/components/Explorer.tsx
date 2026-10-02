/**
 * Explorer.tsx — the interactive event table + the evaluation harness.
 *
 * The table is filterable over the real explained-type set, so it doubles as the
 * coverage claim: there is nothing in it that the product cannot actually handle.
 */
import { useMemo, useState } from 'react'
import { product, type CapturedEvent, type ExplainedType } from '../data/product.generated'
import { Panel, SectionHead, SeverityTag, Chip, type Severity } from './primitives'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'critical', label: 'Critical' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'info', label: 'Informational' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

export function Explorer() {
  const [filter, setFilter] = useState<FilterId>('all')
  const [openId, setOpenId] = useState<string | null>(product.events[0]?.id ?? null)

  const rows = useMemo(() => {
    const all = product.eventTypes
    if (filter === 'all') return all
    return all.filter((t) => t.severity === filter)
  }, [filter])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: product.eventTypes.length }
    for (const t of product.eventTypes) c[t.severity] = (c[t.severity] ?? 0) + 1
    return c
  }, [])

  return (
    <section className="section" id="events">
      <div className="wrap">
        <SectionHead
          eyebrow="Explained event types"
          title="Every type, filterable by severity"
          lede={`All ${product.explainedTypeCount} are handled with an impact statement and ranked actions. The ${product.causesUnknown} marked “cause not disclosed” are cases where PayPal does not publish a reason and we decline to invent one.`}
        />

        <div className="explorer">
          <div className="explorer__filters" role="tablist" aria-label="Filter by severity">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={filter === f.id ? 'fbtn fbtn--on' : 'fbtn'}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="fbtn__n tnum">{counts[f.id] ?? 0}</span>
              </button>
            ))}
          </div>

          <Panel className="explorer__table">
            <table className="etable">
              <caption className="sr-only">
                PayPal event types explained by HoldWatch, filtered by severity
              </caption>
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Event type</th>
                  <th scope="col">What the user is told</th>
                  <th scope="col" className="num">Cause</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t: ExplainedType) => (
                  <tr key={t.name}>
                    <td>
                      <SeverityTag severity={t.severity as Severity} label={t.severity} />
                    </td>
                    <td>
                      <code className="etable__event">{t.name}</code>
                    </td>
                    <td className="etable__say">{t.headline}</td>
                    <td className="num">
                      {t.confidence === 'confirmed' ? (
                        <Chip mono>stated</Chip>
                      ) : (
                        <Chip mono>not disclosed</Chip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>

        <Evaluation />

        <CapturedFeed openId={openId} onToggle={setOpenId} />
      </div>
    </section>
  )
}

/* ── evaluation ──────────────────────────────────────────────────────────── */
function Evaluation() {
  const ev = product.evaluation
  const c = ev.confusion
  const cells = [
    { k: 'Hold shape caught', v: c.true_positive, tone: 'ok' },
    { k: 'Hold shape missed', v: c.false_negative, tone: 'warn' },
    { k: 'Clean account flagged', v: c.false_positive, tone: 'ok' },
    { k: 'Clean account passed', v: c.true_negative, tone: 'ok' },
  ] as const

  return (
    <Panel className="eval" variant="sunk" as="article">
      <div className="eval__head">
        <p className="eyebrow">Evaluation</p>
        <h3>The original rule engine, scored on {ev.scenarios} scenarios</h3>
        <p className="micro">
          Built before the capability probe proved transaction history unreachable, and
          retained because the calibration is instructive. These accounts are synthetic and
          the ground truth is ours, not PayPal&rsquo;s — the number shows the engine
          discriminates between known shapes, nothing more.
        </p>
      </div>

      <div className="eval__grid">
        <div className="eval__scores">
          {[
            { label: 'Recall', value: ev.recall, note: 'of known hold shapes' },
            { label: 'Precision', value: ev.precision, note: 'no false alarms' },
            { label: 'F1', value: ev.f1, note: `${Math.round(ev.accuracy * 100)}% accuracy` },
          ].map((m) => (
            <div key={m.label} className="score">
              <span className="score__label">{m.label}</span>
              <span className="score__value tnum">{m.value.toFixed(2)}</span>
              <div className="score__track" aria-hidden="true">
                <span style={{ width: `${m.value * 100}%` }} />
              </div>
              <span className="score__note">{m.note}</span>
            </div>
          ))}
        </div>

        <div className="eval__matrix">
          <div className="matrix">
            <div className="matrix__cell matrix__cell--hit">
              <span className="tnum">{c.true_positive}</span>
              <span>caught</span>
            </div>
            <div className="matrix__cell matrix__cell--miss">
              <span className="tnum">{c.false_negative}</span>
              <span>missed</span>
            </div>
            <div className="matrix__cell matrix__cell--clean">
              <span className="tnum">{c.false_positive}</span>
              <span>false alarm</span>
            </div>
            <div className="matrix__cell matrix__cell--clean">
              <span className="tnum">{c.true_negative}</span>
              <span>passed</span>
            </div>
          </div>
          <ul className="eval__legend">
            {cells.map((x) => (
              <li key={x.k}>
                <span className={`dot dot--${x.tone === 'ok' ? 'info' : 'medium'}`} aria-hidden="true" />
                {x.k}
              </li>
            ))}
          </ul>
          <p className="micro faint">
            First pass scored recall 0.20 — it could not cry wolf. Two calibration rounds
            fixed that; the zero on false alarms held throughout.
          </p>
        </div>
      </div>
    </Panel>
  )
}

/* ── captured feed ───────────────────────────────────────────────────────── */
function CapturedFeed({
  openId,
  onToggle,
}: {
  openId: string | null
  onToggle: (id: string) => void
}) {
  return (
    <div className="feed">
      <div className="feed__head">
        <p className="eyebrow">Captured stream</p>
        <h3>Events received during testing</h3>
        <p className="micro">
          {product.events.length} events, each signature-verified by PayPal. Expand a row to
          read the explanation the product produced and the payload fields behind it.
        </p>
      </div>

      <ul className="feed__list">
        {product.events.map((e: CapturedEvent) => {
          const open = openId === e.id
          return (
            <li key={`${e.eventType}-${e.id}`} className={open ? 'feed__row feed__row--open' : 'feed__row'}>
              <button
                className="feed__btn"
                aria-expanded={open}
                onClick={() => onToggle(e.id)}
              >
                <span className="feed__chev" aria-hidden="true">
                  {open ? '−' : '+'}
                </span>
                <span className="feed__label">
                  <SeverityTag severity={e.severity as Severity} label={e.kind} />
                  <code className="feed__event">{e.eventType}</code>
                </span>
                <span className="feed__amount tnum">{e.amount ?? '—'}</span>
              </button>

              {open ? (
                <div className="feed__body">
                  <h4>{e.headline}</h4>
                  <p className="small dim">{e.impact}</p>
                  <div className="feed__grid">
                    <div>
                      <p className="eyebrow">Remediation</p>
                      <ol className="feed__actions">
                        {e.actions.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="eyebrow">From the payload</p>
                      <dl className="feed__facts">
                        {e.payoutItemId ? (
                          <>
                            <dt>payout_item_id</dt>
                            <dd className="mono">{e.payoutItemId}</dd>
                          </>
                        ) : null}
                        {e.receiver ? (
                          <>
                            <dt>receiver</dt>
                            <dd className="mono">{e.receiver}</dd>
                          </>
                        ) : null}
                        {e.transactionStatus ? (
                          <>
                            <dt>transaction_status</dt>
                            <dd className="mono">{e.transactionStatus}</dd>
                          </>
                        ) : null}
                        <dt>fields extracted</dt>
                        <dd className="tnum">{e.fieldCount}</dd>
                      </dl>
                      <p className="micro faint" style={{ marginTop: 12 }}>
                        {e.cause
                          ? 'Cause confirmed by the payload.'
                          : 'PayPal does not disclose a cause for this event type. The product says so rather than inferring one.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}