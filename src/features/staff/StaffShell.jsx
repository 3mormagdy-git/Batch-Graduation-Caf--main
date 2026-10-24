import { Outlet } from 'react-router-dom'
import Header from '@/components/layout/Header.jsx'
import StaffSidebar from './StaffSidebar.jsx'
import { StaffProvider } from './StaffContext.jsx'

// Layout for every /staff route. Same approach as TablesShell: reuses the existing layout
// classes and Header, swaps in the sidebar from the Staff reference, and shares Staff state.
export default function StaffShell() {
  return (
    <StaffProvider>
      <div className="dashboard-shell">
        <StaffSidebar />
        <main className="dashboard-main">
          <Header />
          <Outlet />
        </main>
      </div>
    </StaffProvider>
  )
}
