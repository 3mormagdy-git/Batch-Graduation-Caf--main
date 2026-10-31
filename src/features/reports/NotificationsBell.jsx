import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, RefreshCw, X } from 'lucide-react'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import { getNotifications } from './reportsService.js'

function findRecords(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value
  }
  for (const value of Object.values(payload)) {
    if (value && typeof value === 'object') {
      const found = findRecords(value)
      if (found.length) return found
    }
  }
  return Object.keys(payload).length ? [payload] : []
}

function prettyKey(key) {
  return String(key).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

function notificationText(record) {
  if (typeof record === 'string') return { title: 'Notification', message: record, details: [] }
  if (!record || typeof record !== 'object') return { title: 'Notification', message: String(record), details: [] }
  const entries = Object.entries(record).filter(([, value]) => value !== null && ['string', 'number', 'boolean'].includes(typeof value))
  const titleEntry = entries.find(([key]) => /title|subject|heading|name/i.test(key))
  const messageEntry = entries.find(([key]) => /message|description|body|content|text/i.test(key))
  const dateEntry = entries.find(([key]) => /created|date|time|timestamp/i.test(key))
  const used = new Set([titleEntry?.[0], messageEntry?.[0], dateEntry?.[0]].filter(Boolean))
  return {
    title: titleEntry ? String(titleEntry[1]) : 'Notification',
    message: messageEntry ? String(messageEntry[1]) : entries.find(([key]) => !used.has(key))?.[1]?.toString() || 'Notification details',
    date: dateEntry ? String(dateEntry[1]) : '',
    details: entries.filter(([key]) => !used.has(key)),
  }
}

export default function NotificationsBell() {
  const { activeBranch } = useBranches()
  const [open, setOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({ loading: false, error: '', data: null })
  const panelRef = useRef(null)

  const records = useMemo(() => state.data == null ? [] : findRecords(state.data), [state.data])

  useEffect(() => {
    if (!open) return undefined
    const controller = new AbortController()
    setState({ loading: true, error: '', data: null })
    getNotifications({ branchId: activeBranch?.id || undefined, signal: controller.signal })
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => { if (!controller.signal.aborted) setState({ loading: false, error: error.message, data: null }) })
    return () => controller.abort()
  }, [open, activeBranch?.id, reloadKey])

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => {
      if (event.type === 'keydown' && event.key === 'Escape') setOpen(false)
      if (event.type === 'mousedown' && !panelRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('mousedown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('mousedown', close) }
  }, [open])

  const retry = () => setReloadKey((value) => value + 1)

  return (
    <div className="relative" ref={panelRef}>
      <button className="icon-button notification-button" type="button" aria-label="Notifications" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Bell size={20} strokeWidth={1.8} />
        {records.length > 0 && <span className="notification-count">{records.length > 99 ? '99+' : records.length}</span>}
      </button>
      {open && (
        <section className="notifications-popover" aria-label="Notifications panel">
          <header><div><strong>Notifications</strong><small>{records.length ? `${records.length} returned` : 'Latest updates'}</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close notifications"><X size={17} /></button></header>
          {state.loading ? <div className="notifications-state">Loading notifications…</div> : state.error ? (
            <div className="notifications-state notifications-error"><p>{state.error}</p><button type="button" onClick={retry}><RefreshCw size={14} /> Try again</button></div>
          ) : !records.length ? (
            <div className="notifications-state">No notifications returned by the server.</div>
          ) : (
            <div className="notifications-list">
              {records.map((record, index) => {
                const item = notificationText(record)
                return <article className="notification-entry" key={record?.id ?? record?._id ?? index}>
                  <strong>{item.title}</strong><p>{item.message}</p>
                  {item.date && <time>{item.date}</time>}
                  {item.details.length > 0 && <details><summary>More details</summary><dl>{item.details.map(([key, value]) => <div key={key}><dt>{prettyKey(key)}</dt><dd>{String(value)}</dd></div>)}</dl></details>}
                </article>
              })}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
