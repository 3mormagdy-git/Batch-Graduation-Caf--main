// Auth logic used by the pages, on top of the backend /auth endpoints.
// Pages never call fetch directly: authApi.js talks to the server, tokenStore.js keeps the
// session, and this file connects the two and shapes the user object the UI uses.
import * as authApi from '@/api/authApi.js'
import { clearSession, getSession, saveSession, updateSessionUser } from '@/api/tokenStore.js'

// The API sends an employee ({ name, role: 'Manager', branchIds, permissions, ... });
// the UI uses `fullName`, so map it once here.
function toUser(employee) {
  return {
    id: employee.id,
    fullName: employee.name,
    email: employee.email,
    role: employee.role,
    status: employee.status,
    branchIds: employee.branchIds ?? [],
    permissions: employee.permissions ?? [],
  }
}

const normalizeEmail = (email) => email.trim().toLowerCase()

export async function signIn(email, password, remember) {
  const { accessToken, user } = await authApi.login({ email: normalizeEmail(email), password })
  const session = { accessToken, user: toUser(user) }
  saveSession(session, remember)
  return session.user
}

// The account is created inactive: it cannot sign in until a manager approves it,
// so nothing is stored here. Returns the server's message to show on the sign-in page.
export async function register({ fullName, email, password, role }) {
  const { message } = await authApi.register({
    fullName: fullName.trim(),
    email: normalizeEmail(email),
    password,
    role,
  })
  return message
}

export async function requestPasswordReset(email) {
  const { message } = await authApi.forgotPassword({ email: normalizeEmail(email) })
  return message
}

// Asks the server who the token belongs to, so role/permission changes show up.
// Throws ApiError (status 401) when the token is no longer valid.
export async function refreshCurrentUser() {
  const user = toUser(await authApi.getMe())
  updateSessionUser(user)
  return user
}

export function getCurrentUser() {
  return getSession()?.user ?? null
}

// The API has no logout endpoint (tokens simply expire), so signing out only forgets the token.
export function signOut() {
  clearSession()
}
