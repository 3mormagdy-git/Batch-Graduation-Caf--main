// Form pieces shared by the Sign In and Sign Up pages.
import { useState } from 'react'
import eyeIcon from '@/assets/auth/eye.svg'
import lockIcon from '@/assets/auth/lock.svg'

// Uppercase label + control + error message. `aside` sits on the right of the label row.
export function AuthField({ id, label, required, error, aside, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-[12px] leading-4 font-semibold tracking-[0.6px] text-[#292524] uppercase">
          {label}
          {required && <span aria-hidden="true" className="text-primary"> *</span>}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[12px] leading-4 font-medium text-[#c23b3b]">
          {error}
        </p>
      )}
    </div>
  )
}

// Text input with an optional icon on the left and a control (e.g. the eye button) on the right.
// `compact` is the slightly smaller Sign Up style.
export function AuthInput({ id, icon, iconSize = 16, error, compact = false, trailing, className = '', ...rest }) {
  return (
    <div className="relative flex w-full items-center">
      {icon && (
        <img
          src={icon}
          alt=""
          width={iconSize}
          height={iconSize}
          className={`pointer-events-none absolute ${compact ? 'left-3' : 'left-3.5'}`}
        />
      )}
      <input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border text-[14px] leading-5 text-[#292524] outline-none transition placeholder:text-[#a8a29e] focus:border-primary focus:ring-[3px] focus:ring-primary/25 ${
          compact ? 'h-10 bg-[#fcf8f1]' : 'h-11 bg-[#faf4e8]/60'
        } ${icon ? (compact ? 'pl-[37px]' : 'pl-[41px]') : 'pl-[13px]'} ${trailing ? 'pr-[52px]' : 'pr-[13px]'} ${
          error ? 'border-[#c23b3b]' : 'border-[#e7e0dc]'
        } ${className}`}
        {...rest}
      />
      {trailing && <span className="absolute right-2.5 flex">{trailing}</span>}
    </div>
  )
}

// Password input with the lock icon and a show / hide (eye) button.
export function PasswordInput(props) {
  const [visible, setVisible] = useState(false)
  return (
    <AuthInput
      {...props}
      type={visible ? 'text' : 'password'}
      icon={lockIcon}
      iconSize={20}
      // the design shows masked passwords in a monospace font with wide letter spacing
      className={visible ? '' : "[&:not(:placeholder-shown)]:font-['Liberation_Mono',ui-monospace,'Cascadia_Mono',monospace] [&:not(:placeholder-shown)]:tracking-[0.7px]"}
      trailing={
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-md hover:bg-[#f5f5f4]"
        >
          <img src={eyeIcon} alt="" width={24} height={24} />
        </button>
      }
    />
  )
}

// Square checkbox drawn in the brand colour when checked. Pass `size` 20 (Remember Me) or 16 (policy).
export function AuthCheckbox({ size = 20, invalid = false, className = '', ...rest }) {
  return (
    <input
      type="checkbox"
      aria-invalid={invalid || undefined}
      style={{ width: size, height: size }}
      className={`m-0 grid shrink-0 cursor-pointer appearance-none place-content-center rounded border bg-white checked:border-primary checked:bg-primary after:h-1 after:w-2 after:translate-x-px after:-translate-y-px after:-rotate-45 after:border-b-2 after:border-l-2 after:border-white after:opacity-0 after:content-[''] checked:after:opacity-100 ${
        invalid ? 'border-[#c23b3b]' : size === 20 ? 'border-[#787878]' : 'border-[#e7e0dc]'
      } ${className}`}
      {...rest}
    />
  )
}

// Big brand-coloured submit button with an arrow on the right.
export function SubmitButton({ busy, icon, children }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 text-[16px] leading-6 font-semibold text-white transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {busy && (
        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}
      {children}
      {!busy && icon && <img src={icon} alt="" width={16} height={16} className="shrink-0" />}
    </button>
  )
}

// Green box above the form for good news (e.g. "Account created" after sign-up).
export function FormNotice({ message }) {
  if (!message) return null
  return (
    <p role="status" className="rounded-lg bg-success-soft px-3 py-2.5 text-[13px] leading-[19.5px] font-medium text-success">
      {message}
    </p>
  )
}

// Red box above the form for errors that are not tied to one field (e.g. wrong password).
export function FormError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg bg-[#f9e7e7] px-3 py-2.5 text-[13px] leading-[19.5px] font-medium text-[#c23b3b]">
      {message}
    </p>
  )
}
