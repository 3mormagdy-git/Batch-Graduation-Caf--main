import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header.jsx'
import Sidebar from '@/components/layout/Sidebar.jsx'

export default function AppShell() {
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
