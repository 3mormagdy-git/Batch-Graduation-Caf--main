import { Link } from 'react-router-dom'

export function StatusBadge({ open }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold ${open ? 'bg-success-soft text-success' : 'bg-sand text-muted'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${open ? 'bg-success' : 'bg-muted'}`} />{open ? 'Open' : 'Closed'}
    </span>
  )
}

export function NotFound() {
  return (
    <div className="py-10 text-center">
      <h1 className="m-0 text-lg font-bold text-ink">Branch not found</h1>
      <p className="text-sm text-muted">It may have been removed or the link is wrong.</p>
      <Link to="/branches" className="text-sm font-semibold text-accent">Back to all branches</Link>
    </div>
  )
}

export function ErrorPanel({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-2xl border border-line bg-card p-8 text-center">
      <h2 className="m-0 text-base font-bold text-ink">Couldn’t load branches</h2>
      <p className="mx-auto mt-1 max-w-[460px] text-sm text-muted">{message}</p>
      <button type="button" onClick={onRetry} className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]">Try again</button>
    </div>
  )
}
