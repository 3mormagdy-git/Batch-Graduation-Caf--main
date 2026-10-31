import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Plus, Users } from 'lucide-react'
import {
  BRANCH_ID, BRANCH_NAME, BRANCH_TABLE_PREFIX, RESERVATIONS, STATUS_LABEL, TABLES,
  formatDuration, formatMoney, tableLabel,
} from './tablesData.js'
import { PageContainer, PageTitle, StatusPill, cardClass, primaryButton } from './shared.jsx'
import { extractTables, tablesApi } from './tablesApi.js'

const FILTERS = ['all', 'available', 'occupied', 'reserved', 'cleaning']
const DOT = { available: 'bg-success', occupied: 'bg-accent', reserved: 'bg-amber', cleaning: 'bg-muted' }

// The API returns the tables of every branch ("cdt-t01", "ncr-t01", ...). This page shows one branch.
function belongsToBranch(raw) {
  const branch = raw?.branchId ?? raw?.branch_id ?? (typeof raw?.branch === 'string' ? raw.branch : raw?.branch?.id)
  if (branch != null && branch !== '') return String(branch) === BRANCH_ID
  const id = String(raw?.id ?? raw?._id ?? raw?.tableId ?? raw?.code ?? '').toLowerCase()
  return /^[a-z]+-t\d+$/.test(id) ? id.startsWith(BRANCH_TABLE_PREFIX) : true
}

function normalizeApiTable(raw, index) {
  const rawId = raw?.id ?? raw?._id ?? raw?.tableId ?? raw?.code
  const label = tableLabel(rawId)
  // sample table with the same number (T-09 ...) only supplies the floor-plan position
  const fallback = TABLES.find((item) => item.id === label) || TABLES[index]
  const rawStatus = String(raw?.status ?? fallback?.status ?? 'available').toLowerCase()
  const status = ['available', 'occupied', 'reserved', 'cleaning'].includes(rawStatus) ? rawStatus : (fallback?.status || 'available')
  const seats = Number(raw?.seats ?? raw?.capacity ?? fallback?.seats ?? 0)
  const ownFloor = raw?.floor && typeof raw.floor === 'object' && raw.floor.col && raw.floor.row ? raw.floor : null
  return {
    ...(fallback || {}), ...raw,
    id: rawId == null ? fallback?.id : String(rawId), // real id: used for the URL and API calls
    label, // what is shown: T-09
    zone: raw?.zone ?? raw?.section ?? fallback?.zone ?? '—',
    seats,
    guests: Number(raw?.guests ?? raw?.guestCount ?? fallback?.guests ?? 0),
    status,
    bill: Number(raw?.bill ?? raw?.total ?? raw?.amount ?? fallback?.bill ?? 0),
    floor: ownFloor ?? fallback?.floor ?? { col: (index % 4) + 1, row: Math.floor(index / 4) + 1 },
    shape: seats > 0 && seats <= 2 ? 'circle' : undefined, // 2-seat tables are round, like the reference
    wide: seats >= 6, // 6+ seats are wider
    seatedMinutes: Number(raw?.seatedMinutes ?? raw?.durationMinutes ?? fallback?.seatedMinutes ?? 0),
    reservedAt: raw?.reservedAt ?? raw?.reservation?.time ?? fallback?.reservedAt,
  }
}

