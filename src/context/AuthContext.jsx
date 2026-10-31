// Shares the signed-in user with every page (header avatar, greeting, route guards).
// The actual work is done by authService; this only keeps React in sync with it.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '@/api/client.js'
import * as authService from '@/services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())

  const signOut = useCallback(() => {
    authService.signOut()
    setUser(null)
  }, [])

  // Any request rejected with 401 means the token expired: sign out everywhere.
  useEffect(() => {
    setUnauthorizedHandler(signOut)
    return () => setUnauthorizedHandler(null)
  }, [signOut])

  // On page load, check the saved token is still valid and refresh the user's details.
  // A 401 signs out through the handler above; other errors (e.g. offline) keep the saved user.
  const hasSavedUser = Boolean(user)
  useEffect(() => {
    if (!hasSavedUser) return
    authService.refreshCurrentUser().then(setUser).catch(() => {})
    // only once, for the session found in storage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback(async (email, password, remember) => {
    setUser(await authService.signIn(email, password, remember))
  }, [])

  // Does not sign in: new accounts wait for a manager's approval. Resolves to the server's message.
  const register = useCallback((input) => authService.register(input), [])

  const value = useMemo(() => ({ user, signIn, register, signOut }), [user, signIn, register, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The hook lives next to its provider; the only cost is a full reload instead of hot reload.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
