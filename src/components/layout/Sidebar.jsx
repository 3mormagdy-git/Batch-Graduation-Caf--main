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
  Settings,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'POS', icon: Monitor },
  { label: 'Orders', icon: ClipboardList, notification: true },
  { label: 'Tables', icon: LayoutGrid },
  { label: 'Coffee', icon: Coffee, notification: true },
  { label: 'Menu', icon: BookOpen, to: '/menu' },
  { label: 'Inventory', icon: Box, notification: true },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Stock', icon: Archive },
  { label: 'Staff', icon: Users },
]

function SidebarButton({ label, Icon, notification }) {
  return (
    <button className="side-nav-button" type="button" aria-label={label}>
      <Icon size={20} strokeWidth={1.8} />
      {notification && <span className="nav-notification-dot" aria-hidden="true" />}
    </button>
  )
}

export default function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <button className="brand-mark" type="button" aria-label="Cafe dashboard home">
        <Coffee size={20} strokeWidth={1.8} />
      </button>
      <nav className="side-nav" aria-label="Dashboard sections">
        {navigation.map(({ label, icon: Icon, notification, to }, index) => (
          <div className="nav-entry" key={label}>
            {index === 5 && <span className="nav-divider" />}
            {to ? (
              <NavLink
                className={({ isActive }) => `side-nav-button${isActive ? ' active' : ''}`}
                to={to}
                end={to === '/'}
                aria-label={label}
                title={label}
              >
                <Icon size={20} strokeWidth={1.8} />
              </NavLink>
            ) : (
              <SidebarButton label={label} Icon={Icon} notification={notification} />
            )}
          </div>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <SidebarButton label="Settings" Icon={Settings} />
      <SidebarButton label="Documents" Icon={FileText} />
    </aside>
  )
}
