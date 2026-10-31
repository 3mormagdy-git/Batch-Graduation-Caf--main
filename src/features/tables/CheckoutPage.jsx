import { Fragment } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Utensils } from 'lucide-react'
import { BRANCH_NAME, ORDERS, formatMoney, priceOrder, tableLabel } from './tablesData.js'
import { BackLink, PageContainer, PageTitle, cardClass, outlineButton, primaryButton } from './shared.jsx'

const STEPS = ['Review total', 'Payment method', 'Confirm', 'Done']

// Checkout step 1 ("Review total"). The reference only shows this step, so the
// "Choose payment method" button has no destination yet.
export default function CheckoutPage() {
  const { tableId } = useParams()
  const navigate = useNavigate()
  const order = ORDERS[tableLabel(tableId)]

  // Tables without an order have nothing to check out.
  if (!order) return <Navigate to={`/tables/${tableId}`} replace />

  const { subtotal, vat, service, total } = priceOrder(order)

  return (
    <PageContainer>
      <div className="mb-8">
        <BackLink to={`/tables/${tableId}`}>Order #{order.number}</BackLink>
        <PageTitle title="Checkout" subtitle={`${BRANCH_NAME} • Station #01`} />
      </div>

      <ol className="m-0 mb-6 flex list-none flex-wrap items-center gap-2 p-0 text-[13px] font-semibold">
        {STEPS.map((label, index) => (
          <Fragment key={label}>
            {index > 0 && <ChevronRight size={14} className="text-[color:var(--split)]" aria-hidden="true" />}
            <li
              aria-current={index === 0 ? 'step' : undefined}
              className={index === 0 ? 'rounded-md bg-accent px-2.5 py-1 text-white' : 'px-1 text-muted'}
            >
              {label}
            </li>
          </Fragment>
        ))}
      </ol>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className={`${cardClass} p-5`}>
          <h2 className="m-0 text-[15px] font-bold text-ink">Review the order</h2>
          <p className="m-0 mt-1 text-xs text-muted">Confirm items and totals with the guest before taking payment.</p>

          <div className="mt-5 rounded-xl border border-line">
            <div className="flex items-start justify-between border-b border-line p-5">
              <div>
                <h3 className="m-0 text-[15px] font-bold text-ink">Order #{order.number}</h3>
                <p className="m-0 mt-1 text-xs text-muted">{BRANCH_NAME}</p>
              </div>
              <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-primary-soft px-2.5 text-xs font-semibold text-accent">
                <Utensils size={13} aria-hidden="true" />Dine-in • {tableLabel(tableId)}
              </span>
            </div>
            <ul className="m-0 list-none p-0 px-5">
              {order.items.map((item) => (
                <li key={item.name} className="flex items-start justify-between border-b border-line py-3 text-[13px] last:border-b-0">
                  <div>
                    <div><span className="text-muted">{item.qty}×</span> <b className="text-ink">{item.name}</b></div>
                    <div className="text-xs text-muted">{item.variant}</div>
                  </div>
                  <span className="text-ink">{formatMoney(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line p-5">
              <dl className="m-0 flex flex-col gap-2.5 text-[13px] text-muted">
                {[['Subtotal', subtotal], ['VAT (14%)', vat], ['Service (12%)', service]].map(([label, value]) => (
                  <div key={label} className="flex justify-between"><dt>{label}</dt><dd className="m-0 text-ink">{formatMoney(value)} EGP</dd></div>
                ))}
              </dl>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-sm font-bold text-ink">Total</span>
                <span className="text-2xl font-bold text-accent">{formatMoney(total)} EGP</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="button" onClick={() => navigate(`/tables/${tableId}`)} className={outlineButton}>
              <ArrowLeft size={17} aria-hidden="true" />Back to order
            </button>
            {/* Payment method step is not in the reference yet: nothing happens on click. */}
            <button type="button" className={`${primaryButton} h-12 px-6 text-base`}>
              Choose payment method<ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 text-[15px] font-bold text-ink">Guest</h2>
            <p className="m-0 mt-4 text-sm font-bold text-ink">Walk-in guest</p>
            <p className="m-0 mt-0.5 text-xs text-muted">No phone on file</p>
          </section>
          <section className="rounded-2xl bg-accent p-5 text-white">
            <p className="m-0 text-xs text-white/70">Amount due</p>
            <p className="m-0 mt-1 text-[30px] font-bold leading-9">{formatMoney(total)} EGP</p>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
