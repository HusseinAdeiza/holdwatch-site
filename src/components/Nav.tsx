/**
 * Nav.tsx — sticky bar, backdrop blur, one primary CTA.
 *
 * The blur here is a functional affordance (content scrolls under a fixed bar),
 * not decorative glassmorphism: opacity is high enough that text stays legible.
 */
import { useEffect, useState } from 'react'
import { LinkButton } from './primitives'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#events', label: 'Event coverage' },
  { href: '#integrity', label: 'Integrity' },
  { href: '#evaluation', label: 'Evaluation' },
] as const

export function Nav() {
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={stuck ? 'nav nav--stuck' : 'nav'}>
      <div className="wrap nav__inner">
        <a className="nav__brand" href="#top" aria-label="HoldWatch home">
          <span className="nav__mark" aria-hidden="true">
            <span className="nav__mark-bar" />
            <span className="nav__mark-bar" />
            <span className="nav__mark-bar" />
          </span>
          <span className="nav__wordmark">HoldWatch</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} className="nav__link" href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a className="nav__link nav__link--quiet" href="https://github.com/HusseinAdeiza/holdwatch">
            Source
          </a>
          <LinkButton size="sm" href="https://github.com/HusseinAdeiza/holdwatch">
            View the build
          </LinkButton>
        </div>
      </div>
    </header>
  )
}