import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { STATUS_LABEL } from './tablesData.js'

// Shared building blocks for the Tables pages (kept local so no global CSS is touched).

export const cardClass = 'rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgba(60,30,40,0.05)]'

// Same page padding on every Tables page (24px sides, matches the reference header gap).
export function PageContainer({ children }) {
  return <div className="w-full flex-1 px-6 pb-10 pt-[38px]">{children}</div>
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-1 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
      <ChevronLeft size={14} strokeWidth={2} aria-hidden="true" />
      {children}
    </Link>
  )
}

export function PageTitle({ title, subtitle }) {
  return (
    <div>
      <h1 className="m-0 text-[22px] font-bold leading-7 text-ink">{title}</h1>
      {subtitle && <p className="m-0 mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
  )
}

// Status colours: dot + text + soft background.
const PILL = {
  occupied: { box: 'bg-primary-soft text-accent', dot: 'bg-accent' },
  available: { box: 'bg-success-soft text-success', dot: 'bg-success' },
  reserved: { box: 'bg-[#fbf1e0] text-[#9a6412]', dot: 'bg-amber' },
  cleaning: { box: 'bg-sand text-muted', dot: 'bg-muted' },
  served: { box: 'bg-sand text-muted', dot: 'bg-muted' },
}

export function StatusPill({ status, label, className = '' }) {
  const style = PILL[status]
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold ${style.box} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label || STATUS_LABEL[status]}
    </span>
  )
}

// Button styles shared by the Tables pages.
export const outlineButton =
  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page'
export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-accent font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]'
