import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import arrowRightIcon from '@/assets/auth/arrow-right.svg'
import atSignIcon from '@/assets/auth/at-sign-filled.svg'
import coffeeIcon from '@/assets/auth/coffee.svg'
import laptopIcon from '@/assets/auth/laptop.svg'
import userCircleIcon from '@/assets/auth/user-circle.svg'
import userIcon from '@/assets/auth/user.svg'
import { useAuth } from '@/context/AuthContext.jsx'
import AuthLayout from '@/features/auth/AuthLayout.jsx'
import { AuthCheckbox, AuthField, AuthInput, FormError, PasswordInput, SubmitButton } from '@/features/auth/fields.jsx'
import { getPasswordStrength, validateSignUp } from '@/features/auth/validation.js'

const ROLE_OPTIONS = [
  { id: 'barista', label: 'Barista/ Espresso', icon: coffeeIcon },
  { id: 'cashier', label: 'Cashier / Front POS', icon: laptopIcon },
  { id: 'manager', label: 'Branch Manager', icon: userCircleIcon },
]

export default function SignUpPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('manager')
  const [password, setPassword] = useState('')
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const strength = password ? getPasswordStrength(password) : null

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validateSignUp({ fullName, email, password, acceptedPolicy })
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      const message = await register({ fullName, email, password, role })
      // The new account must be approved by a manager before it can sign in,
      // so go to Sign In and show the server's message there.
      navigate('/signin', { replace: true, state: { notice: message, email: email.trim().toLowerCase() } })
    } catch (error) {
      setErrors({ form: error.message || 'Something went wrong. Try again.' })
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout compact>
      <div className="flex flex-col gap-1 pt-1">
        <h1 className="text-[24px] leading-8 font-bold tracking-[-0.6px] text-[#292524]">Create Staff Account</h1>
        <p className="max-w-[560px] text-[14px] leading-[21px] text-[#78716c]">
          Register an employee or branch manager profile to open register and access terminals.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <FormError message={errors.form} />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <AuthField id="fullName" label="Full legal name" required error={errors.fullName}>
            <AuthInput
              id="fullName"
              compact
              autoComplete="name"
              placeholder="Kareem Nour"
              icon={userIcon}
              iconSize={12}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={errors.fullName}
              aria-required="true"
            />
          </AuthField>
          <AuthField id="workEmail" label="Work email address" required error={errors.email}>
            <AuthInput
              id="workEmail"
              compact
              type="email"
              autoComplete="email"
              placeholder="kareem.n@nahjcafe.internal"
              icon={atSignIcon}
              iconSize={15}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errors.email}
              aria-required="true"
            />
          </AuthField>
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
          <legend className="mb-1.5 p-0 text-[12px] leading-4 font-semibold tracking-[0.6px] text-[#292524] uppercase">
            Operational role <span className="text-primary">*</span>
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {ROLE_OPTIONS.map((option) => {
              const selected = role === option.id
              return (
                <label
                  key={option.id}
                  className={`flex min-h-[69px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg text-center text-[12px] leading-[15px] font-semibold transition-colors focus-within:shadow-[0_0_0_3px_rgb(120_38_61/25%)] hover:border-primary ${
                    selected
                      ? 'border-2 border-primary bg-[#f6f2f3] p-3 text-primary'
                      : 'border border-[#e7e0dc] bg-[#fafaf9]/40 p-[13px] text-[#292524]'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.id}
                    checked={selected}
                    onChange={() => setRole(option.id)}
                    className="sr-only"
                  />
                  <img src={option.icon} alt="" width={20} height={20} />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <AuthField
          id="accessPin"
          label="Access PIN /Password"
          required
          error={errors.password}
          aside={
            strength && (
              <span
                aria-live="polite"
                className="rounded px-2 py-0.5 text-[11px] leading-[16.5px] font-medium text-primary bg-[rgba(122,38,58,0.1)]"
              >
                {strength} Strength
              </span>
            )
          }
        >
          <PasswordInput
            id="accessPin"
            compact
            autoComplete="new-password"
            placeholder="Min 8 alphanumeric"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            aria-required="true"
          />
        </AuthField>

        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-start gap-2.5 pt-0.5 text-[12px] leading-[16.5px] text-[#57534e]">
            <AuthCheckbox
              size={16}
              className="mt-px"
              checked={acceptedPolicy}
              onChange={(event) => setAcceptedPolicy(event.target.checked)}
              invalid={Boolean(errors.policy)}
              aria-describedby={errors.policy ? 'policy-error' : undefined}
            />
            <span>
              I agree to the <strong className="font-semibold text-[#292524] underline">NAHJ Staff Operating Policy</strong>,
              terminal audit monitoring, and safe cash handling procedures.
            </span>
          </label>
          {errors.policy && (
            <p id="policy-error" role="alert" className="text-[12px] leading-4 font-medium text-[#c23b3b]">
              {errors.policy}
            </p>
          )}
        </div>

        <SubmitButton busy={submitting} icon={arrowRightIcon}>
          {submitting ? 'Creating account…' : 'Register Staff Account'}
        </SubmitButton>

        <p className="text-center text-[14px] leading-5 text-[#57534e]">
          Already verified on this terminal?
          <Link to="/signin" className="ml-1 font-bold text-primary underline">
            Sign In
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
