/**
 * Footer.tsx — directory columns plus a live status strip.
 *
 * The status values come from the generated product data, so the footer cannot
 * advertise a different state from the one the rest of the page reports.
 */
import { product } from '../data/product.generated'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how' },
      { label: 'Event coverage', href: '#events' },
      { label: 'Request path', href: '#pipeline' },
      { label: 'Integrity', href: '#integrity' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { label: 'PayPal webhooks', href: 'https://developer.paypal.com/api/rest/webhooks/' },
      { label: 'Signature verification', href: 'https://developer.paypal.com/api/rest/webhooks/rest/' },
      { label: 'Event names', href: 'https://developer.paypal.com/api/rest/webhooks/event-names/' },
      { label: 'Sandbox dashboard', href: 'https://developer.paypal.com/dashboard/' },
    ],
  },
  {
    title: 'Repository',
    links: [
      { label: 'Source', href: 'https://github.com/HusseinAdeiza/holdwatch' },
      { label: 'README', href: 'https://github.com/HusseinAdeiza/holdwatch#readme' },
      { label: 'LICENSE (MIT)', href: 'https://github.com/HusseinAdeiza/holdwatch/blob/main/LICENSE' },
      { label: 'Issues', href: 'https://github.com/HusseinAdeiza/holdwatch/issues' },
    ],
  },
] as const

const STATUS = [
  { label: 'Webhook endpoint', value: 'registered', tone: 'info' as const },
  { label: 'Signature check', value: 'enforced', tone: 'info' as const },
  { label: 'Forged events', value: 'rejected', tone: 'info' as const },
  { label: 'AI layer', value: 'optional', tone: 'info' as const },
  { label: 'Transaction Search', value: 'partner-gated', tone: 'medium' as const },
]

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__status">
          <div className="foot__status-head">
            <p className="eyebrow">System status</p>
            <span className="foot__live">
              <span className="dot dot--live" aria-hidden="true" />
              receiver running
            </span>
          </div>
          <ul className="foot__status-list">
            {STATUS.map((s) => (
              <li key={s.label}>
                <span className={`dot dot--${s.tone}`} aria-hidden="true" />
                <span className="foot__status-label">{s.label}</span>
                <span className="foot__status-value mono">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="foot__cols">
          <div className="foot__brand">
            <span className="foot__wordmark">HoldWatch</span>
            <p className="micro dim">
              Reads PayPal&rsquo;s restriction events and tells you what happened to your
              money, what is known, and what to do next.
            </p>
            <p className="micro faint">
              {product.explainedTypeCount} event types explained ·{' '}
              {product.paypalEventTypesAvailable} available from PayPal
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className="foot__col" aria-label={col.title}>
              <h4 className="foot__col-title">{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a className="foot__link" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="foot__legal">
          <p className="micro faint">
            Not affiliated with PayPal. PayPal is a trademark of its respective owner.
          </p>
          <p className="micro faint">
            Figures on this page are exported from the running product. Limitations are
            documented in the repository README.
          </p>
        </div>
      </div>
    </footer>
  )
}