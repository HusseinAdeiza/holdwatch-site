/**
 * Hero.tsx — outcome-led headline over a REAL product surface.
 *
 * The preview below is not an illustration: it renders an actual event captured
 * from PayPal's webhook stream (from product.generated.ts), including the real
 * severity, the real "cause not disclosed" state, and the real action list the
 * rules engine produces. Nothing here is drawn to look like a product.
 */
import { product, type CapturedEvent } from '../data/product.generated'
import { LinkButton, Chip, SeverityTag, type Severity } from './primitives'

/** Deterministic pick: the highest-severity captured event, so the hero always
 *  shows the most consequential thing the product actually caught. */
function heroEvent(events: readonly CapturedEvent[]): CapturedEvent | undefined {
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, info: 3 }
  return [...events].sort(
    (a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9),
  )[0]
}

function EventCard({ ev }: { ev: CapturedEvent }) {
  return (
    <div className="evcard">
      <div className="evcard__bar">
        <span className="evcard__dot" aria-hidden="true" />
        <span className="evcard__bar-label">Live webhook, signature verified</span>
        <SeverityTag severity={ev.severity as Severity} label={ev.kind} />
      </div>

      <div className="evcard__body">
        <p className="evcard__event mono">{ev.eventType}</p>
        <h3 className="evcard__headline">{ev.headline}</h3>
        <p className="evcard__impact">{ev.impact}</p>

        <div className="evcard__facts">
          {ev.amount ? (
            <div className="fact">
              <span className="fact__k">Amount</span>
              <span className="fact__v tnum">{ev.amount}</span>
            </div>
          ) : null}
          {ev.receiver ? (
            <div className="fact">
              <span className="fact__k">Recipient</span>
              <span className="fact__v mono">{ev.receiver}</span>
            </div>
          ) : null}
          {ev.transactionStatus ? (
            <div className="fact">
              <span className="fact__k">Status</span>
              <span className="fact__v mono">{ev.transactionStatus}</span>
            </div>
          ) : null}
          <div className="fact">
            <span className="fact__k">Payload fields</span>
            <span className="fact__v tnum">{ev.fieldCount}</span>
          </div>
        </div>

        <div className="evcard__unknown">
          <span className="badge badge--unknown">Cause not disclosed</span>
          <p>
            PayPal does not state why in this event. We show that rather than
            guessing — an invented reason sends people to the wrong remedy.
          </p>
        </div>

        <ol className="evcard__actions">
          {ev.actions.slice(0, 3).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export function Hero() {
  const ev = heroEvent(product.events)

  return (
    <section className="hero" id="top">
      <div className="wrap hero__inner">
        <div className="hero__copy">
          <p className="eyebrow reveal">PayPal webhook triage</p>
          <h1 className="reveal" style={{ animationDelay: '40ms' }}>
            A frozen payout arrives as{' '}
            <span className="hero__mono">ONHOLD</span>. Nobody tells you what it means.
          </h1>
          <p className="lede reveal" style={{ animationDelay: '80ms' }}>
            PayPal emits {product.paypalEventTypesAvailable} event types. HoldWatch reads the
            ones that move your money — held, blocked, failed, disputed — verifies each one
            against PayPal&rsquo;s signature API, and returns the impact, the evidence, and
            the next action.
          </p>

          <div className="hero__actions reveal" style={{ animationDelay: '120ms' }}>
            <LinkButton href="#how">See how it works</LinkButton>
            <LinkButton variant="ghost" href="https://github.com/HusseinAdeiza/holdwatch">
              Read the source
            </LinkButton>
          </div>

          <dl className="hero__stats reveal" style={{ animationDelay: '160ms' }}>
            <div>
              <dt>Event types explained</dt>
              <dd className="tnum">{product.explainedTypeCount}</dd>
            </div>
            <div>
              <dt>Subscribed to PayPal</dt>
              <dd className="tnum">{product.subscribedEventTypes}</dd>
            </div>
            <div>
              <dt>Reasons invented</dt>
              <dd className="tnum">0</dd>
            </div>
          </dl>

          <div className="hero__chips reveal" style={{ animationDelay: '200ms' }}>
            <Chip mono>MIT licensed</Chip>
            <Chip mono>PayPal sandbox + webhooks</Chip>
            <Chip mono>Runs with no AI key</Chip>
          </div>
        </div>

        <div className="hero__preview reveal" style={{ animationDelay: '240ms' }}>
          {ev ? <EventCard ev={ev} /> : null}
          <p className="hero__caption">
            Captured from <code>POST /v1/notifications/simulate-event</code>. Every field
            above came from PayPal; every sentence came from the rules engine.
          </p>
        </div>
      </div>
    </section>
  )
}