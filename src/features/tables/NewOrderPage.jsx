import { useState } from 'react'
import { Bike, Check, Minus, Plus, ShoppingBag, Users, Utensils } from 'lucide-react'
import { BRANCH_NAME, ORDER_TYPES, TABLES, ZONES, countByStatus } from './tablesData.js'
import { BackLink, PageContainer, PageTitle, cardClass, primaryButton } from './shared.jsx'

const TYPE_ICON = { 'dine-in': Utensils, takeaway: ShoppingBag, delivery: Bike }
const STEPS = ['Order type', 'Details', 'Products', 'Checkout']
const CURRENT_STEP = 1 // this page is step 2 ("Details")

function Stepper() {
  return (
    <ol className="m-0 mb-6 flex list-none flex-wrap items-center gap-3 p-0 text-[13px]">
      {STEPS.map((label, index) => {
        const done = index < CURRENT_STEP
        const active = index === CURRENT_STEP
        return (
          <li key={label} className="flex items-center gap-3">
            {index > 0 && <span className="h-px w-8 bg-line" aria-hidden="true" />}
            <span className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                done ? 'bg-success text-white' : active ? 'bg-accent text-white' : 'bg-sand text-muted'
              }`}>
                {done ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : index + 1}
              </span>
              <span className={active ? 'font-semibold text-ink' : 'text-muted'}>{label}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function OrderTypeCard({ type, selected, onSelect, note }) {
  const Icon = TYPE_ICON[type.id]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex min-h-[176px] flex-col items-start rounded-xl border p-[17px] text-left transition-colors ${
        selected ? 'border-[1.5px] border-accent bg-primary-soft' : 'border-line bg-card hover:bg-page'
      }`}
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${selected ? 'bg-accent text-white' : 'bg-sand text-accent'}`}>
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="mt-3 text-[15px] font-bold text-ink">{type.label}</span>
      <span className="mt-1 text-[13px] leading-[17px] text-muted">{type.description}</span>
      <span className="mt-auto pt-3 text-xs font-semibold text-accent">{note}</span>
    </button>
  )
}

// One table in the "Select an available table" grid. Only free tables can be picked.
function TablePick({ table, selected, onSelect }) {
  const free = table.status === 'available'
  return (
    <button
      type="button"
      disabled={!free}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex h-[76px] w-[118px] flex-col justify-between rounded-xl border p-3 text-left ${
        selected ? 'border-[1.5px] border-accent bg-primary-soft'
          : free ? 'border-line bg-card hover:border-accent' : 'cursor-not-allowed border-line bg-page'
      }`}
    >
      <span className={`text-[15px] font-bold leading-none ${free ? 'text-ink' : 'text-muted'}`}>{table.id}</span>
      <span className="flex items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1"><Users size={12} aria-hidden="true" />{table.seats}</span>
        <span className={free ? 'font-medium text-success' : ''}>{free ? 'Free' : table.status[0].toUpperCase() + table.status.slice(1)}</span>
      </span>
    </button>
  )
}

export default function NewOrderPage() {
  const [orderType, setOrderType] = useState('dine-in')
  const [tableId, setTableId] = useState(null)
  const [guests, setGuests] = useState(2)

  const free = countByStatus('available')
  const typeLabel = ORDER_TYPES.find((type) => type.id === orderType).label

  return (
    <PageContainer>
      <div className="mb-8">
        <BackLink to="/">Dashboard</BackLink>
        <PageTitle title="New order" subtitle="Set up the order before adding products." />
      </div>
      <Stepper />

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Order type</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {ORDER_TYPES.map((type) => (
                <OrderTypeCard
                  key={type.id}
                  type={type}
                  selected={orderType === type.id}
                  note={type.note || `${free} tables free • 12% service`}
                  onSelect={() => setOrderType(type.id)}
                />
              ))}
            </div>
          </section>

          {/* Table selection only makes sense for dine-in orders */}
          {orderType === 'dine-in' && (
            <section className={`${cardClass} p-5`}>
              <h2 className="m-0 text-[15px] font-bold text-ink">Select an available table</h2>
              <p className="m-0 mt-1 text-xs text-muted">{free} of {TABLES.length} tables free at {BRANCH_NAME}</p>
              {ZONES.map((zone) => (
                <div key={zone} className="mt-5">
                  <h3 className="m-0 mb-2.5 text-xs font-medium text-muted">{zone}</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {TABLES.filter((table) => table.zone === zone).map((table) => (
                      <TablePick key={table.id} table={table} selected={tableId === table.id} onSelect={() => setTableId(table.id)} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-6 flex items-center gap-4 border-t border-line pt-5">
                <span className="text-[13px] font-medium text-ink">Guests</span>
                <div className="flex h-10 items-center rounded-lg border border-line">
                  <button type="button" aria-label="Fewer guests" disabled={guests <= 1} onClick={() => setGuests((n) => n - 1)} className="flex h-10 w-10 items-center justify-center text-ink disabled:opacity-40"><Minus size={16} /></button>
                  <span className="w-10 text-center text-[15px] font-semibold text-ink" aria-live="polite">{guests}</span>
                  <button type="button" aria-label="More guests" onClick={() => setGuests((n) => n + 1)} className="flex h-10 w-10 items-center justify-center text-ink"><Plus size={16} /></button>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className={`${cardClass} p-5`} aria-label="Order setup">
          <h2 className="m-0 text-[15px] font-bold text-ink">Order setup</h2>
          <dl className="m-0 mt-4 flex flex-col gap-3 text-[13px]">
            {[['Branch', BRANCH_NAME], ['Type', typeLabel], ['Table', tableId || '—'], ['Guests', guests]].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-muted">{label}</dt>
                <dd className="m-0 font-bold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {/* The Products step is not part of the supplied reference yet, so this button has no
              destination. Connect it to the Products page when it exists. */}
          <button type="button" className={`${primaryButton} mt-5 h-12 w-full text-base`}>Continue to products</button>
          <p className="m-0 mt-3 text-center text-xs text-muted">Order type and table stay pinned in the cart.</p>
        </aside>
      </div>
    </PageContainer>
  )
}
