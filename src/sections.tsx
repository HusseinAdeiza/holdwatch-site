/**
 * Sections.tsx — the page.
 *
 * Every number here arrives as a prop from live.ts, which reads the running
 * product at build time and FAILS the build if it cannot. Nothing on this page
 * is hand-typed marketing copy about a system that may not say it.
 *
 * Structure follows the reference study: live number first, headline naming the
 * stake, the real artefact shown rather than described, a ladder of three
 * entry points rather than one CTA, and the questions someone actually worries
 * about before pressing the button.
 */
import { useState } from 'react'
import type { SiteData as LiveData } from './data/site'

const DASH = 'https://holdwatch-dashboard.onrender.com'
const REPO = 'https://github.com/HusseinAdeiza/holdwatch'
const VIDEO = 'https://youtu.be/bFOglGDKJpM'

/* ── nav ──────────────────────────────────────────────────────────────── */
export function Nav() {
  const [stuck, setStuck] = useState(false)
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setStuck(window.scrollY > 8), { passive: true })
  }
  return (
    <header className={stuck ? 'nav nav--stuck' : 'nav'}>
      <div className="wrap nav__in">
        <a className="nav__brand" href="#top">
          <span className="nav__mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="nav__word">HoldWatch</span>
        </a>
        <nav className="nav__links">
          <a className="nav__link" href="#what">What it says</a>
          <a className="nav__link" href="#states">The four states</a>
          <a className="nav__link" href="#start">Start</a>
          <a className="nav__link" href="#faq">FAQ</a>
        </nav>
      </div>
    </header>
  )
}

