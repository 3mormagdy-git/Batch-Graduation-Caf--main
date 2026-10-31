import { useEffect, useRef, useState } from 'react'
import { WEEK_DAYS, formatK, formatEGP } from '../branchesData.js'

const niceMax = (value) => {
  if (value <= 0) return 10000
  const step = 10 ** Math.floor(Math.log10(value))
  return Math.ceil(value / step) * step
}
const ticks = (max) => [0, 1, 2, 3, 4].map((i) => (max / 4) * i)
const L = 40, T = 10

// Measures the container so the SVG is drawn at its real width (text never scales with the card).
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const update = () => setWidth(Math.round(node.clientWidth))
    update()
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', update); return () => window.removeEventListener('resize', update) }
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width]
}

function Tooltip({ x, y, day, sales, orders, right }) {
  const left = Math.min(x + 10, right - 100)
  return (
    <g transform={`translate(${left}, ${Math.max(T, y)})`} pointerEvents="none">
      <rect width="100" height="54" rx="6" fill="#fff" stroke="#E8DFDA" />
      <text x="8" y="16" fontSize="10" fill="#8A7F83">{day}</text>
      <text x="8" y="31" fontSize="11" fontWeight="600" fill="#1C0A10">{formatEGP(sales)}</text>
      <text x="8" y="46" fontSize="10" fill="#8A7F83">{orders} orders</text>
    </g>
  )
}

// Weekly area chart (this week, solid) with last week as a dashed line.
export function WeekAreaChart({ sales, prevSales, orders, label = 'Sales this week', height = 230 }) {
  const [box, width] = useWidth()
  const [active, setActive] = useState(3)
  const H = height, B = H - 26, R = Math.max(L + 70, width - 8)
  const max = niceMax(Math.max(...sales, ...prevSales))
  const band = (R - L) / 7
  const x = (i) => L + band * (i + 0.5)
  const y = (v) => B - (v / max) * (B - T)
  const line = (values) => values.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ')
  const hasData = sales.some(Boolean) || prevSales.some(Boolean)
  return (
    <div ref={box} style={{ height: H }}>
    {width > 0 && <svg width={width} height={H} role="img" aria-label={label} className="block">
      {ticks(max).map((t) => (
        <g key={t}>
          <line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke="#EDE6E2" />
          <text x="0" y={y(t) + 4} fontSize="11" fill="#8A7F83">{formatK(t)}</text>
        </g>
      ))}
      <path d={`${line(sales)} L ${x(6)} ${B} L ${x(0)} ${B} Z`} fill="#78263D" fillOpacity=".07" />
      {hasData && <path d={line(prevSales)} fill="none" stroke="#78263D" strokeWidth="1.5" strokeDasharray="4 4" />}
      {hasData && <line x1={x(active)} x2={x(active)} y1={y(sales[active])} y2={B} stroke="#78263D" strokeOpacity=".3" />}
      {hasData && <circle cx={x(active)} cy={y(sales[active])} r="3.5" fill="#78263D" />}
      {WEEK_DAYS.map((day, i) => (
        <g key={day} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} tabIndex={0}>
          <rect x={L + band * i} y={T} width={band} height={B - T + 26} fill="transparent" />
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#8A7F83">{day}</text>
        </g>
      ))}
      {hasData && <Tooltip right={R} x={x(active)} y={y(sales[active]) + 8} day={WEEK_DAYS[active]} sales={sales[active]} orders={orders[active]} />}
    </svg>}
    </div>
  )
}

// Chain-wide weekly bars; the hovered day is highlighted with a tooltip.
export function WeekBarChart({ sales, orders, height = 190 }) {
  const [box, width] = useWidth()
  const [active, setActive] = useState(3)
  const H = height, B = H - 26, R = Math.max(L + 70, width - 8)
  const max = niceMax(Math.max(...sales))
  const band = (R - L) / 7
  const y = (v) => B - (v / max) * (B - T)
  return (
    <div ref={box} style={{ height: H }}>
    {width > 0 && <svg width={width} height={H} role="img" aria-label="Chain sales this week" className="block">
      {ticks(max).map((t) => (
        <g key={t}>
          <line x1={L} x2={R} y1={y(t)} y2={y(t)} stroke="#EDE6E2" />
          <text x="0" y={y(t) + 4} fontSize="11" fill="#8A7F83">{formatK(t)}</text>
        </g>
      ))}
      {WEEK_DAYS.map((day, i) => (
        <g key={day} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} tabIndex={0}>
          <rect x={L + band * i} y={T} width={band} height={B - T + 26} fill={i === active ? '#F9F5F1' : 'transparent'} />
          <rect x={L + band * i + band * 0.25} y={y(sales[i])} width={band * 0.5} height={B - y(sales[i])} rx="3" fill="#78263D" />
          <text x={L + band * (i + 0.5)} y={H - 8} textAnchor="middle" fontSize="11" fill="#8A7F83">{day}</text>
        </g>
      ))}
      <Tooltip right={R} x={L + band * (active + 0.5)} y={Math.max(T, y(sales[active]) - 6)} day={WEEK_DAYS[active]} sales={sales[active]} orders={orders[active]} />
    </svg>}
    </div>
  )
}
