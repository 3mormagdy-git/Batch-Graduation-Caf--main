// Mock data for the Tables module (frontend only, no backend yet).
// Every value below comes from the design reference; replace with API data later.

export const BRANCH_NAME = 'Cairo Downtown'
export const ZONES = ['Window', 'Main Hall', 'Terrace']

export const STATUS_LABEL = {
  available: 'Available',
  occupied: 'Occupied',
  reserved: 'Reserved',
  cleaning: 'Cleaning',
}

// floor = grid cell on the floor plan (col/row, 1-based); shape/wide only affect the floor-plan tile.
export const TABLES = [
  { id: 'T-01', zone: 'Window', seats: 2, guests: 2, status: 'occupied', seatedMinutes: 1026, bill: 548.1, floor: { col: 1, row: 1 }, shape: 'circle' },
  { id: 'T-02', zone: 'Window', seats: 2, guests: 2, status: 'occupied', seatedMinutes: 983, bill: 119.7, floor: { col: 1, row: 2 }, shape: 'circle' },
  { id: 'T-03', zone: 'Main Hall', seats: 4, guests: 4, status: 'occupied', seatedMinutes: 1002, bill: 708.75, floor: { col: 2, row: 1 } },
  { id: 'T-04', zone: 'Main Hall', seats: 4, status: 'available', floor: { col: 2, row: 2 } },
  { id: 'T-05', zone: 'Main Hall', seats: 6, status: 'reserved', reservedAt: '15:30', floor: { col: 3, row: 1 }, wide: true },
  { id: 'T-06', zone: 'Main Hall', seats: 4, status: 'cleaning', floor: { col: 3, row: 2 } },
  { id: 'T-07', zone: 'Window', seats: 2, status: 'available', floor: { col: 1, row: 3 }, shape: 'circle' },
  { id: 'T-08', zone: 'Main Hall', seats: 4, guests: 3, status: 'occupied', seatedMinutes: 1051, bill: 693.0, floor: { col: 2, row: 3 } },
  { id: 'T-09', zone: 'Main Hall', seats: 8, status: 'available', floor: { col: 3, row: 3 }, wide: true },
  { id: 'T-10', zone: 'Terrace', seats: 2, status: 'cleaning', floor: { col: 4, row: 1 }, shape: 'circle' },
  { id: 'T-11', zone: 'Terrace', seats: 4, guests: 2, status: 'occupied', seatedMinutes: 993, bill: 422.1, floor: { col: 4, row: 2 } },
  { id: 'T-12', zone: 'Terrace', seats: 4, status: 'reserved', reservedAt: '16:00', floor: { col: 4, row: 3 } },
]

export const RESERVATIONS = [
  { name: 'Hana Fouad', tableId: 'T-05', guests: 5, time: '15:30' },
  { name: 'Omar Said', tableId: 'T-12', guests: 4, time: '16:00' },
]

// The reference shows 2,371.95 EGP, but its own rows add up to 2,491.65 (T-02's bill is
// not counted). The reference value is kept as-is; change it if the design is corrected.
export const OPEN_BILLS_TOTAL = 2371.95

// Only table T-01 has order details in the reference; other tables have no order data yet.

export const ORDERS = {
  // Existing order — preserved without changes
  'T-01': {
    number: 1041,
    openedAt: '23:56',
    openedBy: 'Salma Adel',
    status: 'Served',
    items: [
      { qty: 1, name: 'Spanish Latte', variant: 'Regular', price: 120 },
      { qty: 1, name: 'Mango Passion Cold Foam', variant: 'Regular', price: 145 },
      { qty: 2, name: 'Zaatar Cheese Croissant', variant: 'Warmed', price: 170 },
    ],
  },

  // Mock order for occupied table T-02
  'T-02': {
    number: 1042,
    openedAt: '23:40',
    openedBy: 'Salma Adel',
    status: 'Served',
    items: [
      { qty: 1, name: 'Table Order', variant: 'Mock item', price: 119.7 },
    ],
  },

  // Mock order for occupied table T-03
  'T-03': {
    number: 1043,
    openedAt: '23:35',
    openedBy: 'Salma Adel',
    status: 'Served',
    items: [
      { qty: 1, name: 'Table Order A', variant: 'Mock item', price: 220 },
      { qty: 1, name: 'Table Order B', variant: 'Mock item', price: 180 },
      { qty: 1, name: 'Table Order C', variant: 'Mock item', price: 162.5 },
    ],
  },

  // Mock order for occupied table T-08
  'T-08': {
    number: 1044,
    openedAt: '23:30',
    openedBy: 'Salma Adel',
    status: 'Served',
    items: [
      { qty: 1, name: 'Table Order A', variant: 'Mock item', price: 210 },
      { qty: 1, name: 'Table Order B', variant: 'Mock item', price: 190 },
      { qty: 1, name: 'Table Order C', variant: 'Mock item', price: 150 },
    ],
  },

  // Mock order for occupied table T-11
  'T-11': {
    number: 1045,
    openedAt: '23:45',
    openedBy: 'Salma Adel',
    status: 'Served',
    items: [
      { qty: 1, name: 'Table Order A', variant: 'Mock item', price: 120 },
      { qty: 1, name: 'Table Order B', variant: 'Mock item', price: 115 },
      { qty: 1, name: 'Table Order C', variant: 'Mock item', price: 100 },
    ],
  },
}

export const VAT_RATE = 0.14
export const SERVICE_RATE = 0.12

export const ORDER_TYPES = [
  { id: 'dine-in', label: 'Dine-in', description: 'Seat guests at a table and keep the tab open.' },
  { id: 'takeaway', label: 'Takeaway', description: 'Counter order, paid upfront, picked up at the bar.', note: 'Avg. ready in 6 min' },
  { id: 'delivery', label: 'Delivery', description: 'Collect customer details and a delivery address.', note: '25 EGP fee • ~35 min' },
]

export const formatMoney = (value) =>
  Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 1026 -> "17h 06m"
export const formatDuration = (minutes) =>
  `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`

export const countByStatus = (status) => TABLES.filter((table) => table.status === status).length

// Subtotal + VAT + service charge for an order (all derived from the item prices).
export function priceOrder(order) {
  const round = (n) => Math.round(n * 100) / 100
  const subtotal = round(order.items.reduce((sum, item) => sum + item.price, 0))
  const vat = round(subtotal * VAT_RATE)
  const service = round(subtotal * SERVICE_RATE)
  return { subtotal, vat, service, total: round(subtotal + vat + service) }
}