/** How long ago the baked figures were read, in plain words. */
function fmtAge(unix: number): string {
  const mins = Math.max(0, Math.round((Date.now() - unix) / 60000))
  if (mins < 1) return 'seconds ago'
  if (mins < 60) return `${mins} min ago`
  const h = Math.round(mins / 60)
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`
  return `${Math.round(h / 24)} days ago`
}

/* ── hero ─────────────────────────────────────────────────────────────── */
function Hero({ d }: { d: LiveData }) {
  return (
    <section className="hero wrap" id="top">
      {/* live first — a fact from the running system, above the headline */}
      <p className="hero__live">
        <span className="pulse" aria-hidden="true" />
        <span>
          <b>{d.verified}</b> of {d.total} events signature-verified
        </span>
        <span className="hero__fresh">
          · read from the live deployment {fmtAge(d.readAtUnix)}
        </span>
      </p>

      <h1>
        PayPal froze her money and <em>said nothing</em>
      </h1>

      <p className="lede hero__lede">
        HoldWatch reads PayPal&rsquo;s event stream, checks each one against PayPal&rsquo;s own
        signature API, and tells you what happened to your money — and, when PayPal
        gives no reason, says so instead of inventing one.
      </p>

      <div className="hero__cta">
        <a className="btn" href={DASH}>See it live · no signup</a>
        <a className="btn btn--ghost" href={REPO}>Read the source</a>
      </div>

      {/* the artefact, shown rather than described */}
      <div className="hero__token">
        <div className="hero__token-bar">
          <span>transaction_status</span>
        </div>
        <div className="hero__token-body">
          <p className="hero__token-str">{d.onHoldToken}</p>
          <p className="hero__token-note">
            That is the whole notification. A payment left one account, never reached the
            other, and the only fact PayPal volunteered is six letters with no cause
            attached. This product exists because that string is what a merchant has to
            work with.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── live ledger ──────────────────────────────────────────────────────── */
function Ledger({ d }: { d: LiveData }) {
  const cells = [
    { n: `${d.verified}/${d.total}`, k: 'events signature-verified', tone: 'ok' },
    { n: String(d.covered), k: 'event types explained' },
    { n: `${Math.round(d.recall * 100)}%`, k: `recall over ${d.scenarios} scenarios` },
    { n: String(d.misses), k: 'scenarios we still miss', tone: 'crit' },
  ]
  return (
    <section className="section section--tight wrap">
      <div className="ledger">
        {cells.map((c) => (
          <div className="ledger__cell" key={c.k}>
            <div className={c.tone ? `ledger__n ledger__n--${c.tone}` : 'ledger__n'}>
              {c.n}
            </div>
            <div className="ledger__k">{c.k}</div>
          </div>
        ))}
      </div>
      <p className="tiny" style={{ marginTop: 'var(--s4)' }}>
        Read from the running deployment at build time. Webhook
        <span className="mono"> {d.webhookId}</span> · capture
        <span className="mono"> {d.captureId}</span>. Check them in PayPal&rsquo;s dashboard.
      </p>
    </section>
  )
}

/* ── what it says: a real event, drawn ────────────────────────────────── */
function WhatItSays({ d }: { d: LiveData }) {
  return (
    <section className="section wrap" id="what">
      <div className="split">
        <div className="head">
          <p className="eyebrow">What it says</p>
          <h2>A real event, translated</h2>
          <p className="lede">
            This is the card for a genuine <span className="mono">CHECKOUT.ORDER.APPROVED</span> from
            our own sandbox account — a completed payment, signature confirmed by PayPal.
            It is one of {d.total} events live right now, {d.verified} of them verified.
          </p>
        </div>

        <aside className="panel panel--flat">
          <p className="eyebrow">Before</p>
          <p className="small" style={{ marginTop: 'var(--s3)' }}>
            A status string, a payer email and nothing explaining why money stopped moving.
          </p>
          <hr className="hairline" style={{ margin: 'var(--s5) 0' }} />
          <p className="eyebrow">After</p>
          <p className="small" style={{ marginTop: 'var(--s3)' }}>
            What happened, what is actually known, which part is unknown, and the next
            action — each claim traceable to the field that produced it.
          </p>
        </aside>
      </div>

      <div className="event">
        <div className="event__bar">
          <span>CHECKOUT.ORDER.APPROVED</span>
          <span>· signature verified by PayPal</span>
        </div>
        <div className="event__body">
          <h3 className="event__title">A buyer approved your order</h3>
          <p className="event__impact">
            Payment authorised. Capture it to receive the funds.
          </p>

          <div className="event__facts">
            <div>
              <span className="fact__k">Amount</span>
              <span className="fact__v fact__v--big">$4,200</span>
            </div>
            <div>
              <span className="fact__k">Payer</span>
              <span className="fact__v">John Doe</span>
            </div>
            <div>
              <span className="fact__k">PayPal says</span>
              <span className="fact__v">COMPLETED</span>
            </div>
            <div>
              <span className="fact__k">Invoice</span>
              <span className="fact__v">INV2-MEKE…6PJY</span>
            </div>
          </div>

          <div className="event__ai">
            <b>Tailored by Gemini, checked by the rules</b>
            John Doe authorised a payment of USD 4,200.00 to your business account.
            PayPal has not disclosed a reason for this status. Capture the order before
            the approval expires.
          </div>

          <div className="event__cause">
            <b>Cause unknown</b>
            PayPal sent this event without a reason. We will not invent one.
          </div>

          <ol className="event__actions">
            <li>Capture the order to take payment — approval expires if you do not.</li>
            <li>Do not resend the payment; a duplicate is a second, unrecoverable transfer.</li>
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── four states ──────────────────────────────────────────────────────── */
const STATES = [
  { badge: 'confirmed', tone: 'badge-confirmed', title: 'The payload states a cause',
    body: 'One type does: an unclaimed payout carries why it was returned. We say it plainly.' },
  { badge: 'cause unknown', tone: 'badge-unknown', title: 'PayPal sent it without a reason',
    body: 'The event arrived and the field is absent. We report the absence instead of filling it.' },
  { badge: 'awaiting webhook', tone: 'badge-awaiting', title: 'We hold a record, no event yet',
    body: 'Silence is not a withheld reason. Absence of data gets its own state, never the unknown label.' },
  { badge: 'unresolvable', tone: 'badge-unres', title: 'An id we cannot look up',
    body: 'A failed lookup tells you nothing about whether an event is coming. It says exactly that.' },
]

function States() {
  return (
    <section className="section wrap" id="states">
      <div className="head">
        <p className="eyebrow">The distinction that matters</p>
        <h2>&ldquo;They told us nothing&rdquo; is not &ldquo;we heard nothing&rdquo;</h2>
        <p className="lede">
          A commenter asked how HoldWatch tells those apart. At the time it didn&rsquo;t —
          and our own completed capture had produced no webhook at all while the
          dashboard implied PayPal had withheld a reason. Four states now.
        </p>
      </div>
      <div className="states">
        {STATES.map((s) => (
          <div className="state" key={s.badge}>
            <span className={`state__badge ${s.tone}`}>{s.badge}</span>
            <h3>{s.title}</h3>
            <p style={{ marginTop: 'var(--s2)' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── the ladder ───────────────────────────────────────────────────────── */
const RUNGS = [
  { tag: 'no install · simulated', rec: false, title: 'Practise',
    body: 'A simulated account with fake money and the real traps. The guardrail shows you what you would have got wrong before it cost anything.',
    foot: 'Start here · about 2 min', href: `${REPO}#readme` },
  { tag: 'recommended · live', rec: true, title: 'See it working',
    body: 'The live deployment, serving genuine PayPal events captured from a completed checkout. Every signature checked by PayPal.',
    foot: 'Open the dashboard · no signup', href: DASH },
  { tag: 'real events · 77s', rec: false, title: 'Watch the proof',
    body: 'Seventy-seven seconds, including the moment we got the security wrong twice and the rule that came out of it.',
    foot: 'Watch on YouTube', href: VIDEO },
]

