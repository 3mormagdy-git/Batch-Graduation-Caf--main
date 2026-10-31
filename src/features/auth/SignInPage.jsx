import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import arrowRightIcon from '@/assets/auth/arrow-right.svg'
import atSignIcon from '@/assets/auth/at-sign.svg'
import monitorIcon from '@/assets/auth/monitor.svg'
import { useAuth } from '@/context/AuthContext.jsx'
import AuthLayout from '@/features/auth/AuthLayout.jsx'
import {
  AuthCheckbox,
  AuthField,
  AuthInput,
  FormError,
  FormNotice,
  PasswordInput,
  SubmitButton,
} from '@/features/auth/fields.jsx'
import { validateSignIn } from '@/features/auth/validation.js'

export default function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  // When the route guard sent the user here, go back to the page they wanted after signing in.
  const from = state?.from ?? '/'
  // After sign-up: the server's "waiting for approval" message, and the new email pre-filled.
  const notice = state?.notice
  const [email, setEmail] = useState(state?.email ?? '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validateSignIn({ email, password })
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    try {
      await signIn(email, password, remember)
      navigate(from, { replace: true })
    } catch (error) {
      setErrors({ form: error.message || 'Something went wrong. Try again.' })
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[26px] leading-8 font-bold tracking-[-0.75px] text-[#292524] sm:text-[30px] sm:leading-9">
          Welcome Back
        </h1>
        <p className="max-w-[560px] text-[14px] leading-[21px] text-[#78716c]">
          Sign in with your staff or manager credentials to open register and access the dashboard.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {notice && !errors.form && <FormNotice message={notice} />}
        <FormError message={errors.form} />

        <AuthField id="email" label="Email address" error={errors.email}>
          <AuthInput
            id="email"
            type="email"
            autoComplete="username"
            placeholder="sarah.m@nahjcafe.internal"
            icon={atSignIcon}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        </AuthField>

        <div className="flex flex-col gap-3">
          <AuthField
            id="password"
            label="Password"
            error={errors.password}
            aside={
              <Link to="/forgot-password" className="text-[12px] leading-4 font-medium text-primary hover:underline">
                Forgot Password?
              </Link>
            }
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errors.password}
            />
          </AuthField>

          <div className="flex items-center justify-between gap-3 pt-1 pb-2">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] leading-[21px] font-medium text-[#616161]">
              <AuthCheckbox checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              Remember Me
            </label>
            <span className="inline-flex items-center gap-1 text-[12px] leading-4 text-[#78716c]">
              <img src={monitorIcon} alt="" width={14} height={14} />
              Station: POS-01
            </span>
          </div>
        </div>

        <SubmitButton busy={submitting} icon={arrowRightIcon}>
          {submitting ? 'Signing in…' : 'Get Started'}
        </SubmitButton>

        <p className="text-center text-[14px] leading-5 text-[#57534e]">
          New to this terminal?
          <Link to="/signup" className="ml-1 font-bold text-primary underline">
            Create Staff Account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
