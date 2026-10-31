import { api } from '@/api/client.js'
import { ENDPOINTS } from '@/api/endpoints.js'
import { menuItems } from '@/data/menu.js'
import { EMPTY_WEEK } from './branchesData.js'

// ---------------------------------------------------------------------------------------
// REAL API (documented): list, get, create, update (PATCH) -> status and settings use PATCH too.
// FRONTEND-ONLY (no documented endpoint yet): menu availability and active branch; sales/orders/tables
// figures are not part of the branch API and therefore remain zero. Staff assignments use Employees PATCH.
// ---------------------------------------------------------------------------------------

// ---- mapping: backend model <-> frontend model ----
const time = (value) => (typeof value === 'string' ? value.slice(0, 5) : '')
const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

export function fromApi(raw) {
  const manager = typeof raw.manager === 'string' ? raw.manager : raw.manager?.name
  return {
    id: String(raw.id ?? raw._id),
    name: raw.name ?? '',
    code: raw.code ?? '',
    area: raw.location ?? '',
    address: raw.address ?? '',
    phone: raw.phone ?? '',
    manager: manager ?? '',
    opens: time(raw.openTime),
    closes: time(raw.closeTime),
    open: String(raw.status).toLowerCase() === 'open',
    settings: {
      currency: raw.currency ?? 'EGP',
      vat: num(raw.taxRate),
      serviceCharge: num(raw.serviceCharge),
      acceptDelivery: Boolean(raw.acceptsDelivery),
      deliveryFee: num(raw.deliveryFee),
      receiptFooter: raw.receiptFooter ?? '',
    },
    // Not part of the documented branch API: left empty instead of inventing values.
    tables: { total: 0, inUse: 0 }, salesToday: 0, ordersToday: 0, week: EMPTY_WEEK,
  }
}

// Always sends the complete documented body (PATCH accepts it too), built from a full frontend branch.
export function toApi(branch, open = branch.open) {
  const { settings } = branch
  return {
    name: branch.name,
    code: branch.code,
    location: branch.area,
    address: branch.address,
    phone: branch.phone,
    manager: branch.manager,
    openTime: branch.opens,
    closeTime: branch.closes,
    currency: settings.currency,
    taxRate: settings.vat,
    serviceCharge: settings.serviceCharge,
    status: open ? 'open' : 'closed',
    acceptsDelivery: settings.acceptDelivery,
    deliveryFee: settings.acceptDelivery ? settings.deliveryFee : 0,
    receiptFooter: settings.receiptFooter,
  }
}

// The Swagger response schemas could not be read, so accept common envelopes.
function pick(payload, keys, isList) {
  if (Array.isArray(payload)) return isList ? payload : null
  if (!payload || typeof payload !== 'object') return null
  if (!isList && (payload.id != null || payload._id != null)) return payload
  for (const key of keys) {
    const found = pick(payload[key], keys, isList)
    if (found) return found
  }
  return null
}
const one = (payload) => {
  const raw = pick(payload, ['data', 'branch', 'result'], false)
  if (!raw) throw new Error('The server returned an unexpected response.')
  return fromApi(raw)
}

export async function getBranches() {
  const list = pick(await api.get(ENDPOINTS.branches.list), ['data', 'branches', 'items', 'results'], true)
  if (!list) throw new Error('The server returned an unexpected response.')
  return list.map(fromApi)
}
export async function getBranchById(id) { return one(await api.get(ENDPOINTS.branches.byId(id))) }
export async function createBranch(branch) { return one(await api.post(ENDPOINTS.branches.list, toApi(branch, true))) }
// `branch` is the complete, already-merged frontend branch.
export async function updateBranch(id, branch) { return one(await api.patch(ENDPOINTS.branches.byId(id), toApi(branch))) }
export async function updateBranchStatus(id, open, current) { return one(await api.patch(ENDPOINTS.branches.byId(id), toApi(current, open))) }
export async function updateBranchSettings(id, settings, current) { return updateBranch(id, { ...current, settings: { ...current.settings, ...settings } }) }

// ---- frontend-only (mock) ----
const mock = { availability: {}, activeBranchId: null }
const defaults = () => Object.fromEntries(menuItems.map((item) => [item.sku, item.available]))
const clone = (value) => JSON.parse(JSON.stringify(value))

export async function getMenuAvailability(branches = []) {
  branches.forEach((branch) => { mock.availability[branch.id] ||= defaults() })
  return clone(mock.availability)
}
export async function updateMenuAvailability(branchId, sku, available) {
  mock.availability[branchId] = { ...(mock.availability[branchId] || defaults()), [sku]: Boolean(available) }
  return { branchId, sku, available: Boolean(available) }
}
export async function getActiveBranchId() { return mock.activeBranchId }
export async function switchBranch(branchId) { mock.activeBranchId = branchId; return branchId }
