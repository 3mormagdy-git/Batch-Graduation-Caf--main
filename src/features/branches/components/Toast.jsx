import { CheckCircle2, X, XCircle } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) return null
  const error = toast.type === 'error'
  const Icon = error ? XCircle : CheckCircle2
  return (
    <div role={error ? 'alert' : 'status'} className="fixed bottom-6 left-1/2 z-[20] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm font-medium text-ink shadow-xl">
      <Icon size={18} className={error ? 'text-danger' : 'text-success'} aria-hidden="true" />
      <span>{toast.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="text-muted hover:text-ink"><X size={16} /></button>
    </div>
  )
}
