import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/index.css'
import App from '@/App.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { StaffProvider } from '@/features/staff/StaffContext.jsx'
import { BranchProvider } from '@/features/branches/BranchContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StaffProvider>
          <BranchProvider>
            <App />
          </BranchProvider>
        </StaffProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
