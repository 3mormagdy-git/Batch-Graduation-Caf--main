import {
  Bell,
  ChevronDown,
  CirclePlus,
  Search,
  Store,
} from 'lucide-react'

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="branch-selector" type="button">
          <span className="store-icon"><Store size={16} strokeWidth={1.8} /></span>
          <span>Cairo Downtown</span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
        <span className="open-status"><span className="status-dot" />Cafe Open</span>
      </div>
      <label className="global-search">
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        <input type="search" placeholder="Search orders, tables, items…" aria-label="Search orders, tables, and items" />
      </label>
      <div className="topbar-actions">
        <button className="icon-button notification-button" type="button" aria-label="Notifications, 2 unread">
          <Bell size={20} strokeWidth={1.8} />
          <span className="notification-count">2</span>
        </button>
        <button className="primary-button bg-accent hover:bg-accent-hover text-white" type="button">
          <CirclePlus size={18} strokeWidth={1.8} />
          New order
        </button>
        <button className="avatar" type="button" aria-label="Signed in as Salma Ahmed">SA</button>
      </div>
    </header>
  )
}
