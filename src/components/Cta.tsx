/**
 * Cta.tsx — the closing section. One decision, three next steps, no ornament.
 */
import { product } from '../data/product.generated'
import { LinkButton } from './primitives'

const STEPS = [
  {
    n: '1',
    title: 'Run it',
    body: 'Add a PayPal sandbox Client ID and secret. The receiver, explainer and dashboard start with no other setup.',
    cmd: 'python3 receiver.py --port 8099',
  },
  {
    n: '2',
    title: 'Point a webhook at it',
    body: 'Subscription is API-only — the PayPal dashboard does not expose it. One authenticated call registers the event types.',
    cmd: 'python3 register_webhook.py https://your-host',
  },
  {
    n: '3',
    title: 'Add a key, optionally',
    body: 'The AI layer reads one environment variable. Without it every explanation still renders from the rules engine.',
    cmd: 'export GEMINI_API_KEY=…',
  },
] as const

export function Cta() {
  return (
    <section className="cta" id="start">
      <div className="wrap">
        <div className="cta__inner">
          <div className="cta__copy">
            <p className="eyebrow">Get started</p>
            <h2>Three commands to a working receiver</h2>
            <p className="lede">
              No framework, no build step, no vendor account. The dependency list is the
              Python standard library and one HTTP call to PayPal.
            </p>
            <div className="cta__actions">
              <LinkButton href="https://github.com/HusseinAdeiza/holdwatch">
                Clone the repository
              </LinkButton>
              {/* onInkGhost, not ghost: the ghost variant sets ink-on-ink text on
                  this dark section, which measured 1.02:1 and was effectively
                  invisible. Caught by a full-page contrast sweep. */}
              <LinkButton variant="onInkGhost" href="#top">
                Back to top
              </LinkButton>
            </div>
          </div>

          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="steps__item">
                <span className="steps__n tnum">{s.n}</span>
                <div className="steps__body">
                  <h3>{s.title}</h3>
                  <p className="small dim">{s.body}</p>
                  <code className="steps__cmd">{s.cmd}</code>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className="cta__foot micro faint">
          Built for the PayPal AI Hackathon · {product.subscribedEventTypes} event types
          subscribed · MIT licensed ·{' '}
          <a href="https://github.com/HusseinAdeiza/holdwatch">github.com/HusseinAdeiza/holdwatch</a>
        </p>
      </div>
    </section>
  )
}