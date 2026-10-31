import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'

function withQuery(path, params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      query.set(key, String(value))
    }
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export function getReportDashboard({ branchId, signal } = {}) {
  return api.get(withQuery(ENDPOINTS.reports.dashboard, { branchId }), { signal })
}

export function getSalesReport({ branchId, period = 'week', signal } = {}) {
  return api.get(withQuery(ENDPOINTS.reports.sales, { branchId, period }), { signal })
}

export function getNotifications({ branchId, signal } = {}) {
  return api.get(withQuery(ENDPOINTS.notifications.list, { branchId }), { signal })
}
