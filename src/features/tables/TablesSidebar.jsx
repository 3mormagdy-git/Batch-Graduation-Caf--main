import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BookOpen, Box, ChefHat, ClipboardList, Coffee, LayoutDashboard, LayoutGrid,
  Monitor, PanelLeftClose, PanelLeftOpen, Settings,
} from 'lucide-react'

// Sidebar shown only inside the Tables module (matches the design reference).
// Items with `to` are real links; the others are visual only until their modules exist.
const MAIN_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/', end: true }, // back to the original Dashboard
  { label: 'POS Terminal', icon: Monitor },
  { label: 'Orders', icon: ClipboardList, badge: 9 },
  { label: 'Table Layout', icon: LayoutGrid, to: '/tables' },
  { label: 'Kitchen Display', icon: ChefHat, badge: 5 },
]
const MANAGE_ITEMS = [
  { label: 'Menu Catalog', icon: BookOpen, to: '/menu' }, // existing Menu route
  { label: 'Inventory', icon: Box, badge: 2 },
]

function NavItem({ label, icon: Icon, badge, to, end, collapsed }) {
  const base = `relative flex h-10 w-full items-center rounded-lg text-[13.5px] font-medium transition-colors ${
    collapsed ? 'justify-center' : 'gap-3.5 pl-4 pr-[11px]'
  }`
  const content = (
    <>
      <Icon size={20} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
      {badge && (collapsed
        ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
        : <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-md bg-accent px-1.5 text-[11px] font-semibold text-white">{badge}</span>)}
    </>
  )
  const title = collapsed ? label : undefined

  if (to) {
    return (
      <NavLink to={to} end={end} title={title} aria-label={label}
        className={({ isActive }) => `${base} ${isActive ? 'bg-primary-soft text-accent' : 'text-[color:var(--nav-text)] hover:bg-page'}`}>
        {content}
      </NavLink>
    )
  }
  return <button type="button" title={title} aria-label={label} className={`${base} text-[color:var(--nav-text)] hover:bg-page`}>{content}</button>
}

export default function TablesSidebar() {
  // Collapse only shrinks this sidebar to icons; it is not saved anywhere.
  const [collapsed, setCollapsed] = useState(false)
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <aside
      aria-label="Main navigation"
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-card transition-[width] duration-200 min-[700px]:flex ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
    >
      <div className={`flex items-center gap-2.5 pt-3.5 ${collapsed ? 'justify-center' : 'px-4'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Coffee size={20} strokeWidth={1.8} aria-hidden="true" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-[15px] font-bold text-ink">NAHJ Cafe</div>
            <div className="text-[11px] text-muted">Operations Suite</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mx-4 mt-2.5 rounded-xl bg-page px-3.5 py-3">
          <div className="text-[10px] text-muted">Branch</div>
          <div className="mt-0.5 text-sm font-bold text-ink">Cairo Downtown</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />Station #01 • Shift active
          </div>
        </div>
      )}

      <nav className="mt-2.5 flex-1 overflow-y-auto px-3" aria-label="Sections">
        <div className="flex flex-col gap-0.5">
          {MAIN_ITEMS.map((item) => <NavItem key={item.label} {...item} collapsed={collapsed} />)}
        </div>
        <div className="mx-2 mt-1 border-t border-line" />
        {!collapsed && <div className="px-3 pb-1 pt-2.5 text-[10px] text-muted">Manage</div>}
        <div className="mt-1 flex flex-col gap-0.5">
          {MANAGE_ITEMS.map((item) => <NavItem key={item.label} {...item} collapsed={collapsed} />)}
        </div>
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-line px-3 py-3">
        <NavItem label="Settings" icon={Settings} collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expand' : undefined}
          className={`flex h-10 w-full items-center rounded-lg text-[13px] font-medium text-muted hover:bg-page ${collapsed ? 'justify-center' : 'gap-3.5 pl-4'}`}
        >
          <CollapseIcon size={20} strokeWidth={1.8} aria-hidden="true" />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}
