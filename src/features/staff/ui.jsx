import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { PageTitle, primaryButton } from '@/features/tables/shared.jsx'
import { ROLES, initialsOf } from './staffData.js'

// Small building blocks shared by the Staff pages (button/card styles are reused from the Tables helpers).

export const btn = `${primaryButton} h-10 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-50`
export const btnOutline = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page'
export const btnDanger = 'inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-danger px-5 text-sm font-semibold text-white hover:opacity-90'
export const inputClass = 'h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-[rgb(120_38_61/25%)]'
export const checkboxClass = 'h-4 w-4 shrink-0 cursor-pointer rounded border-line accent-[var(--accent)]'

const TONE = {
  pink: 'bg-pink text-accent',
  sand: 'bg-beige text-ink',
  mint: 'bg-mint text-green',
  amber: 'bg-[#fbf1e0] text-[#9a6412]',
}

export function Avatar({ name, tone = 'pink', size = 'h-9 w-9 text-xs' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${size} ${TONE[tone] || TONE.pink}`}>
      {initialsOf(name)}
    </span>
  )
}

const ROLE_STYLE = {
  manager: 'bg-primary-soft text-accent',
  cashier: 'bg-sand text-ink',
  kitchen: 'bg-[#fbf1e0] text-[#9a6412]',
}
export function RoleChip({ role }) {
  return <span className={`inline-flex h-6 items-center rounded-md px-2.5 text-[11px] font-semibold ${ROLE_STYLE[role]}`}>{ROLES[role].label}</span>
}

export function StatusChip({ active }) {
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold ${active ? 'bg-success-soft text-success' : 'bg-sand text-muted'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-success' : 'bg-muted'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// Heading + (optional) action. Used by the three tab pages.
export function StaffHeading({ subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <PageTitle title="Staff & shifts" subtitle={subtitle} />
      {action}
    </div>
  )
}

const TABS = [
  { label: 'Employees', to: '/staff', end: true },
  { label: 'Roles & permissions', to: '/staff/roles' },
  { label: 'Shifts', to: '/staff/shifts' },
]
export function StaffTabs() {
  return (
    <nav aria-label="Staff sections" className="mt-6 flex gap-1 border-b border-line">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `-mb-px border-b-2 px-3 pb-2.5 pt-2 text-sm font-medium ${isActive ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

// Modal that dims only the page area (below the top bar, beside the sidebar), like the reference.
export function Modal({ title, subtitle, onClose, width = 'max-w-[512px]', footer, children }) {
  return (
    <div className="fixed inset-0 z-[3] flex items-center justify-center bg-[rgb(60_30_40/40%)] p-4">
      <div role="dialog" aria-modal="true" aria-label={title} className={`w-full ${width} overflow-hidden rounded-2xl bg-card shadow-xl`}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="m-0 text-base font-bold text-ink">{title}</h2>
            {subtitle && <p className="m-0 mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-muted hover:text-ink"><X size={18} strokeWidth={2} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-end gap-3 border-t border-line bg-sand-light px-6 py-4">{footer}</div>
      </div>
    </div>
  )
}
