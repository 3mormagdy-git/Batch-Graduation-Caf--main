import { useEffect, useState } from 'react'
import {
  Archive,
  BarChart3,
  BookOpen,
  Box,
  ClipboardList,
  Coffee,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const EXPANDED_KEY = 'sidebarExpanded'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'POS', icon: Monitor },
  { label: 'Orders', icon: ClipboardList, notification: true },
  { label: 'Tables', icon: LayoutGrid, to: '/tables' }, // opens the Tables module (icon and label are one link)
  { label: 'Coffee', icon: Coffee, notification: true },
  { label: 'Menu', icon: BookOpen, to: '/menu', divider: true },
  { label: 'Inventory', icon: Box, notification: true },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Stock', icon: Archive },
  { label: 'Staff', icon: Users, to: '/staff' }, // opens the Staff & Shifts module
]

function readExpanded() {
  try {
    return localStorage.getItem(EXPANDED_KEY) === 'true'
  } catch {
    return false
  }
}

function SidebarButton({ label, Icon, notification, expanded }) {
  return (
    <button className="side-nav-button" type="button" aria-label={label} title={expanded ? undefined : label}>
      <Icon size={20} strokeWidth={1.8} />
      <span className="side-nav-label">{label}</span>
      {notification && <span className="nav-notification-dot" aria-hidden="true" />}
    </button>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(readExpanded)

  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_KEY, String(expanded))
    } catch {
      // Remembering the sidebar state is optional.
    }
  }, [expanded])

  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen

  return (
    <aside className={`sidebar${expanded ? ' expanded' : ''}`} aria-label="Main navigation">
      <button className="brand-mark" type="button" aria-label="Cafe dashboard home">
        <Coffee size={20} strokeWidth={1.8} />
      </button>
      <nav className="side-nav" aria-label="Dashboard sections">
        {navigation.map(({ label, icon: Icon, notification, to, divider }) => (
          <div className="nav-entry" key={label}>
            {divider && <span className="nav-divider" />}
            {to ? (
              <NavLink
                className={({ isActive }) => `side-nav-button${isActive ? ' active' : ''}`}
                to={to}
                end={to === '/'}
                aria-label={label}
                title={expanded ? undefined : label}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span className="side-nav-label">{label}</span>
              </NavLink>
            ) : (
              <SidebarButton label={label} Icon={Icon} notification={notification} expanded={expanded} />
            )}
          </div>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <SidebarButton label="Settings" Icon={Settings} expanded={expanded} />
      <SidebarButton label="Documents" Icon={FileText} expanded={expanded} />
      <button
        className="side-nav-button sidebar-toggle"
        type="button"
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={expanded ? undefined : 'Expand sidebar'}
        onClick={() => setExpanded((value) => !value)}
      >
        <ToggleIcon size={20} strokeWidth={1.8} />
        <span className="side-nav-label">{expanded ? 'Collapse' : 'Expand'}</span>
      </button>
    </aside>
  )
}
