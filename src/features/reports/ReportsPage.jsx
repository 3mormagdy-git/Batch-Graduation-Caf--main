import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, BarChart3, CalendarDays, Download, RefreshCw, Store,
  Trophy, CreditCard, ShoppingBag, FileBarChart,
} from 'lucide-react'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import { getReportDashboard, getSalesReport } from './reportsService.js'
import './ReportsPage.css'

const PERIODS = [
  { value: 'today', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
]

const REPORT_VIEWS = [
  { id: 'overview', label: 'Sales overview', description: 'Revenue, orders and AOV', icon: BarChart3 },
  { id: 'period', label: 'Daily / weekly / monthly', description: 'Sales by period', icon: CalendarDays },
  { id: 'branches', label: 'Branch comparison', description: 'Compare branch performance', icon: Store },
  { id: 'products', label: 'Best-selling products', description: 'Top items by sales', icon: Trophy },
  { id: 'orders', label: 'Orders by type', description: 'Dine-in, takeaway and delivery', icon: ShoppingBag },
  { id: 'payments', label: 'Payment breakdown', description: 'Cash, card and wallet', icon: CreditCard },
]

const labelize = (value) => String(value)
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .replace(/^./, (letter) => letter.toUpperCase())

function displayValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function collectScalars(value, path = [], output = []) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return output
  Object.entries(value).forEach(([key, child]) => {
    if (child === null || ['string', 'number', 'boolean'].includes(typeof child)) {
      output.push({ key: path.concat(key).join(' / '), value: child })
    } else if (child && typeof child === 'object' && !Array.isArray(child)) {
      collectScalars(child, path.concat(key), output)
    }
  })
  return output
}

function collectTables(value, path = [], output = []) {
  if (Array.isArray(value)) {
    if (value.length && value.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
      output.push({ title: path.length ? path.map(labelize).join(' / ') : 'Report details', rows: value })
    } else if (value.length && value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))) {
      output.push({ title: path.length ? path.map(labelize).join(' / ') : 'Report details', rows: value.map((item) => ({ value: item })) })
    } else if (value.length && value.some((item) => item && typeof item === 'object')) {
      value.forEach((item, index) => collectTables(item, path.concat(`Item ${index + 1}`), output))
    }
    return output
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      if (child && typeof child === 'object') collectTables(child, path.concat(key), output)
    })
  }
  return output
}

function collectChartSeries(tables) {
  for (const table of tables) {
    const rows = table.rows
    const keys = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    const numericKey = keys.find((key) => rows.some((row) => typeof row[key] === 'number'))
    const labelKey = keys.find((key) => key !== numericKey && rows.some((row) => ['string', 'number'].includes(typeof row[key])))
    if (numericKey && labelKey) return { title: table.title, rows, numericKey, labelKey }
  }
  return null
}

function MetricCards({ data }) {
  const metrics = useMemo(() => collectScalars(data).filter((item) => typeof item.value === 'number').slice(0, 4), [data])
  if (!metrics.length) return null
  return (
    <div className="reports-metrics">
      {metrics.map((metric) => (
        <article className="reports-metric" key={metric.key}>
          <span>{labelize(metric.key.split(' / ').slice(-1)[0])}</span>
          <strong>{displayValue(metric.value)}</strong>
          <small>{metric.key.includes(' / ') ? metric.key.split(' / ').slice(0, -1).map(labelize).join(' · ') : 'From live report'}</small>
        </article>
      ))}
    </div>
  )
}

