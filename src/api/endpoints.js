// Every backend route the app calls, in one place. Paths are relative to API_BASE_URL
// (see client.js) and already include the /api prefix.

export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    forgotPassword: '/api/auth/forgot-password',
    me: '/api/auth/me',
  },
  branches: {
    list: '/api/branches',
    byId: (id) => `/api/branches/${encodeURIComponent(id)}`,
  },
  employees: {
    list: '/api/employees',
    roles: '/api/employees/roles',
    byId: (id) => `/api/employees/${encodeURIComponent(id)}`,
  },
  shifts: {
    list: '/api/shifts',
    current: '/api/shifts/current',
    start: '/api/shifts/start',
    end: (id) => `/api/shifts/${encodeURIComponent(id)}/end`,
  },
  reports: {
    dashboard: '/api/reports/dashboard',
    sales: '/api/reports/sales',
  },
  notifications: {
    list: '/api/notifications',
  },
  tables: {
    list: '/api/tables',
    byId: (id) => `/api/tables/${encodeURIComponent(id)}`,
    transfer: '/api/tables/transfer',
    merge: '/api/tables/merge',
    status: (id) => `/api/tables/${encodeURIComponent(id)}/status`,
    reservation: (id) => `/api/tables/${encodeURIComponent(id)}/reservation`,
  },
}
