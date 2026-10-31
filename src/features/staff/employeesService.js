import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'

const ROLE_TO_UI = { Manager: 'manager', Cashier: 'cashier', 'Kitchen Staff': 'kitchen' }
const ROLE_TO_API = { manager: 'Manager', cashier: 'Cashier', kitchen: 'Kitchen Staff' }
const unwrapList = (payload, keys) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') throw new Error('The server returned an unexpected employees response.')
  for (const key of keys) {
    const value = payload[key]
    if (Array.isArray(value)) return value
    if (value && typeof value === 'object') {
      const nested = unwrapList(value, keys)
      if (nested) return nested
    }
  }
  throw new Error('The server returned an unexpected employees response.')
}
const unwrapOne = (payload) => {
  let value = payload
  for (let i = 0; i < 3 && value && typeof value === 'object' && !Array.isArray(value); i += 1) {
    if (value.id != null || value._id != null) return value
    value = value.data ?? value.employee ?? value.result
  }
  throw new Error('The server returned an unexpected employee response.')
}
export function fromApiEmployee(raw) {
  if (!raw || typeof raw !== 'object' || (raw.id == null && raw._id == null)) {
    throw new Error('The server returned an employee without an ID.')
  }
  const role = raw.role
  return {
    ...raw,
    id: String(raw.id ?? raw._id),
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: ROLE_TO_UI[role] || String(role || '').toLowerCase(),
    apiRole: role,
    branches: Array.isArray(raw.branchIds) ? raw.branchIds.map(String) : [],
    permissions: Array.isArray(raw.permissions) ? raw.permissions.map((permission) => typeof permission === 'string' ? permission : (permission.key || permission.code || permission.name)).filter(Boolean) : [],
    status: String(raw.status || '').toLowerCase(),
    joined: raw.hiredAt || '',
    hiredAt: raw.hiredAt || '',
    tone: 'pink',
  }
}
export function toApiEmployee(data, { includePassword = false } = {}) {
  const body = {
    name: data.name,
    role: ROLE_TO_API[data.role] || data.role,
    email: data.email,
    phone: data.phone,
    branchIds: Array.isArray(data.branches) ? data.branches : (data.branchIds || []),
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
    status: data.status || 'active',
  }
  if (data.hiredAt) body.hiredAt = data.hiredAt
  if (includePassword && data.password) body.password = data.password
  return body
}
export async function getEmployees(filters = {}) {
  const params = new URLSearchParams()
  if (filters.branchId) params.set('branchId', filters.branchId)
  if (filters.role) params.set('role', ROLE_TO_API[filters.role] || filters.role)
  if (filters.status) params.set('status', filters.status)
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  const suffix = params.toString()
  const payload = await api.get(`${ENDPOINTS.employees.list}${suffix ? `?${suffix}` : ''}`)
  return unwrapList(payload, ['data', 'employees', 'items', 'results']).map(fromApiEmployee)
}
export async function getEmployeeById(id) {
  return fromApiEmployee(unwrapOne(await api.get(ENDPOINTS.employees.byId(id))))
}
export async function createEmployee(data) {
  return fromApiEmployee(unwrapOne(await api.post(ENDPOINTS.employees.list, toApiEmployee(data, { includePassword: true }))))
}
export async function updateEmployee(id, data) {
  return fromApiEmployee(unwrapOne(await api.patch(ENDPOINTS.employees.byId(id), toApiEmployee(data, { includePassword: Boolean(data.password) }))))
}
export async function getEmployeeRoles() {
  const payload = await api.get(ENDPOINTS.employees.roles)
  return unwrapList(payload, ['data', 'roles', 'items', 'results'])
}
