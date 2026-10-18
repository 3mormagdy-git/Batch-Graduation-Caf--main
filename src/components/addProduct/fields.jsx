// Small shared form pieces used by the three steps.

export const inputClass = (hasError) =>
  `h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-ink outline-none transition placeholder:text-[#b5aaa4] focus:border-primary focus:ring-2 focus:ring-primary/15 ${
    hasError ? 'border-danger' : 'border-line'
  }`;

// Label + control + hint + error message. `id` links the label to the input.
export function Field({ id, label, required, hint, error, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
        {required && <span aria-hidden="true" className="text-primary"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[12px] font-medium text-danger">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>
      )}
    </div>
  );
}

// Card title + subtitle used at the top of every step.
export function CardHeader({ id, title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 id={id} className="text-[15px] font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-[12px] text-muted">{subtitle}</p>}
    </div>
  );
}

// On/off switch (green when on), used in the Branch availability step.
export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-success/40 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-success' : 'bg-[#d9d0c7]'
      }`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  );
}
