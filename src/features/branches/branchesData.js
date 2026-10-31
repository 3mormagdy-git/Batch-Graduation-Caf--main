// Constants + pure helpers for Branch Management. Branch records come from the API
// (see branchesService.js); there is no mock branch list any more.

export const WEEK_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export const DEFAULT_SETTINGS = {
  currency: 'EGP', vat: 14, serviceCharge: 12, acceptDelivery: true, deliveryFee: 25, receiptFooter: 'Thank you for visiting NAHJ',
}
export const EMPTY_WEEK = { sales: [0, 0, 0, 0, 0, 0, 0], orders: [0, 0, 0, 0, 0, 0, 0], prevSales: [0, 0, 0, 0, 0, 0, 0] }

// ---- pure helpers (derived values, never stored) ----
export const sum = (values) => values.reduce((total, value) => total + value, 0)
export const formatEGP = (value, currency = 'EGP') => `${Math.round(Number(value) || 0).toLocaleString('en-US')} ${currency}`
export const formatK = (value) => (value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value))
export const hours = (branch) => `${branch.opens} - ${branch.closes}`
export const aov = (branch) => (branch.ordersToday ? Math.round(branch.salesToday / branch.ordersToday) : 0)
export const slugify = (text) => text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'branch'

export function weekGrowth(sales, prev) {
  const before = sum(prev)
  return before ? Math.round(((sum(sales) - before) / before) * 1000) / 10 : null
}

export function chainWeek(branches) {
  const total = (key) => WEEK_DAYS.map((_, day) => sum(branches.map((branch) => branch.week[key][day])))
  return { sales: total('sales'), orders: total('orders'), prevSales: total('prevSales') }
}

export function chainStats(branches) {
  const week = chainWeek(branches)
  const top = branches.reduce((best, branch) => (!best || branch.salesToday > best.salesToday ? branch : best), null)
  return {
    sales: sum(branches.map((branch) => branch.salesToday)),
    orders: sum(branches.map((branch) => branch.ordersToday)),
    open: branches.filter((branch) => branch.open).length,
    total: branches.length,
    top: top && top.salesToday > 0 ? top : null,
    salesGrowth: weekGrowth(week.sales, week.prevSales),
    orderGrowth: null,
    week,
  }
}
