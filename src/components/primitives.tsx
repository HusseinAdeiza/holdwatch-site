/**
 * primitives.tsx — the shared UI atoms.
 *
 * Deliberately small and unopinionated: layout and section composition lives in
 * sections/, everything reusable lives here. Keeping the split strict is what
 * stops the page turning into one 900-line component.
 */
import type { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

/* ── severity ─────────────────────────────────────────────────────────────
 * Severity is a closed union derived from the product's own event taxonomy.
 * Nothing invents a severity string at a call site.
 */
export type Severity = 'critical' | 'high' | 'medium' | 'info'

export const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  info: 3,
}

/* ── Button ────────────────────────────────────────────────────────────────── */
type Variant = 'solid' | 'ghost' | 'onInk' | 'onInkGhost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'md' | 'sm'
}

export function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    variant !== 'solid' ? `btn--${variant}` : '',
    size === 'sm' ? 'btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <button type="button" className={cls} {...rest} />
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: 'md' | 'sm'
}

export function LinkButton({
  variant = 'solid',
  size = 'md',
  className = '',
  ...rest
}: LinkButtonProps) {
  const cls = [
    'btn',
    variant !== 'solid' ? `btn--${variant}` : '',
    size === 'sm' ? 'btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <a className={cls} {...rest} />
}

/* ── Chip ───────────────────────────────────────────────────────────────── */
interface ChipProps {
  children: ReactNode
  mono?: boolean
  title?: string
}

export function Chip({ children, mono = false, title }: ChipProps) {
  return (
    <span className={mono ? 'chip chip--mono' : 'chip'} title={title}>
      {children}
    </span>
  )
}

/* ── SeverityTag ────────────────────────────────────────────────────────── */
export function SeverityTag({ severity, label }: { severity: Severity; label: string }) {
  return (
    <span className={`sev sev--${severity}`}>
      <span className={`dot dot--${severity}`} aria-hidden="true" />
      {label}
    </span>
  )
}

/* ── Metric ─────────────────────────────────────────────────────────────── */
interface MetricProps {
  value: string
  label: string
  note?: string
  tone?: 'default' | 'critical' | 'info'
}

export function Metric({ value, label, note, tone = 'default' }: MetricProps) {
  const color =
    tone === 'critical' ? 'var(--critical)' : tone === 'info' ? 'var(--info)' : 'var(--text)'
  return (
    <div className="metric">
      <span className="metric__value tnum" style={{ color }}>
        {value}
      </span>
      <span className="metric__label">{label}</span>
      {note ? <span className="metric__note">{note}</span> : null}
    </div>
  )
}

/* ── Panel ──────────────────────────────────────────────────────────────── */
interface PanelProps {
  children: ReactNode
  variant?: 'default' | 'sunk' | 'ink'
  className?: string
  as?: 'div' | 'article' | 'li'
}

export function Panel({ children, variant = 'default', className = '', as = 'div' }: PanelProps) {
  const cls = ['panel', variant !== 'default' ? `panel--${variant}` : '', className]
    .filter(Boolean)
    .join(' ')
  if (as === 'li') return <li className={cls}>{children}</li>
  if (as === 'article') return <article className={cls}>{children}</article>
  return <div className={cls}>{children}</div>
}

/* ── SectionHead ────────────────────────────────────────────────────────── */
interface SectionHeadProps {
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'split'
  aside?: ReactNode
}

export function SectionHead({ eyebrow, title, lede, align = 'left', aside }: SectionHeadProps) {
  return (
    <div className={align === 'split' ? 'head head--split' : 'head'}>
      <div className="head__main">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {aside ? <div className="head__aside">{aside}</div> : null}
    </div>
  )
}

/* ── EndpointRow — a real HTTP status, rendered as a status list ─────────── */
export interface EndpointStatus {
  label: string
  endpoint: string
  status: number
  issue?: string
}

const STATUS_TONE = (s: number): Severity => {
  if (s >= 200 && s < 300) return 'info'
  if (s === 400 || s === 404) return 'medium'
  return 'critical'
}

export function StatusList({ rows }: { rows: readonly EndpointStatus[] }) {
  return (
    <ul className="statuslist">
      {rows.map((r) => (
        <li key={r.endpoint} className="statuslist__row">
          <span className={`statuslist__code statuslist__code--${STATUS_TONE(r.status)} tnum`}>
            {r.status}
          </span>
          <code className="statuslist__endpoint">{r.endpoint}</code>
          <span className="statuslist__label">{r.label}</span>
          {r.issue ? <span className="statuslist__issue">{r.issue}</span> : null}
        </li>
      ))}
    </ul>
  )
}

/* ── DefinitionRow ──────────────────────────────────────────────────────── */
export function DefRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="defrow">
      <dt className="defrow__term mono">{term}</dt>
      <dd className="defrow__body">{children}</dd>
    </div>
  )
}