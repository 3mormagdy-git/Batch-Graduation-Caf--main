import { useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Banknote,
  Landmark,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { Route, Routes } from 'react-router-dom'
import {
  bestSellers,
  branches,
  kpis,
  paymentMethods,
  recentOrders,
  salesTrend,
  staffOnShift,
} from './data/dashboard.js'
import AppShell from './components/layout/AppShell.jsx'
import MenuPage from './features/menu/MenuPage.jsx'
import './App.css'

const kpiIcons = { wallet: Banknote, orders: Receipt, bag: ShoppingBag, chair: Landmark }
const formatNumber = (value) => Number(value).toLocaleString('en-US')
const formatCurrency = (value) => `${formatNumber(value)} EGP`

function Card({ className = '', children }) {
  return <section className={`dashboard-card ${className}`}>{children}</section>
}

function CardHeading({ title, subtitle, action }) {
  return (
    <div className="card-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function RangeToggle({ range, onRangeChange }) {
  return (
    <div className="range-toggle" role="group" aria-label="Dashboard time range">
      {['Today', '7 days', '6 months'].map((item) => (
        <button
          className={range === item ? 'active' : ''}
          key={item}
          type="button"
          aria-pressed={range === item}
          onClick={() => onRangeChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function Greeting({ range, onRangeChange }) {
  return (
    <div className="greeting-row">
      <div>
        <h1>Good evening, Salma</h1>
        <p>Zamalek <span>•</span> Wednesday 14 October</p>
      </div>
      <RangeToggle range={range} onRangeChange={onRangeChange} />
    </div>
  )
}

function KpiCard({ item }) {
  const Icon = kpiIcons[item.icon]
  return (
    <Card className="kpi-card">
      <div className="kpi-topline">
        <span className="kpi-label">{item.label}</span>
        <span className={`kpi-icon-tile ${item.tone}`}><Icon size={18} strokeWidth={1.8} /></span>
      </div>
      <div className="kpi-value">
        <strong>{typeof item.value === 'number' ? formatNumber(item.value) : item.value}</strong>
        <span>{item.unit}</span>
      </div>
      <div className="kpi-bottomline">
        {item.changeTone === 'occupancy'
          ? <span className="occupancy-label"><i />{item.change}</span>
          : <span className={`kpi-chip ${item.changeTone}`}>
            {item.changeTone === 'mint' && <TrendingUp size={12} strokeWidth={2} />}
            {item.change}
          </span>}
        <span className={`kpi-detail${item.label === 'TOTAL ORDERS FULFILLED' ? ' accent' : ''}`}>{item.detail}</span>
      </div>
    </Card>
  )
}

function KpiRow() {
  return <div className="kpi-grid">{kpis.map((item) => <KpiCard item={item} key={item.label} />)}</div>
}

function SalesTrendChart({ range }) {
  const [activeIndex, setActiveIndex] = useState(3)
  const chart = { left: 40, right: 840, top: 20, bottom: 260 }
  const x = (percentage) => chart.left + (percentage / 100) * (chart.right - chart.left)
  const isSixMonths = range === '6 months'
  const labels = isSixMonths ? ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'] : salesTrend.map(({ day }) => day)
  const y = (value) => chart.bottom - (value / (isSixMonths ? 500 : 50)) * (chart.bottom - chart.top)
  const bands = labels.map((day, index) => ({
    ...salesTrend[Math.min(index, salesTrend.length - 1)],
    day,
    x: chart.left + ((index + 0.5) * (chart.right - chart.left)) / labels.length,
  }))
  const areaValues = [
    [0, isSixMonths ? 120 : 17],
    [12, isSixMonths ? 120 : 17],
    [37, isSixMonths ? 190 : 28],
    [62, isSixMonths ? 190 : 28],
    [87, isSixMonths ? 310 : 39],
    [100, isSixMonths ? 310 : 39],
  ]
  const comparisonValues = [
    [0, isSixMonths ? 180 : 24],
    [12, isSixMonths ? 180 : 24],
    [37, isSixMonths ? 260 : 33.4],
    [62, isSixMonths ? 260 : 33.4],
    [87, isSixMonths ? 390 : 43],
    [100, isSixMonths ? 390 : 43],
  ]
  const areaPath = areaValues
    .map(([percentage, value], index) => `${index === 0 ? 'M' : 'L'} ${x(percentage)} ${y(value)}`)
    .join(' ')
  const comparisonPath = comparisonValues
    .map(([percentage, value], index) => `${index === 0 ? 'M' : 'L'} ${x(percentage)} ${y(value)}`)
    .join(' ')
  const safeActiveIndex = Math.min(activeIndex, bands.length - 1)
  const activePoint = bands[safeActiveIndex]
  const activePercentage = ((safeActiveIndex + 0.5) / bands.length) * 100
  const selectedSegment = areaValues.findIndex(([percentage], index) => (
    index < areaValues.length - 1
      && activePercentage >= percentage
      && activePercentage <= areaValues[index + 1][0]
  ))
  const [segmentStartX, segmentStartY] = areaValues[Math.max(0, selectedSegment)]
  const [segmentEndX, segmentEndY] = areaValues[Math.max(1, selectedSegment + 1)]
  const selectedValue = segmentStartY
    + ((activePercentage - segmentStartX) / (segmentEndX - segmentStartX)) * (segmentEndY - segmentStartY)
  const selectedY = y(selectedValue)
  const tooltipX = Math.min(activePoint.x + 8, chart.right - 84)
  const tooltipY = Math.min(selectedY + 10, chart.bottom - 54)

  return (
    <Card className="sales-card">
      <CardHeading
        title="Sales trend"
        subtitle={isSixMonths ? 'Last 6 months' : range === '7 days' ? 'Last 7 days' : 'Today'}
        action={<a className="card-link" href="#report" onClick={(event) => event.preventDefault()}>Full report <ArrowRight size={13} /></a>}
      />
      <svg className="sales-chart" viewBox="0 0 860 300" role="img" aria-label={`Sales trend chart showing ${isSixMonths ? 'September through February' : 'Saturday through Friday'}`}>
        <defs>
          <linearGradient id="sales-area-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#78263D" stopOpacity=".09" />
            <stop offset="100%" stopColor="#78263D" stopOpacity=".02" />
          </linearGradient>
        </defs>
        {(isSixMonths ? [100, 200, 300, 400, 500] : [10, 20, 30, 40, 50]).map((tick) => (
          <g key={tick}>
            <line x1={chart.left} y1={y(tick)} x2={chart.right} y2={y(tick)} className="chart-gridline" />
            <text x="0" y={y(tick) + 4} className="chart-axis-label">{tick}k</text>
          </g>
        ))}
        <path d={`${areaPath} L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`} fill="url(#sales-area-fill)" />
        <path d={comparisonPath} className="chart-comparison-line" />
        {!isSixMonths && <line x1={activePoint.x} y1={selectedY} x2={activePoint.x} y2={chart.bottom} className="chart-hairline" />}
        {bands.map((point, index) => (
          <g key={point.day} onMouseEnter={() => !isSixMonths && setActiveIndex(index)}>
            <rect x={chart.left + index * ((chart.right - chart.left) / bands.length)} y={chart.top} width={(chart.right - chart.left) / bands.length} height={chart.bottom - chart.top + 36} fill="transparent" />
            {!isSixMonths && index === activeIndex && <circle cx={point.x} cy={selectedY} r="3" className="chart-active-dot" />}
            <text x={point.x} y="286" textAnchor="middle" className="chart-axis-label">{point.day}</text>
          </g>
        ))}
        {!isSixMonths && <g className="chart-tooltip" transform={`translate(${tooltipX}, ${tooltipY})`}>
          <rect width="84" height="54" rx="6" />
          <text x="6" y="14" className="tooltip-day">{activePoint.day}</text>
          <text x="6" y="30" className="tooltip-total">21,200 EGP</text>
          <text x="6" y="45" className="tooltip-orders">260 Orders</text>
        </g>}
      </svg>
    </Card>
  )
}

function PaymentDonut() {
  const total = paymentMethods.reduce((sum, item) => sum + item.value, 0)
  const radius = 56
  const circumference = 2 * Math.PI * radius

  return (
    <Card className="payment-card">
      <CardHeading title="Payment methods" subtitle="Today" />
      <div className="payment-content">
        <svg className="payment-donut" viewBox="0 0 160 160" role="img" aria-label="Payment methods: Card 7,920 EGP, Cash 3,120 EGP, Wallet 1,840 EGP, Split 860 EGP">
          <circle cx="80" cy="80" r={radius} className="donut-track" />
          {paymentMethods.map((item, index) => {
            const length = (item.value / total) * circumference
            const offset = -paymentMethods
              .slice(0, index)
              .reduce((sum, previous) => sum + (previous.value / total) * circumference, 0)
            return (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="28"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={offset}
                transform="rotate(-90 80 80)"
              />
            )
          })}
          <text x="80" y="75" textAnchor="middle" className="donut-center-label">Collected</text>
          <text x="80" y="101" textAnchor="middle" className="donut-center-value">14k</text>
        </svg>
        <div className="payment-legend">
          {[...paymentMethods].sort((a, b) => b.value - a.value).map((item) => (
            <div className="legend-row" key={item.label}>
              <span className="legend-swatch" style={{ backgroundColor: item.color }} />
              <span className="legend-name">{item.label}</span>
              <span className="legend-value">{formatNumber(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="payment-note">Card leads at <strong>58%</strong> of revenue. Cash drawers reconcile at shift end.</p>
    </Card>
  )
}

function StatusPill({ status }) {
  return <span className={`status-pill ${status.toLowerCase()}`}><i />{status}</span>
}

function RecentOrdersTable() {
  return (
    <Card className="orders-card">
      <CardHeading
        title="Recent orders"
        action={<a className="card-link" href="#orders" onClick={(event) => event.preventDefault()}>All orders <ArrowRight size={13} /></a>}
      />
      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead><tr><th>Order</th><th>Type</th><th>Items</th><th>Status</th><th>Total</th></tr></thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td><strong>{order.id}</strong><span className="order-time">{order.time}</span></td>
                <td>
                  {order.type}
                  {order.zone && <span className="order-zone"> • {order.zone}</span>}
                </td>
                <td className="order-items" title={order.items}>{order.items}</td>
                <td><StatusPill status={order.status} /></td>
                <td className="order-total">{order.total.toFixed(2)} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BestSellers() {
  return (
    <Card className="best-sellers-card">
      <CardHeading title="Best sellers" subtitle="Today" />
      <div className="seller-list">
        {bestSellers.map((item, index) => (
          <div className="seller-row" key={item.name}>
            <img src={`/images/menu/${item.image}`} alt="" loading="lazy" />
            <div className="seller-info"><strong>{item.name}</strong><span>{item.sold} sold</span></div>
            <div className="seller-revenue">
              <strong>{formatCurrency(item.revenue)}</strong>
              {index === 0 && <span className="top-item">Top item</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BranchPerformance() {
  const highestRevenue = Math.max(...branches.map((branch) => branch.revenue))
  return (
    <Card className="branches-card">
      <CardHeading
        title="Branch performance"
        subtitle="Revenue share • Today"
        action={<a className="card-link compare-link" href="#compare" onClick={(event) => event.preventDefault()}><BarChart3 size={14} />Compare</a>}
      />
      <div className="branch-list">
        {branches.map((branch) => (
          <div className="branch-row" key={branch.name}>
            <div className="branch-info">
              <div className="branch-name">
                <strong>{branch.name}</strong>
                {branch.viewing && <span className="viewing-tag">Viewing</span>}
              </div>
              <span className="branch-details"><i />Open <b>•</b> {branch.orders} orders <b>•</b> AOV {branch.aov}</span>
            </div>
            <div className="branch-track"><span style={{ width: `${(branch.revenue / highestRevenue) * 100}%` }} /></div>
            <strong className="branch-revenue">{formatNumber(branch.revenue)} EGP</strong>
          </div>
        ))}
      </div>
    </Card>
  )
}

function StaffOnShift() {
  return (
    <Card className="staff-card">
      <CardHeading
        title="Staff on shift"
        subtitle="7 active now"
        action={<a className="card-link" href="#shifts" onClick={(event) => event.preventDefault()}>Shifts <ArrowRight size={13} /></a>}
      />
      <div className="staff-list">
        {staffOnShift.map((staff) => (
          <div className="staff-row" key={staff.initials}>
            <span className="staff-avatar">{staff.initials}</span>
            <div className="staff-info"><strong>{staff.name}</strong><span>Station #04 • Zamalek</span></div>
            <div className="staff-stats"><strong><i />{staff.hours}</strong><span>{formatCurrency(staff.amount)}</span></div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const [range, setRange] = useState('Today')
  return (
    <div className="main-content">
      <Greeting range={range} onRangeChange={setRange} />
      <KpiRow />
      <div className="dashboard-row"><SalesTrendChart range={range} /><PaymentDonut /></div>
      <div className="dashboard-row"><RecentOrdersTable /><BestSellers /></div>
      <div className="dashboard-row"><BranchPerformance /><StaffOnShift /></div>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Route>
    </Routes>
  )
}

export default App
