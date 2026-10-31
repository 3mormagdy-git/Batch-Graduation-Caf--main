import Toggle from '@/components/ui/Toggle.jsx'
import { inputClass } from '@/features/staff/ui.jsx'
import { Field, TextField, errorInput } from './fields.jsx'

// Shared by the wizard's Settings step and the branch Settings tab. `values` are form strings.
export default function SettingsFields({ values, errors, onChange, idPrefix = 's' }) {
  const set = (key) => (value) => onChange({ ...values, [key]: value })
  const percent = (key, label, hint) => (
    <Field label={label} error={errors[key]} hint={hint} htmlFor={`${idPrefix}-${key}`}>
      <div className="relative">
        <input id={`${idPrefix}-${key}`} type="number" inputMode="decimal" min="0" max="100" step="any" value={values[key]} onChange={(e) => set(key)(e.target.value)}
          className={`${inputClass} pr-8 ${errors[key] ? errorInput : ''}`} aria-invalid={Boolean(errors[key])} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">%</span>
      </div>
    </Field>
  )
  const currency = values.currency.trim().toUpperCase() || 'EGP'
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField id={`${idPrefix}-currency`} label="Currency" value={values.currency} onChange={set('currency')} error={errors.currency}
          hint="Used on receipts and reports" maxLength={3} placeholder="EGP" />
        {percent('vat', 'VAT / tax')}
        {percent('serviceCharge', 'Service charge', 'Dine-in orders only')}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand-light px-4 py-3">
        <div>
          <div className="text-[13px] font-semibold text-ink">Accept delivery orders</div>
          <div className="text-xs text-muted">Shows the Delivery order type on this branch&apos;s POS.</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-[120px]">
            <div className="relative">
              <input type="number" inputMode="decimal" min="0" step="any" aria-label="Delivery fee" disabled={!values.acceptDelivery}
                value={values.acceptDelivery ? values.deliveryFee : ''} placeholder="0" onChange={(e) => set('deliveryFee')(e.target.value)}
                className={`${inputClass} pr-11 disabled:bg-sand disabled:opacity-60 ${errors.deliveryFee ? errorInput : ''}`} aria-invalid={Boolean(errors.deliveryFee)} />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{currency}</span>
            </div>
          </div>
          <Toggle checked={values.acceptDelivery} onChange={() => onChange({ ...values, acceptDelivery: !values.acceptDelivery })} label="Accept delivery orders" />
        </div>
        {errors.deliveryFee && <p role="alert" className="m-0 w-full text-xs text-danger">{errors.deliveryFee}</p>}
      </div>
      <Field label="Receipt footer" htmlFor={`${idPrefix}-footer`} error={errors.receiptFooter} className="mt-4"
        hint={`${values.receiptFooter.length}/80 — printed at the bottom of every receipt`}>
        <textarea id={`${idPrefix}-footer`} rows={3} value={values.receiptFooter} onChange={(e) => set('receiptFooter')(e.target.value)}
          className={`${inputClass} h-auto resize-none py-2 ${errors.receiptFooter ? errorInput : ''}`} />
      </Field>
    </>
  )
}
