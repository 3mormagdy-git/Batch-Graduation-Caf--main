import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, Store } from 'lucide-react'
import { useBranches } from '../BranchContext.jsx'

// Header branch selector: lists every branch from the branch registry and switches the active one.
export default function BranchSwitcher() {
  const { branches, activeBranch, switchBranch } = useBranches()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (event.type === 'keydown' ? event.key === 'Escape' : !ref.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close) }
  }, [open])

  const isOpen = activeBranch?.open
  return (
    <>
      <div className="relative" ref={ref}>
        <button className="branch-selector" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span className="store-icon"><Store size={16} strokeWidth={1.8} /></span>
          <span>{activeBranch?.name ?? '…'}</span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
        {open && (
          <ul role="listbox" aria-label="Switch branch" className="absolute left-0 top-[calc(100%+6px)] z-[30] m-0 min-w-[220px] list-none rounded-xl border border-line bg-card p-1.5 shadow-xl">
            {branches.map((branch) => (
              <li key={branch.id} role="option" aria-selected={branch.id === activeBranch?.id}>
                <button type="button" onClick={() => { setOpen(false); if (branch.id !== activeBranch?.id) switchBranch(branch.id) }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink hover:bg-page">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${branch.open ? 'bg-success' : 'bg-muted'}`} />
                  <span className="flex-1 truncate">{branch.name}</span>
                  {branch.id === activeBranch?.id && <Check size={14} className="text-accent" aria-hidden="true" />}
                </button>
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-1">
              <Link to="/branches" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-[13px] font-medium text-accent hover:bg-page">Manage branches</Link>
            </li>
          </ul>
        )}
      </div>
      {activeBranch && (
        <span className="open-status" style={isOpen ? undefined : { color: 'var(--muted)', background: 'var(--sand-light)' }}>
          <span className="status-dot" style={isOpen ? undefined : { background: 'var(--muted)' }} />{isOpen ? 'Cafe Open' : 'Cafe Closed'}
        </span>
      )}
    </>
  )
}
