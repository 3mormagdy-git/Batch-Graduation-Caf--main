import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header.jsx'
import TablesSidebar from '@/features/tables/TablesSidebar.jsx'

// Layout for every /tables route. It mirrors AppShell but swaps in the Tables sidebar,
// so the original AppShell/Sidebar (Dashboard, Menu) stay untouched.
// "dashboard-shell" / "dashboard-main" are the existing layout classes from App.css.
export default function TablesShell() {
  return (
    <div className="dashboard-shell">
      <TablesSidebar />
      <main className="dashboard-main">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}
