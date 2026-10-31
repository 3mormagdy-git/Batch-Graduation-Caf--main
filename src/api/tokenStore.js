// Where the signed-in session (access token + user) is kept in the browser.
// "Remember me" uses localStorage (survives closing the browser); otherwise sessionStorage
// (cleared when the tab closes).

const SESSION_KEY = 'nahj.session'

function read(storage) {
  try {
    const raw = storage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Returns { accessToken, user } or null.
export function getSession() {
  return read(localStorage) ?? read(sessionStorage)
}

export function getAccessToken() {
  return getSession()?.accessToken ?? null
}

export function saveSession(session, remember) {
  clearSession()
  try {
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // storage can be unavailable (private mode); the user stays signed in until reload
  }
}

// Keeps the token and the "remember me" choice, replaces only the user details.
export function updateSessionUser(user) {
  const inLocal = read(localStorage)
  const session = inLocal ?? read(sessionStorage)
  if (!session) return
  saveSession({ ...session, user }, Boolean(inLocal))
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // nothing to clear
  }
}
