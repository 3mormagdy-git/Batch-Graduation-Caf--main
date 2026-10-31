import { inputClass } from '@/features/staff/ui.jsx'

export const labelClass = 'mb-1.5 block text-[13px] font-semibold text-ink'
export const errorInput = 'border-danger focus:border-danger'

export function Field({ label, required, error, hint, htmlFor, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>{label}{required && ' *'}</label>
      {children}
      {error ? <p role="alert" className="m-0 mt-1 text-xs text-danger">{error}</p>
        : hint && <p className="m-0 mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function TextField({ id, label, required, error, hint, className, value, onChange, ...rest }) {
  return (
    <Field label={label} required={required} error={error} hint={hint} htmlFor={id} className={className}>
      <input id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)}
        className={`${inputClass} ${error ? errorInput : ''}`} {...rest} />
    </Field>
  )
}
