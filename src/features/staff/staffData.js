// Shared UI labels and cash-count helpers. Backend records are loaded by the staff services.
export const ROLES = {
  manager: { label: 'Manager', description: 'Full access: reports, refunds, menu, staff and settings.' },
  cashier: { label: 'Cashier', description: 'Runs the POS, takes payments, applies discounts.' },
  kitchen: { label: 'Kitchen Staff', description: 'Uses the kitchen display to prepare orders.' },
}
export const PERMISSIONS = [
  { key: 'take_orders', label: 'Take orders & sell', group: 'POS' },
  { key: 'apply_discounts', label: 'Apply discounts', group: 'POS' },
  { key: 'cancel_orders', label: 'Cancel orders', group: 'Orders' },
  { key: 'issue_refunds', label: 'Issue refunds', group: 'Orders' },
  { key: 'kitchen_display', label: 'Use kitchen display', group: 'Kitchen' },
  { key: 'edit_menu', label: 'Edit menu & prices', group: 'Catalog' },
  { key: 'adjust_stock', label: 'Adjust stock', group: 'Inventory' },
  { key: 'view_reports', label: 'View reports', group: 'Reports' },
  { key: 'manage_staff', label: 'Manage staff & shifts', group: 'Admin' },
  { key: 'edit_settings', label: 'Edit settings', group: 'Admin' },
]
export const ALL_PERMISSIONS = PERMISSIONS.map((permission) => permission.key)
export const INITIAL_ROLE_DEFAULTS = {
  manager: ALL_PERMISSIONS,
  cashier: ['take_orders', 'apply_discounts', 'cancel_orders'],
  kitchen: ['kitchen_display'],
}
export const DENOMINATIONS = [200, 100, 50, 20, 10, 5, 1]
export const REGISTERS = ['Station #01', 'Station #02']
const round2 = (value) => Math.round(value * 100) / 100
export const expectedInDrawer = (shift) => round2(Number(shift.openingFloat) + Number(shift.cashSales))
export const countedTotal = (counts) => DENOMINATIONS.reduce((sum, value) => sum + value * (Number(counts[value]) || 0), 0)
export const differenceOf = (expected, counted) => round2(counted - expected)
export const formatMoney = (value) => `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
export const formatWhole = (value) => `${Math.round(Number(value)).toLocaleString('en-US')} EGP`
export const formatDifference = (value) => {
  const digits = Number.isInteger(value) ? 0 : 2
  const text = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${text} EGP`
}
export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.floor(totalMinutes))
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}
export const minutesSince = (timestamp, now) => (now - timestamp) / 60000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (value) => String(value).padStart(2, '0')
export const formatClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`
export const formatDate = (date) => `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
export const initialsOf = (name = '') => String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
export const branchNames = (ids, branches = []) => (ids || []).map((id) => branches.find((branch) => String(branch.id) === String(id))?.name).filter(Boolean)
