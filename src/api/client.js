// Small fetch wrapper used for every backend call:
// - prefixes the API base URL and sends/receives JSON
// - attaches the access token (unless the request is marked `auth: false`)
// - turns every failure into an ApiError with a message that can be shown to the user
import { getAccessToken } from '@/api/tokenStore.js'

// Paths in endpoints.js already start with /api. In Vite development, use the
// same-origin path so the configured Vite proxy handles the backend connection.
// In production, use the training API host unless VITE_API_BASE_URL overrides it.
const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = (configuredBase || (import.meta.env.DEV ? '' : 'https://training-api.nahjway.com')).replace(/\/$/, '')

const TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status // HTTP status, 0 when the server could not be reached
    this.details = details // raw error body from the server, if any
  }
}

// Called when an authenticated request comes back 401 (token expired or revoked).
// AuthContext registers a handler that signs the user out.
let unauthorizedHandler = null
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

// NestJS errors look like { statusCode, message, error }, where `message` is a string
// or a list of validation messages. Pick one readable sentence out of it.
function messageFrom(body, status) {
  const raw = Array.isArray(body?.message) ? body.message[0] : body?.message
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1)
  if (status === 429) return 'Too many attempts. Please wait a minute and try again.'
  if (status >= 500) return 'The server had a problem. Please try again later.'
  return 'Something went wrong. Please try again.'
}

export async function request(path, { method = 'GET', body, auth = true, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getAccessToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  signal?.addEventListener('abort', () => controller.abort())

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new ApiError(
      controller.signal.aborted && !signal?.aborted
        ? 'The server is taking too long to respond. Please try again.'
        : 'Cannot reach the server. Check your internet connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 429) {
      // the server's own text for this is not meant for end users
      throw new ApiError(messageFrom(null, 429), 429, data)
    }
    if (response.status === 401 && token) unauthorizedHandler?.()
    throw new ApiError(messageFrom(data, response.status), response.status, data)
  }
  return data
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
