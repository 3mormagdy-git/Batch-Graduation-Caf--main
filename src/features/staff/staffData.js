// Mock data for the Staff & Shifts module (frontend only, no backend yet).
// Values come from the design reference; replace with API data later.

export const BRANCH_NAME = 'Cairo Downtown'
export const CURRENT_EMPLOYEE_ID = 'salma' // the signed-in user ("SA" in the header)

export const BRANCHES = [
  { id: 'cairo-downtown', name: 'Cairo Downtown', address: 'Downtown, Cairo', code: 'CDT' },
  { id: 'zamalek', name: 'Zamalek', address: 'Zamalek, Cairo', code: 'ZMK' },
  { id: 'new-cairo', name: 'New Cairo', address: 'Fifth Settlement, New Cairo' },
  { id: 'san', name: 'SAN', address: '010' },
]
export const REGISTERS = ['Station #01', 'Station #02']

export const ROLES = {
  manager: { label: 'Manager', description: 'Full access: reports, refunds, menu, staff and settings.' },
  cashier: { label: 'Cashier', description: 'Runs the POS, takes payments, applies discounts.' },
  kitchen: { label: 'Kitchen Staff', description: 'Uses the kitchen display to prepare orders.' },
}

// Listed in the order the reference shows them (two-column grid reads left to right).
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

// Default permissions per role. Managers always have everything (not editable).
export const INITIAL_ROLE_DEFAULTS = {
  manager: ALL_PERMISSIONS,
  cashier: ['take_orders', 'apply_discounts', 'cancel_orders'],
  kitchen: ['kitchen_display'],
}

export const DENOMINATIONS = [200, 100, 50, 20, 10, 5, 1]

const ALL_BRANCHES = BRANCHES.map((branch) => branch.id)
export const INITIAL_EMPLOYEES = [
  { id: 'salma', name: 'Salma Adel', email: 'salma@nahj.cafe', phone: '+20 100 214 5501', role: 'manager', branches: ALL_BRANCHES, status: 'active', onShift: true, tone: 'pink' },
  { id: 'ali', name: 'Ali Adel', email: 'salma@nahj.cafe', phone: '+20 100 214 5501', role: 'manager', branches: ALL_BRANCHES, status: 'active', onShift: true, tone: 'pink' },
  { id: 'omar', name: 'Omar Fathy', email: 'omar.f@nahj.cafe', phone: '+20 101 663 2044', role: 'cashier', branches: ['cairo-downtown', 'san'], status: 'active', onShift: false, tone: 'sand' },
  { id: 'mariam', name: 'Mariam Samir', email: 'mariam@nahj.cafe', phone: '+20 115 902 7731', role: 'cashier', branches: ['cairo-downtown', 'zamalek'], status: 'active', onShift: true, tone: 'sand' },
  { id: 'hassan', name: 'Hassan Ali', email: 'hassan@nahj.cafe', phone: '+20 100 771 3390', role: 'kitchen', branches: ['cairo-downtown'], status: 'active', onShift: false, tone: 'pink' },
  { id: 'rana', name: 'Rana Mostafa', email: 'rana@nahj.cafe', phone: '+20 112 208 6645', role: 'kitchen', branches: ['cairo-downtown', 'new-cairo'], status: 'active', onShift: false, tone: 'mint' },
  { id: 'dina', name: 'Dina Kamel', email: 'dina@nahj.cafe', phone: '+20 106 119 4472', role: 'cashier', branches: ['cairo-downtown'], status: 'inactive', onShift: false, tone: 'amber' },
].map((employee) => ({ ...employee, permissions: INITIAL_ROLE_DEFAULTS[employee.role] }))

const LOAD_TIME = Date.now()
const minutesAgo = (minutes) => LOAD_TIME - minutes * 60000

// Seeded "snapshot" shifts: durations keep ticking from the values shown in the reference.
export const INITIAL_ACTIVE_SHIFT = {
  employeeId: CURRENT_EMPLOYEE_ID,
  branch: BRANCH_NAME,
  register: 'Station #01',
  startedAt: minutesAgo(23 * 60 + 43),
  startedLabel: '18:06',
  periodLabel: '16 Oct 2026, 18:06',
  orders: 40,
  totalSales: 12732,
  cashSales: 5002.3,
  openingFloat: 1500,
}
export const INITIAL_OTHER_SHIFTS = [
  { employeeId: 'mariam', branch: BRANCH_NAME, register: 'Station #02', startedAt: minutesAgo(20 * 60 + 11), sales: 4310 },
]
export const INITIAL_SHIFT_HISTORY = [
  { id: 'h1', employee: 'Omar Fathy', branch: BRANCH_NAME, period: '16 Oct 2026, 07:00', sales: 14920, expected: 6710, counted: 6700, difference: -10 },
  { id: 'h2', employee: 'Omar Fathy', branch: BRANCH_NAME, period: '15 Oct 2026, 15:00', sales: 16240, expected: 7340, counted: 7360, difference: 20 },
]

// ---- helpers ----
const round2 = (value) => Math.round(value * 100) / 100
export const expectedInDrawer = (shift) => round2(shift.openingFloat + shift.cashSales)
export const countedTotal = (counts) => DENOMINATIONS.reduce((sum, value) => sum + value * (Number(counts[value]) || 0), 0)
export const differenceOf = (expected, counted) => round2(counted - expected)

export const formatMoney = (value) => `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP`
export const formatWhole = (value) => `${Math.round(value).toLocaleString('en-US')} EGP`
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

export const initialsOf = (name) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
export const branchNames = (ids) => ids.map((id) => BRANCHES.find((branch) => branch.id === id)?.name).filter(Boolean)
