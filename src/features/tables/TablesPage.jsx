import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Plus, Users } from 'lucide-react'
import {
  BRANCH_NAME, OPEN_BILLS_TOTAL, RESERVATIONS, STATUS_LABEL, TABLES,
  countByStatus, formatDuration, formatMoney,
} from './tablesData.js'
import { PageContainer, PageTitle, StatusPill, cardClass, primaryButton } from './shared.jsx'

const FILTERS = ['all', 'available', 'occupied', 'reserved', 'cleaning']
const DOT = { available: 'bg-success', occupied: 'bg-accent', reserved: 'bg-amber', cleaning: 'bg-muted' }
const occupiedTables = TABLES.filter((table) => table.status === 'occupied')

// Filter pills: "All 12", "available 3", ...
function FilterChips({ filter, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tables by status">
      {FILTERS.map((name) => {
        const active = filter === name
        const count = name === 'all' ? TABLES.length : countByStatus(name)
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
                <Link to={`/tables/${table.id}`} onClick={(event) => event.stopPropagation()} className="hover:underline">{table.id}</Link>
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
      aria-label={`${table.id}, ${STATUS_LABEL[table.status]}`}
      className={`flex flex-col items-center justify-center gap-1 border-[1.5px] transition-shadow hover:shadow-md ${size} ${TILE[table.status]}`}
      // grid placement comes from the table data
      style={{ gridColumn: table.floor.col, gridRow: table.floor.row }}
    >
      <span className="text-[15px] font-bold leading-none">{table.id}</span>
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

function SideCards() {
  const seatedLongest = [...occupiedTables].sort((a, b) => b.seatedMinutes - a.seatedMinutes).slice(0, 3)
  const guestsSeated = occupiedTables.reduce((sum, table) => sum + table.guests, 0)
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-accent p-[20px] text-white">
        <p className="m-0 text-xs text-white/70">Open bills on floor</p>
        <p className="m-0 mt-1 text-[26px] font-bold leading-8">{formatMoney(OPEN_BILLS_TOTAL)} EGP</p>
        <p className="m-0 mt-2 text-xs text-white/70">{occupiedTables.length} tables • {guestsSeated} guests seated</p>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="m-0 text-[15px] font-bold text-ink">Seated longest</h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0 text-[13px]">
          {seatedLongest.map((table) => (
            <li key={table.id} className="flex items-center justify-between">
              <span><b className="text-ink">{table.id}</b> <span className="text-muted">• {table.guests} guests</span></span>
              <b className="text-[#9a6412]">{formatDuration(table.seatedMinutes)}</b>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="m-0 text-[15px] font-bold text-ink">Upcoming reservations</h2>
        <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
          {RESERVATIONS.map((item) => (
            <li key={item.name} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fbf1e0] text-[#9a6412]">
                <CalendarClock size={19} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{item.name}</div>
                <div className="text-xs text-muted">{item.tableId} • {item.guests} guests</div>
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

  // The filter hides tables that do not match; floor tiles keep their grid cell.
  const visible = filter === 'all' ? TABLES : TABLES.filter((table) => table.status === filter)
  const openTable = (id) => navigate(`/tables/${id}`)

  return (
    <PageContainer>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Table layout"
          subtitle={`${BRANCH_NAME} • ${countByStatus('occupied')} occupied, ${countByStatus('available')} free`}
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

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${cardClass} p-4 pb-5`}>
          <FilterChips filter={filter} onChange={setFilter} />
          {view === 'list'
            ? <TableList tables={visible} onOpen={openTable} />
            : <FloorPlan tables={visible} onOpen={openTable} />}
        </section>
        <SideCards />
      </div>
    </PageContainer>
  )
}
