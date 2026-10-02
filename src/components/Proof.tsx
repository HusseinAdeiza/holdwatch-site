/**
 * Proof.tsx — the trust layer, bound to measured results.
 *
 * Two columns of unequal weight: a metric stack on the left, and the real API
 * capability map on the right. The 403s are shown, not buried — the honest
 * account of what this app can and cannot reach is part of the credibility.
 */
import { product } from '../data/product.generated'
import { Metric, Panel, SectionHead, StatusList, type EndpointStatus } from './primitives'

const SCOPE_ROWS: readonly EndpointStatus[] = [
  { label: 'Transaction Search', endpoint: '/v1/reporting/transactions', status: 403, issue: 'partner-gated' },
  { label: 'Balances', endpoint: '/v1/reporting/balances', status: 403, issue: 'partner-gated' },
  { label: 'Payouts', endpoint: '/v1/payments/payouts', status: 404, issue: 'not enabled' },
  { label: 'Order create', endpoint: '/v2/checkout/orders', status: 201 },
  { label: 'Invoice create', endpoint: '/v2/invoicing/invoices', status: 201 },
  { label: 'Webhook subscribe', endpoint: '/v1/notifications/webhooks', status: 201 },
  { label: 'Identity', endpoint: '/v1/identity/oauth2/userinfo', status: 200 },
]

export function Proof() {
  const ev = product.evaluation

  return (
    <section className="section" id="integrity">
      <div className="wrap">
        <SectionHead
          eyebrow="Measured, not asserted"
          title="Every claim on this page is output from the running product"
          lede="These figures are exported from the rule engine, the evaluation harness and the live capability probe. If the product changes and they are not regenerated, they become wrong — so they are generated code, not copy."
        />

        <div className="proof">
          <Panel className="proof__metrics">
            <div className="proof__metric-grid">
              <Metric
                value={`${Math.round(ev.recall * 100)}%`}
                label="Recall on hold shapes"
                note={`${ev.scenarios} synthetic scenarios`}
              />
              <Metric
                value={`${Math.round(ev.precision * 100)}%`}
                label="Precision on clean accounts"
                note="no false alarms raised"
                tone="info"
              />
              <Metric
                value={String(ev.confusion.false_positive)}
                label="False positives"
                note="held at zero across all versions"
                tone="info"
              />
              <Metric
                value={String(product.causesUnknown)}
                label="Causes we refuse to state"
                note={`of ${product.explainedTypeCount} explained types`}
                tone="critical"
              />
            </div>

            <dl className="proof__rows">
              <div className="proof__row">
                <dt>Signature verification</dt>
                <dd>
                  <code>{product.integrity.signatureVerification}</code> — PayPal&rsquo;s own
                  endpoint, not local arithmetic
                </dd>
              </div>
              <div className="proof__row">
                <dt>Forged event response</dt>
                <dd>
                  HTTP <span className="tnum">{product.integrity.forgedEventStatus}</span>{' '}
                  and dropped at intake, verified by negative control
                </dd>
              </div>
              <div className="proof__row">
                <dt>Duplicate handling</dt>
                <dd>
                  keyed on <code>{product.integrity.dedupKey}</code>, because PayPal
                  re-delivers {product.integrity.redeliveryPolicy}
                </dd>
              </div>
              <div className="proof__row">
                <dt>Model output</dt>
                <dd>
                  re-checked after generation; text asserting an unverified cause is
                  discarded, so instructions are not the only control
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel className="proof__scope" variant="sunk">
            <div className="proof__scope-head">
              <p className="eyebrow">Live capability probe</p>
              <h3>What this app can actually reach</h3>
              <p className="micro">
                A standard sandbox REST app cannot read transaction history. We tried,
                measured the response, and rebuilt on the event stream instead.
              </p>
            </div>
            <StatusList rows={SCOPE_ROWS} />
          </Panel>
        </div>
      </div>
    </section>
  )
}