// Filter pills: "All 12", "available 3", ...
function FilterChips({ filter, onChange, tables }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tables by status">
      {FILTERS.map((name) => {
        const active = filter === name
        const count = name === 'all' ? tables.length : tables.filter((table) => table.status === name).length
        return (
          <button
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(name)}
            className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold ${
              active ? 'border-[#30242a] bg-[#30242a] text-white' : 'border-line bg-card text-ink hover:bg-page'
            }`}
          >
            {name !== 'all' && <span className={`h-2 w-2 rounded-full ${DOT[name]}`} />}
            {name}
            <span className={`font-medium ${active ? 'text-white/70' : 'text-muted'}`}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}

function TableList({ tables, onOpen }) {
  return (
    <div className="mt-[18px] overflow-x-auto">
      <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-[13px]">
        <thead>
          <tr className="h-[30px] border-b border-line text-[11px] font-medium text-muted">
            <th className="w-[107px] pl-3 font-medium">Table</th>
            <th className="w-[129px] font-medium">Zone</th>
            <th className="w-[96px] font-medium">Seats</th>
            <th className="w-[164px] font-medium">Status</th>
            <th className="font-medium">Time</th>
            <th className="w-[140px] pr-[15px] text-right font-medium">Bill</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table.id} onClick={() => onOpen(table.id)} className="h-[49px] cursor-pointer border-b border-line last:border-b-0 hover:bg-page">
              <td className="pl-3 font-bold text-ink">
                <Link to={`/tables/${table.id}`} onClick={(event) => event.stopPropagation()} className="hover:underline">{table.label ?? tableLabel(table.id)}</Link>
              </td>
              <td className="text-muted">{table.zone}</td>
              <td className="text-muted">{table.status === 'occupied' ? `${table.guests} / ${table.seats}` : table.seats}</td>
              <td><StatusPill status={table.status} /></td>
              <td className="text-muted">
                {table.status === 'occupied' && formatDuration(table.seatedMinutes)}
                {table.status === 'reserved' && `at ${table.reservedAt}`}
                {(table.status === 'available' || table.status === 'cleaning') && '—'}
              </td>
              <td className="pr-[15px] text-right font-semibold text-ink">
                {table.status === 'occupied' ? `${formatMoney(table.bill)} EGP` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Floor-plan tile styles per status (size comes from the table's shape).
const TILE = {
  occupied: 'border-accent bg-accent text-white',
  reserved: 'border-amber bg-[#fbf1e0] text-ink',
  available: 'border-success/50 bg-card text-ink',
  cleaning: 'border-[#cfc3bd] bg-sand text-muted',
}

function FloorTile({ table, onOpen }) {
  const size = table.shape === 'circle'
    ? 'h-[100px] w-[100px] rounded-full'
    : table.wide ? 'h-[96px] w-[150px] rounded-xl' : 'h-[100px] w-[112px] rounded-xl'
  return (
    <button
      type="button"
      onClick={() => onOpen(table.id)}
      aria-label={`${table.label ?? tableLabel(table.id)}, ${STATUS_LABEL[table.status]}`}
      className={`flex flex-col items-center justify-center gap-1 border-[1.5px] transition-shadow hover:shadow-md ${size} ${TILE[table.status]}`}
      // grid placement comes from the table data
      style={{ gridColumn: table.floor.col, gridRow: table.floor.row }}
    >
      <span className="text-[15px] font-bold leading-none">{table.label ?? tableLabel(table.id)}</span>
      <span className="flex items-center gap-1 text-[11px] opacity-80">
        <Users size={12} aria-hidden="true" />
        {table.status === 'occupied' ? `${table.guests}/${table.seats}` : table.seats}
      </span>
      {table.status === 'occupied' && (
        <span className="text-[11px] font-semibold">{formatDuration(table.seatedMinutes)} • {Math.round(table.bill)}</span>
      )}
      {table.status === 'reserved' && <span className="text-[11px] font-semibold text-[#9a6412]">{table.reservedAt}</span>}
      {table.status === 'cleaning' && <span className="text-[11px]">Cleaning</span>}
    </button>
  )
}

function FloorPlan({ tables, onOpen }) {
  return (
    <div className="mt-[18px] overflow-x-auto rounded-xl border border-line bg-sand-light">
      <div className="min-w-[640px] px-4 pt-3.5">
        <p className="m-0 text-[11px] text-muted">Window • Main Hall • Terrace</p>
        {/* 4 columns x 3 rows; tiles are centred in their cell like the reference */}
        <div className="grid grid-cols-4 place-items-center pt-[28px]" style={{ gridAutoRows: '155px' }}>
          {tables.map((table) => <FloorTile key={table.id} table={table} onOpen={onOpen} />)}
        </div>
      </div>
    </div>
  )
}

function SideCards({ tables, reservations }) {
  const occupied = tables.filter((table) => table.status === 'occupied')
  const seatedLongest = [...occupied].sort((a, b) => b.seatedMinutes - a.seatedMinutes).slice(0, 3)
  const guestsSeated = occupied.reduce((sum, table) => sum + table.guests, 0)
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-accent p-[20px] text-white">
        <p className="m-0 text-xs text-white/70">Open bills on floor</p>
        <p className="m-0 mt-1 text-[26px] font-bold leading-8">{formatMoney(occupied.reduce((sum, table) => sum + (Number(table.bill) || 0), 0))} EGP</p>
        <p className="m-0 mt-2 text-xs text-white/70">{occupied.length} tables • {guestsSeated} guests seated</p>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="m-0 text-[15px] font-bold text-ink">Seated longest</h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0 text-[13px]">
          {seatedLongest.map((table) => (
            <li key={table.id} className="flex items-center justify-between">
              <span><b className="text-ink">{table.label ?? tableLabel(table.id)}</b> <span className="text-muted">• {table.guests} guests</span></span>
              <b className="text-[#9a6412]">{formatDuration(table.seatedMinutes)}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="m-0 text-[15px] font-bold text-ink">Upcoming reservations</h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          {(reservations.length ? reservations : RESERVATIONS).map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1e0] text-[#9a6412]">
                <CalendarClock size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{item.name}</div>
                <div className="text-xs text-muted">{tableLabel(item.tableId)} • {item.guests} guests</div>
              </div>
              <b className="text-[13px] text-ink">{item.time}</b>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function TablesPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('floor') // 'floor' | 'list'
  const [filter, setFilter] = useState('all')
  const [tables, setTables] = useState(TABLES)
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    tablesApi.list(BRANCH_ID).then((payload) => {
      const all = extractTables(payload)
      if (!all) throw new Error('The tables response did not contain a recognized list. Check the Swagger response schema.')
      const rows = all.filter(belongsToBranch)
      if (!rows.length) throw new Error(`The API returned no tables for ${BRANCH_NAME}`)
      if (active) { setTables(rows.map(normalizeApiTable)); setApiError('') }
    }).catch((error) => {
      if (active) setApiError(`${error.message}. Showing local sample data instead.`)
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const liveOccupied = useMemo(() => tables.filter((table) => table.status === 'occupied'), [tables])
  const liveReservations = useMemo(() => tables.filter((table) => table.status === 'reserved' && (table.reservedAt || table.reservation)), [tables])
  const liveOpenBills = liveOccupied.reduce((sum, table) => sum + (Number(table.bill) || 0), 0)
  const visible = filter === 'all' ? tables : tables.filter((table) => table.status === filter)
  const openTable = (id) => navigate(`/tables/${id}`)

  return (
    <PageContainer>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Table layout"
          subtitle={`${BRANCH_NAME} • ${tables.filter((table) => table.status === 'occupied').length} occupied, ${tables.filter((table) => table.status === 'available').length} free`}
        />
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-sand p-1" role="group" aria-label="Table view">
            {[['floor', 'Floor plan'], ['list', 'List']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                onClick={() => setView(id)}
                className={`h-8 rounded-lg px-3.5 text-[13px] font-medium ${view === id ? 'bg-card text-ink shadow-sm' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* "Seat guests" opens the New order flow (table selection) */}
          <button type="button" onClick={() => navigate('/tables/new-order')} className={`${primaryButton} h-10 px-5 text-sm`}>
            <Plus size={18} strokeWidth={2} aria-hidden="true" />Seat guests
          </button>
        </div>
      </div>

      {loading && <p className="mb-3 text-xs text-muted">Loading tables…</p>}
      {apiError && <p role="status" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-[#805516]">{apiError}</p>}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${cardClass} p-4 pb-5`}>
          <FilterChips filter={filter} onChange={setFilter} tables={tables} />
          {view === 'list'
            ? <TableList tables={visible} onOpen={openTable} />
            : <FloorPlan tables={visible} onOpen={openTable} />}
        </section>
        <SideCards tables={tables} reservations={tables.filter((table) => table.status === 'reserved').map((table) => ({ name: table.reservation?.name || table.name || table.id, tableId: table.id, guests: table.reservation?.guests || table.guests || table.seats, time: table.reservation?.time || table.reservedAt || '—' }))} />
      </div>
    </PageContainer>
  )
}
