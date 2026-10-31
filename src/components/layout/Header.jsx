import {
  CirclePlus,
  Search,
} from 'lucide-react'
import BranchSwitcher from '@/features/branches/components/BranchSwitcher.jsx'
import UserMenu from '@/components/layout/UserMenu.jsx'
import NotificationsBell from '@/features/reports/NotificationsBell.jsx'

export default function Header() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <BranchSwitcher />
      </div>
      <label className="global-search">
        <Search size={18} strokeWidth={1.8} aria-hidden="true" />
        <input type="search" placeholder="Search orders, tables, items…" aria-label="Search orders, tables, and items" />
      </label>
      <div className="topbar-actions">
        <NotificationsBell />
        <button className="primary-button" type="button">
          <CirclePlus size={18} strokeWidth={1.8} />
          New order
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
