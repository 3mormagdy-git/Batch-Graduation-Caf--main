import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'

const listFrom = (payload, depth = 0) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object' || depth > 4) return null
  for (const key of ['data', 'shifts', 'items', 'results']) {
    const found = listFrom(payload[key], depth + 1)
    if (found) return found
  }
  return null
}
const oneFrom = (payload) => {
  let value = payload
  for (let i = 0; i < 3 && value && typeof value === 'object' && !Array.isArray(value); i += 1) {
    if (value.id != null || value._id != null) return value
    value = value.data ?? value.shift ?? value.currentShift ?? value.result
  }
  if (value == null) return null
  throw new Error('The server returned an unexpected current shift response.')
}
const first = (...values) => values.find((value) => value !== undefined && value !== null)
export function fromApiShift(raw) {
  const id = first(raw.id, raw._id)
  const started = first(raw.startedAt, raw.startTime, raw.openedAt)
  const ended = first(raw.endedAt, raw.endTime, raw.closedAt)
  const opening = first(raw.openingCash, raw.openingFloat)
  const sales = first(raw.totalSales, raw.sales)
  const cashSales = first(raw.cashSales)
  const counted = first(raw.countedCash, raw.counted)
  const expected = first(raw.expectedCash, raw.expected)
  const employee = first(raw.employeeName, raw.employee?.name, raw.employee)
  const branch = first(raw.branchName, raw.branch?.name, raw.branch)
  const durationDate = started ? new Date(started) : null
  const validDate = durationDate && !Number.isNaN(durationDate.getTime())
  return {
    ...raw,
    id: id == null ? '' : String(id),
    employeeId: first(raw.employeeId, raw.employee?.id, ''),
    employee: typeof employee === 'string' ? employee : '',
    branchId: first(raw.branchId, raw.branch?.id, ''),
    branch: typeof branch === 'string' ? branch : '',
    register: first(raw.register, raw.registerName, ''),
    status: String(raw.status || '').toLowerCase(),
    startedAt: validDate ? durationDate.getTime() : null,
    startedLabel: validDate ? durationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
    period: started ? `${started}${ended ? ` – ${ended}` : ''}` : '',
    orders: first(raw.ordersCount, raw.orders),
    totalSales: sales,
    sales,
    cashSales,
    openingFloat: opening,
    expected: expected,
    counted,
    difference: first(raw.difference, (expected != null && counted != null) ? Number(counted) - Number(expected) : undefined),
    note: first(raw.note, raw.notes, ''),
  }
}
export async function getShifts(filters = {}) {
  const params = new URLSearchParams()
  if (filters.branchId) params.set('branchId', filters.branchId)
  if (filters.status) params.set('status', filters.status)
  if (filters.employeeId) params.set('employeeId', filters.employeeId)
  const query = params.toString()
  const rows = listFrom(await api.get(`${ENDPOINTS.shifts.list}${query ? `?${query}` : ''}`))
  if (!rows) throw new Error('The server returned an unexpected shifts response.')
  return rows.map(fromApiShift)
}
export async function getCurrentShift(branchId) {
  const params = new URLSearchParams()
  if (branchId) params.set('branchId', branchId)
  try {
    const query = params.toString()
    const payload = await api.get(`${ENDPOINTS.shifts.current}${query ? `?${query}` : ''}`)
    const raw = oneFrom(payload)
    return raw ? fromApiShift(raw) : null
  } catch (error) {
    if (error.status === 404) return null
    throw error
  }
}
export async function startShift(data) {
  const payload = await api.post(ENDPOINTS.shifts.start, {
    branchId: data.branchId,
    register: data.register,
    openingCash: data.openingCash,
  })
  return fromApiShift(oneFrom(payload))
}
export async function endShift(id, data) {
  const payload = await api.post(ENDPOINTS.shifts.end(id), {
    countedCash: data.countedCash,
    note: data.note || '',
  })
  return payload
}
