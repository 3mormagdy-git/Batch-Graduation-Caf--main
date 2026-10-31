import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'

// When true, every dashboard page needs a signed-in user (the Tables API rejects requests
// without a token anyway). Set to false only to look at the UI without the backend.
const AUTH_GUARD_ENABLED = true

// Dashboard pages: send signed-out users to Sign In, remembering where they were going.
export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (AUTH_GUARD_ENABLED && !user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />
  }
  return children
}

// Sign In / Sign Up / Forgot Password: signed-in users go straight to the dashboard,
// or back to the page RequireAuth sent them away from.
export function GuestOnly({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (AUTH_GUARD_ENABLED && user) return <Navigate to={location.state?.from ?? '/'} replace />
  return children
}
