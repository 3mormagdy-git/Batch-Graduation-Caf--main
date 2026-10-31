import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header.jsx'
import Sidebar from '@/components/layout/Sidebar.jsx'

// Layout for every /tables route. Same shared Sidebar as every other page; it shows the
// Tables version of its items automatically (see VARIANTS in components/layout/Sidebar.jsx).
// "dashboard-shell" / "dashboard-main" are the existing layout classes from App.css.
export default function TablesShell() {
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
