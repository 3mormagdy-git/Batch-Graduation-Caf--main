import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header.jsx'
import Sidebar from '@/components/layout/Sidebar.jsx'

// Layout for every /staff route. StaffProvider now lives in main.jsx so staff data is shared
// with Branch Management (assignments) and survives navigating between modules.
export default function StaffShell() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}