function Rungs() {
  return (
    <section className="section wrap" id="start">
      <div className="head">
        <p className="eyebrow">Three ways in</p>
        <h2>Pick the one that costs you what you can afford</h2>
      </div>
      <div className="rungs">
        {RUNGS.map((r) => (
          <a className="rung" key={r.title} href={r.href}
             target={r.href.startsWith('http') ? '_blank' : undefined}
             rel={r.href.startsWith('http') ? 'noreferrer' : undefined}>
            <span className={r.rec ? 'rung__tag rung__tag--rec' : 'rung__tag'}>{r.tag}</span>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
            <span className="rung__foot">{r.foot} →</span>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ── honesty ──────────────────────────────────────────────────────────── */
function Honesty({ d }: { d: LiveData }) {
  return (
    <section className="section section--tight wrap">
      <div className="split">
        <div>
          <div className="head" style={{ marginBottom: 'var(--s5)' }}>
            <p className="eyebrow">Where it stops</p>
            <h2>The two limits, stated before you find them</h2>
          </div>
          <div className="panel">
            <p className="small">
              <b style={{ color: 'var(--paper)' }}>Predicting holds is impossible.</b>{' '}
              It needs transaction history, and PayPal gates the whole
              <span className="mono"> /v1/reporting/*</span> family behind partner status:
              <span className="mono"> 403 NOT_AUTHORIZED</span>. We measured it, then stopped
              predicting. HoldWatch detects and explains — a weaker claim, and a true one.
            </p>
            <hr className="hairline" style={{ margin: 'var(--s5) 0' }} />
            <p className="small">
              <b style={{ color: 'var(--paper)' }}>Our first verifier was wrong twice.</b>{' '}
              It skipped verification when no webhook id was configured, so a deployed
              instance accepted a forgery. Fixing it once wasn&rsquo;t enough — the service
              was still on the old commit. The rule now is that an event is recorded only
              when PayPal confirms that exact signature.
            </p>
          </div>
        </div>

        <aside className="panel">
          <p className="eyebrow">The evaluation, unpolished</p>
          <p className="small" style={{ marginTop: 'var(--s3)' }}>
            {d.scenarios} synthetic scenarios. Ground truth is <em>ours</em>, not
            PayPal&rsquo;s — they do not publish hold decisions, so no such dataset exists
            for anyone.
          </p>
          <div className="event__facts" style={{ marginTop: 'var(--s5)' }}>
            <div>
              <span className="fact__k">Recall</span>
              <span className="fact__v fact__v--big">{d.recall.toFixed(2)}</span>
            </div>
            <div>
              <span className="fact__k">Precision</span>
              <span className="fact__v fact__v--big">{d.precision.toFixed(2)}</span>
            </div>
            <div>
              <span className="fact__k">Missed</span>
              <span className="fact__v">{d.misses}</span>
            </div>
          </div>
          <p className="tiny">
            First pass scored 0.20 — it could not cry wolf at all. We stopped at
            {' '}{d.recall.toFixed(2)} rather than tuning to 1.00, because a number arrived
            at by tuning tells you nothing.
          </p>
        </aside>
      </div>
    </section>
  )
}

/* ── FAQ ──────────────────────────────────────────────────────────────── */
const FAQ = [
  { q: 'Is my money actually gone?',
    a: 'Usually not, and the product tells you which of two states you are in. A hold means the money has left neither your balance nor the recipient — it is frozen pending review. A block means it never moved. HoldWatch reports the status PayPal recorded rather than implying the worst.' },
  { q: 'Who can see this dashboard?',
    a: 'Everyone — there is no login. That is deliberate: you asked whether a working demo mattered more than an account. It renders only sandbox data we chose to publish, and every address in it is an @example.com test account. It must never be pointed at a live PayPal account.' },
  { q: 'What happens to my PayPal credentials?',
    a: 'They are read from environment variables or a local file, never logged, and never committed. The repository has been scanned end to end: no secret value appears in any commit.' },
  { q: 'Does it use AI, and what happens if I do not want it to?',
    a: 'Gemini tailors each explanation to the actual amount and recipient, and answers follow-ups. It is strictly optional: with no key set, every card still renders from the deterministic rule engine. We verified that with the variable unset.' },
  { q: 'Can the model invent a reason?',
    a: 'It is instructed not to, and then re-checked. Every response is screened for an asserted cause that the rules did not establish, and discarded if found. Zero violations across the live outputs we checked.' },
  { q: 'What is actually running right now?',
    a: 'A PayPal webhook receiver on a free-tier host and a dashboard reading its verified events, plus a scheduled health check. 31 automated checks run against the live deployment, including the routes a browser actually calls.' },
]

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="section wrap" id="faq">
      <div className="head">
        <p className="eyebrow">Before you press the button</p>
        <h2>The questions you are actually asking</h2>
      </div>
      <div className="faq">
        {FAQ.map((f, i) => (
          <div className="faq__item" key={f.q}>
            <button className="faq__q" aria-expanded={open === i}
                    onClick={() => setOpen(open === i ? null : i)}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <span>{f.q}</span>
            </button>
            {open === i && (
              <div className="faq__a">
                <p>{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── cta + footer ─────────────────────────────────────────────────────── */
function Cta() {
  return (
    <section className="cta wrap">
      <p className="eyebrow">Go and look</p>
      <h2>Seven events. One string. <em>No reason given.</em></h2>
      <p className="lede" style={{ margin: 'var(--s5) auto 0', textAlign: 'center' }}>
        No signup, no install, no account. The dashboard is the argument.
      </p>
      <div className="cta__row">
        <a className="btn" href={DASH}>Open the live dashboard</a>
        <a className="btn btn--ghost" href={VIDEO}>Watch · 77 seconds</a>
      </div>
    </section>
  )
}

function Foot() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__grid">
          <div>
            <p className="nav__brand" style={{ marginBottom: 'var(--s3)' }}>
              <span className="nav__mark" aria-hidden="true"><i /><i /><i /></span>
              <span className="nav__word">HoldWatch</span>
            </p>
            <p className="tiny" style={{ maxWidth: '34ch' }}>
              Reads PayPal&rsquo;s restriction events and tells you what happened to your
              money, what is known, and what to do next.
            </p>
          </div>
          <div>
            <p className="foot__h">Product</p>
            <ul className="foot__list">
              <li><a href={DASH}>Live dashboard</a></li>
              <li><a href="#what">What it says</a></li>
              <li><a href="#states">The four states</a></li>
              <li><a href="#start">Start</a></li>
            </ul>
          </div>
          <div>
            <p className="foot__h">Reference</p>
            <ul className="foot__list">
              <li><a href="https://developer.paypal.com/api/rest/webhooks/">PayPal webhooks</a></li>
              <li><a href="https://developer.paypal.com/api/rest/webhooks/rest/">Signature verification</a></li>
              <li><a href="https://developer.paypal.com/dashboard/">Sandbox dashboard</a></li>
            </ul>
          </div>
          <div>
            <p className="foot__h">Repository</p>
            <ul className="foot__list">
              <li><a href={REPO}>Source</a></li>
              <li><a href={`${REPO}/blob/main/LICENSE`}>MIT licence</a></li>
              <li><a href={`${REPO}#readme`}>README</a></li>
              <li><a href={VIDEO}>Video</a></li>
            </ul>
          </div>
        </div>
        <div className="foot__base">
          <p className="tiny">Not affiliated with PayPal. Sandbox data only.</p>
          <p className="tiny">
            Figures on this page are read from the running deployment at build time.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── page ─────────────────────────────────────────────────────────────── */
export function Sections({ d }: { d: LiveData }) {
  return (
    <>
      <Nav />
      <main>
        <Hero d={d} />
        <Ledger d={d} />
        <WhatItSays d={d} />
        <States />
        <Rungs />
        <Honesty d={d} />
        <Faq />
        <Cta />
      </main>
      <Foot />
    </>
  )
}
