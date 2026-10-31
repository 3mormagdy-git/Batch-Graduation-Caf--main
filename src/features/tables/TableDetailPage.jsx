import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftRight, Combine, CreditCard, DoorClosed, Plus } from 'lucide-react'
import {
  BRANCH_NAME, ORDERS, TABLES, formatDuration, formatMoney, priceOrder, tableLabel,
} from './tablesData.js'
import { BackLink, PageContainer, PageTitle, StatusPill, cardClass, outlineButton, primaryButton } from './shared.jsx'
import { extractTable, tablesApi } from './tablesApi.js'

// Table detail: current order + bill. Only T-01 has order data in the reference,
// other tables show an empty order card (no mock data was invented for them).
export default function TableDetailPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const [table, setTable] = useState(() => TABLES.find((item) => item.id === tableLabel(tableId)) || null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tableLoading, setTableLoading] = useState(true)
  const order = ORDERS[tableLabel(tableId)]

  useEffect(() => {
    let active = true
    tablesApi.get(tableId).then((payload) => {
      const result = extractTable(payload)
      if (!result || typeof result !== 'object') throw new Error('The table response could not be read.')
      const rawId = result.id ?? result._id ?? result.tableId ?? tableId
      const fallback = TABLES.find((item) => item.id === tableLabel(tableId)) || {}
      const statusValue = String(result.status ?? fallback.status ?? 'available').toLowerCase()
      const normalized = { ...fallback, ...result, id: String(rawId), zone: result.zone ?? result.section ?? fallback.zone, seats: Number(result.seats ?? result.capacity ?? fallback.seats ?? 0), guests: Number(result.guests ?? result.guestCount ?? fallback.guests ?? 0), bill: Number(result.bill ?? result.total ?? result.amount ?? fallback.bill ?? 0), seatedMinutes: Number(result.seatedMinutes ?? result.durationMinutes ?? fallback.seatedMinutes ?? 0), status: ['available','occupied','reserved','cleaning'].includes(statusValue) ? statusValue : fallback.status ?? 'available', reservedAt: result.reservedAt ?? result.reservation?.time ?? fallback.reservedAt }
      if (active) { setTable(normalized); setActionError('') }
    }).catch((error) => { if (active) setActionError(`${error.message}. Showing local sample details.`) }).finally(() => { if (active) setTableLoading(false) })
    return () => { active = false }
  }, [tableId])

  async function runAction(action) {
    setBusy(true); setActionError('')
    try { await action(); const payload = await tablesApi.get(tableId); const result = extractTable(payload); if (result && typeof result === 'object') setTable((current) => ({ ...current, ...result, id: String(result.id ?? result._id ?? result.tableId ?? tableId) })) }
    catch (error) { setActionError(error.message || 'The request failed.'); }
    finally { setBusy(false) }
  }

  const transferTable = () => { const toId = window.prompt('Enter destination table ID'); if (toId) runAction(() => tablesApi.transfer(table.id, toId.trim())) }
  const mergeTable = () => { const fromId = window.prompt('Enter table ID to merge into this table'); if (fromId) runAction(() => tablesApi.merge(table.id, fromId.trim())) }
  const changeStatus = () => { const status = window.prompt('Enter the new status (available, occupied, reserved, cleaning)', table.status); if (status) runAction(() => tablesApi.updateStatus(table.id, status.trim().toLowerCase())) }
  const reserveTable = () => { const name = window.prompt('Reservation name'); if (!name) return; const time = window.prompt('Reservation time (HH:mm)'); if (!time) return; const guestsText = window.prompt('Number of guests'); const guests = Number(guestsText); if (!Number.isInteger(guests) || guests < 1) { setActionError('Enter a valid positive guest count.'); return } runAction(() => tablesApi.reserve(table.id, { name: name.trim(), time: time.trim(), guests })) }
  const cancelReservation = () => { if (window.confirm('Cancel this table reservation?')) runAction(() => tablesApi.cancelReservation(table.id)) }

  if (!table && tableLoading) return <PageContainer><BackLink to="/tables">Table layout</BackLink><PageTitle title="Loading table…" subtitle="Fetching table details" /></PageContainer>

  if (!table) {
    return (
      <PageContainer>
        <BackLink to="/tables">Table layout</BackLink>
        <PageTitle title="Table not found" subtitle={`There is no table "${tableId}".`} />
      </PageContainer>
    )
  }

  const totals = order && priceOrder(order)

  return (
    <PageContainer>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <BackLink to="/tables">Table layout</BackLink>
          <h1 className="m-0 text-[22px] font-bold leading-7 text-ink">Table {tableLabel(table.id)}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <StatusPill status={table.status} />
            <span>{BRANCH_NAME} • {table.zone} • seats {table.seats}</span>
          </div>
        </div>
          <div className="flex flex-wrap gap-2.5">
          <button type="button" disabled={busy} onClick={transferTable} className={outlineButton}><ArrowLeftRight size={17} aria-hidden="true" />Transfer</button>
          <button type="button" disabled={busy} onClick={mergeTable} className={outlineButton}><Combine size={17} aria-hidden="true" />Merge</button>
          <button type="button" disabled={busy} onClick={changeStatus} className={outlineButton}><DoorClosed size={17} aria-hidden="true" />Change status</button>
          {table.status === 'reserved' ? <button type="button" disabled={busy} onClick={cancelReservation} className={outlineButton}>Cancel reservation</button> : <button type="button" disabled={busy} onClick={reserveTable} className={outlineButton}>Reserve</button>}
        </div>
      </div>

      {actionError && <p role="alert" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-[#805516]">{actionError}</p>}
      {busy && <p className="mb-3 text-xs text-muted">Updating table…</p>}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className={`${cardClass} min-h-[366px] p-5`}>
          {order ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 text-[15px] font-bold text-ink">Current order #{order.number}</h2>
                  <p className="m-0 mt-1 text-xs text-muted">Opened {order.openedAt} by {order.openedBy}</p>
                </div>
                <StatusPill status="served" label={order.status} className="h-7" />
              </div>
              <ul className="m-0 mt-4 list-none p-0">
                {order.items.map((item) => (
                  <li key={item.name} className="flex items-start justify-between border-b border-line py-3.5 text-[13px] last:border-b-0">
                    <div>
                      <div><span className="text-muted">{item.qty}×</span> <b className="text-ink">{item.name}</b></div>
                      <div className="mt-0.5 text-xs text-muted">{item.variant}</div>
                    </div>
                    <span className="text-ink">{formatMoney(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-4">
                <button type="button" className={outlineButton}><Plus size={17} aria-hidden="true" />Add items</button>
                <button type="button" className="text-sm font-medium text-muted hover:text-ink">Order details</button>
              </div>
            </>
          ) : (
            <p className="m-0 text-[13px] text-muted">No order details for this table yet.</p>
          )}
        </section>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className={`${cardClass} p-4`}>
              <p className="m-0 text-xs text-muted">Seated</p>
              <p className="m-0 mt-1 text-xl font-bold text-ink">{table.status === 'occupied' ? formatDuration(table.seatedMinutes) : '—'}</p>
            </div>
            <div className={`${cardClass} p-4`}>
              <p className="m-0 text-xs text-muted">Guests</p>
              <p className="m-0 mt-1 text-xl font-bold text-ink">{table.status === 'occupied' ? `${table.guests} / ${table.seats}` : '—'}</p>
            </div>
          </div>

          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 text-[15px] font-bold text-ink">Bill</h2>
            {totals ? (
              <>
                <dl className="m-0 mt-4 flex flex-col gap-2.5 text-[13px] text-muted">
                  {[['Subtotal', totals.subtotal], ['VAT (14%)', totals.vat], ['Service (12%)', totals.service]].map(([label, value]) => (
                    <div key={label} className="flex justify-between"><dt>{label}</dt><dd className="m-0 text-ink">{formatMoney(value)} EGP</dd></div>
                  ))}
                </dl>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-sm font-bold text-ink">Total</span>
                  <span className="text-2xl font-bold text-accent">{formatMoney(totals.total)} EGP</span>
                </div>
                <button type="button" onClick={() => navigate(`/tables/${table.id}/checkout`)} className={`${primaryButton} mt-5 h-12 w-full text-base`}>
                  <CreditCard size={20} aria-hidden="true" />View bill &amp; pay
                </button>
              </>
            ) : (
              <p className="m-0 mt-3 text-[13px] text-muted">Nothing to pay on this table.</p>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
