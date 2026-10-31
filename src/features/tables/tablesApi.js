// Tables endpoints. All requests go through the shared client in @/api/client.js, which
// adds the access token saved at sign-in and signs the user out on a 401.
import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'

export const tablesApi = {
  list: (branchId) => {
    const query = branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''
    return api.get(`${ENDPOINTS.tables.list}${query}`)
  },
  get: (id) => api.get(ENDPOINTS.tables.byId(id)),
  transfer: (fromId, toId) => api.post(ENDPOINTS.tables.transfer, { fromId, toId }),
  merge: (intoId, fromId) => api.post(ENDPOINTS.tables.merge, { intoId, fromId }),
  updateStatus: (id, status) => api.patch(ENDPOINTS.tables.status(id), { status }),
  reserve: (id, reservation) => api.post(ENDPOINTS.tables.reservation(id), reservation),
  cancelReservation: (id) => api.delete(ENDPOINTS.tables.reservation(id)),
}

// Swagger's response schemas were not included in the supplied specification.
// Accept common list wrappers without assuming a particular response envelope.
export function extractTables(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return null
  for (const key of ['data', 'tables', 'items', 'results']) {
    if (Array.isArray(payload[key])) return payload[key]
    if (payload[key] && typeof payload[key] === 'object') {
      const nested = extractTables(payload[key])
      if (nested) return nested
    }
  }
  return null
}

export function extractTable(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) return payload.data
  if (payload.table && typeof payload.table === 'object') return payload.table
  return payload
}
