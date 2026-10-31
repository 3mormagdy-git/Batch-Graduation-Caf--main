import { memo, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3, BookOpen, Box, Building2, ChefHat, ClipboardList, Coffee, LayoutDashboard,
  LayoutGrid, Monitor, PanelLeftClose, PanelLeftOpen, Settings, Users,
} from 'lucide-react'
import { useBranches } from '@/features/branches/BranchContext.jsx'

// ONE sidebar component for the whole app. The shell (brand, branch card, collapse, widths)
// never changes, but WHAT IS LISTED follows the page you are on, exactly like the design
// references: Dashboard/Menu, Tables and Staff each show their own set of items and badges.
// To change a page's sidebar, edit its entry in VARIANTS below.
// Items with `to` are real links; the others are visual only until their modules exist.
const EXPANDED_KEY = 'sidebarExpanded' // shared, so the choice follows you between pages

const DASHBOARD = { label: 'Dashboard', icon: LayoutDashboard, to: '/', end: true }
const POS = { label: 'POS Terminal', icon: Monitor }
const ORDERS = { label: 'Orders', icon: ClipboardList, badge: 9 }
const TABLE_LAYOUT = { label: 'Table Layout', icon: LayoutGrid, to: '/tables' }
const KITCHEN = { label: 'Kitchen Display', icon: ChefHat, badge: 5 }
const MENU_CATALOG = { label: 'Menu Catalog', icon: BookOpen, to: '/menu' }
const ANALYTICS = { label: 'Analytics & Reports', icon: BarChart3, to: '/reports' }
const BRANCH_MGMT = { label: 'Branch Management', icon: Building2, to: '/branches' }
const STAFF = { label: 'Staff & Shifts', icon: Users, to: '/staff' }

const VARIANTS = {
  // Dashboard and Menu pages
  dashboard: {
    main: [DASHBOARD, POS, ORDERS, TABLE_LAYOUT, KITCHEN],
    manage: [MENU_CATALOG, { label: 'Inventory', icon: Box, badge: 3 }, ANALYTICS, BRANCH_MGMT, STAFF],
  },
  // Table layout pages (/tables/...)
  tables: {
    main: [DASHBOARD, POS, ORDERS, TABLE_LAYOUT, KITCHEN],
    manage: [MENU_CATALOG, { label: 'Inventory', icon: Box, badge: 2 }],
  },
  // Staff & shifts pages (/staff/...)
  staff: {
    main: [TABLE_LAYOUT, KITCHEN],
    manage: [MENU_CATALOG, { label: 'Inventory', icon: Box, badge: 3 }, ANALYTICS, BRANCH_MGMT, STAFF],
  },
}

function variantFor(pathname) {
  if (pathname === '/tables' || pathname.startsWith('/tables/')) return 'tables'
  if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
  if (pathname === '/branches' || pathname.startsWith('/branches/')) return 'staff' // same item set as the Staff reference
  return 'dashboard'
}

function readExpanded() {
  try {
    return localStorage.getItem(EXPANDED_KEY) !== 'false' // expanded unless the user collapsed it
  } catch {
    return true
  }
}

const NavItem = memo(function NavItem({ label, icon: Icon, badge, to, end, collapsed }) {
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
})

export default function Sidebar() {
  const { pathname } = useLocation()
  const { activeBranch } = useBranches()
  const { main, manage } = VARIANTS[variantFor(pathname)]
  const [expanded, setExpanded] = useState(readExpanded)
  const collapsed = !expanded
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose

  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_KEY, String(expanded))
    } catch {
      // Remembering the sidebar state is optional.
    }
  }, [expanded])

  // z-[5] keeps the sidebar above modal overlays (only the page area is dimmed, as in the reference).
  return (
    <aside
      aria-label="Main navigation"
      className={`sticky top-0 z-[5] hidden h-screen shrink-0 flex-col border-r border-line bg-card transition-[width] duration-200 min-[700px]:flex ${collapsed ? 'w-[72px]' : 'w-[248px]'}`}
    >
      <div className={`flex items-center gap-2.5 pt-3.5 ${collapsed ? 'justify-center' : 'px-4'}`}>
        <NavLink to="/" aria-label="NAHJ Cafe home" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
          <Coffee size={20} strokeWidth={1.8} aria-hidden="true" />
        </NavLink>
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
          <div className="mt-0.5 text-sm font-bold text-ink">{activeBranch?.name ?? '…'}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />Station #01 • Shift active
          </div>
        </div>
      )}

      <nav className="mt-2.5 flex-1 overflow-y-auto px-3" aria-label="Sections">
        <div className="flex flex-col gap-0.5">
          {main.map((item) => <NavItem key={item.label} {...item} collapsed={collapsed} />)}
        </div>
        <div className="mx-2 mt-1 border-t border-line" />
        {!collapsed && <div className="px-3 pb-1 pt-2.5 text-[10px] text-muted">Manage</div>}
        <div className="mt-1 flex flex-col gap-0.5">
          {manage.map((item) => <NavItem key={item.label} {...item} collapsed={collapsed} />)}
        </div>
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-line px-3 py-3">
        <NavItem label="Settings" icon={Settings} collapsed={collapsed} />
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
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