function AutoBarChart({ series }) {
  if (!series) return null
  const values = series.rows.map((row) => Number(row[series.numericKey]) || 0)
  const max = Math.max(...values, 1)
  return (
    <section className="reports-panel reports-chart-panel">
      <div className="reports-panel-heading">
        <div><h2>{series.title}</h2><p>{labelize(series.numericKey)} by {labelize(series.labelKey)}</p></div>
        <Activity size={18} />
      </div>
      <div className="reports-bars" role="img" aria-label={`${labelize(series.numericKey)} chart`}>
        {series.rows.slice(0, 14).map((row, index) => (
          <div className="reports-bar-column" key={`${String(row[series.labelKey])}-${index}`}>
            <strong>{displayValue(row[series.numericKey])}</strong>
            <div className="reports-bar-track"><span style={{ height: `${Math.max(3, (Number(row[series.numericKey]) / max) * 100)}%` }} /></div>
            <small title={String(row[series.labelKey])}>{String(row[series.labelKey])}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function DataTable({ table }) {
  const columns = [...new Set(table.rows.flatMap((row) => Object.keys(row)))].slice(0, 8)
  if (!columns.length) return null
  return (
    <section className="reports-panel reports-table-panel">
      <div className="reports-panel-heading"><div><h2>{table.title}</h2><p>{table.rows.length} records returned by the API</p></div></div>
      <div className="reports-table-scroll">
        <table>
          <thead><tr>{columns.map((key) => <th key={key}>{labelize(key)}</th>)}</tr></thead>
          <tbody>
            {table.rows.slice(0, 30).map((row, index) => (
              <tr key={row.id ?? row._id ?? index}>
                {columns.map((key) => <td key={key}>{displayValue(row[key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.rows.length > 30 && <p className="reports-table-footnote">Showing first 30 of {table.rows.length} records.</p>}
    </section>
  )
}

function ApiDataView({ title, state, emptyMessage, focus }) {
  if (state.loading) return <div className="reports-state"><span className="reports-spinner" />Loading {title.toLowerCase()}…</div>
  if (state.error) return (
    <div className="reports-state reports-error">
      <strong>Could not load {title.toLowerCase()}</strong>
      <p>{state.error}</p>
    </div>
  )
  if (state.data === null || state.data === undefined) return <div className="reports-state">{emptyMessage}</div>

  const allTables = collectTables(state.data)
  const focusTerms = focus?.terms || []
  const matchedTables = focusTerms.length
    ? allTables.filter((table) => focusTerms.some((term) => table.title.toLowerCase().includes(term)))
    : allTables
  const tables = matchedTables.length ? matchedTables : allTables
  const metrics = collectScalars(state.data).filter((item) => typeof item.value === 'number')
  const hasUsefulData = tables.length > 0 || metrics.length > 0 || collectScalars(state.data).length > 0
  if (!hasUsefulData) return (
    <div className="reports-state">
      <strong>No report data available</strong>
      <p>The API returned an empty result for this selection.</p>
    </div>
  )

  const chart = collectChartSeries(tables)
  return (
    <div className="reports-data-view">
      {focusTerms.length > 0 && matchedTables.length === 0 && (
        <p className="reports-view-note">The API response does not expose a separate {focus.label.toLowerCase()} section. Showing the available sales response instead.</p>
      )}
      <MetricCards data={state.data} />
      {chart && <AutoBarChart series={chart} />}
      {tables.map((table, index) => <DataTable table={table} key={`${table.title}-${index}`} />)}
      {!tables.length && !metrics.length && (
        <section className="reports-panel reports-raw-panel">
          <h2>{title} response</h2>
          <pre>{JSON.stringify(state.data, null, 2)}</pre>
        </section>
      )}
    </div>
  )
}

function flattenForCsv(value, path = [], rows = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenForCsv(item, path.concat(index + 1), rows))
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => flattenForCsv(child, path.concat(key), rows))
  } else {
    rows.push([path.join(' / '), value ?? ''])
  }
  return rows
}

function exportCsv(dashboard, sales, period, branchName) {
  const rows = [['Report', 'Field', 'Value']]
  flattenForCsv(dashboard, ['Dashboard']).forEach(([field, value]) => rows.push(['Dashboard', field, value]))
  flattenForCsv(sales, ['Sales']).forEach(([field, value]) => rows.push(['Sales', field, value]))
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `nahj-${branchName || 'all-branches'}-${period}-report.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const { activeBranch, loading: branchesLoading } = useBranches()
  const [period, setPeriod] = useState('week')
  const [activeView, setActiveView] = useState('overview')
  const [reloadKey, setReloadKey] = useState(0)
  const [dashboard, setDashboard] = useState({ loading: true, error: '', data: null })
  const [sales, setSales] = useState({ loading: true, error: '', data: null })

  const refresh = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    if (branchesLoading) return undefined
    const controller = new AbortController()
    const branchId = activeBranch?.id || undefined
    setDashboard({ loading: true, error: '', data: null })
    setSales({ loading: true, error: '', data: null })

    getReportDashboard({ branchId, signal: controller.signal })
      .then((data) => setDashboard({ loading: false, error: '', data }))
      .catch((error) => { if (!controller.signal.aborted) setDashboard({ loading: false, error: error.message, data: null }) })

    getSalesReport({ branchId, period, signal: controller.signal })
      .then((data) => setSales({ loading: false, error: '', data }))
      .catch((error) => { if (!controller.signal.aborted) setSales({ loading: false, error: error.message, data: null }) })

    return () => controller.abort()
  }, [activeBranch?.id, branchesLoading, period, reloadKey])

  const selected = REPORT_VIEWS.find((view) => view.id === activeView) || REPORT_VIEWS[0]
  const SelectedIcon = selected.icon
  const canExport = dashboard.data != null || sales.data != null
  const focusByView = {
    branches: { label: 'Branch comparison', terms: ['branch'] },
    products: { label: 'Best-selling products', terms: ['product', 'item', 'seller'] },
    orders: { label: 'Orders by type', terms: ['type', 'order'] },
    payments: { label: 'Payment breakdown', terms: ['payment', 'method'] },
  }

  return (
    <div className="reports-page">
      <div className="reports-title-row">
        <div>
          <h1>Analytics &amp; Reports</h1>
          <p>Choose a report, scope it to a branch and period, then export.</p>
        </div>
        <button className="reports-export-button" type="button" disabled={!canExport} onClick={() => exportCsv(dashboard.data, sales.data, period, activeBranch?.name?.toLowerCase().replace(/\s+/g, '-') || 'all-branches')}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="reports-layout">
        <aside className="reports-navigation" aria-label="Report types">
          {REPORT_VIEWS.map((view) => {
            const Icon = view.icon
            return (
              <button key={view.id} type="button" className={activeView === view.id ? 'active' : ''} onClick={() => setActiveView(view.id)}>
                <Icon size={17} />
                <span><strong>{view.label}</strong><small>{view.description}</small></span>
              </button>
            )
          })}
        </aside>

        <main className="reports-main">
          <div className="reports-filters">
            <div className="reports-branch-label"><Store size={16} /><strong>{activeBranch?.name || 'All permitted branches'}</strong></div>
            <div className="reports-period-control" role="group" aria-label="Sales report period">
              {PERIODS.map((item) => <button key={item.value} type="button" className={period === item.value ? 'active' : ''} aria-pressed={period === item.value} onClick={() => setPeriod(item.value)}>{item.label}</button>)}
            </div>
            <button className="reports-refresh" type="button" onClick={refresh} aria-label="Refresh reports"><RefreshCw size={16} /> Refresh</button>
          </div>

          <div className="reports-section-heading">
            <div><h2><SelectedIcon size={18} />{selected.label}</h2><p>{selected.description} · {activeBranch?.name || 'All permitted branches'} · {PERIODS.find((item) => item.value === period)?.label}</p></div>
          </div>

          {activeView === 'overview' || activeView === 'period' ? (
            <>
              <ApiDataView title="Sales report" state={sales} emptyMessage="No sales report was returned." />
              <section className="reports-dashboard-section">
                <div className="reports-section-heading"><div><h2><FileBarChart size={18} />Dashboard summary</h2><p>Live dashboard report data for the selected branch</p></div></div>
                <ApiDataView title="Dashboard report" state={dashboard} emptyMessage="No dashboard report was returned." />
              </section>
            </>
          ) : (
            <ApiDataView title={selected.label} state={sales} emptyMessage="No report data was returned." focus={focusByView[activeView]} />
          )}
          {branchesLoading && <p className="reports-branch-loading">Loading available branches…</p>}
        </main>
      </div>
    </div>
  )
}
