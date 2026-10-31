import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck } from 'lucide-react'
import atSignIcon from '@/assets/auth/at-sign.svg'
import { requestPasswordReset } from '@/services/authService.js'
import AuthLayout from '@/features/auth/AuthLayout.jsx'
import { AuthField, AuthInput, FormError, SubmitButton } from '@/features/auth/fields.jsx'
import { validateEmail } from '@/features/auth/validation.js'

// Password reset request (POST /auth/forgot-password). The server answers the same way
// for every email, so the confirmation never reveals whether an account exists.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('') // server / network problems

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validateEmail(email)
    setError(next)
    setFormError('')
    if (next) return

    setSending(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (requestError) {
      setFormError(requestError.message)
    } finally {
      setSending(false)
    }
  }

  async function handleResend() {
    setResent(true)
    setFormError('')
    try {
      await requestPasswordReset(email)
    } catch (requestError) {
      setFormError(requestError.message)
      setResent(false)
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div role="status" className="flex flex-col gap-1.5">
          <span className="mb-2.5 grid h-12 w-12 place-items-center rounded-full bg-success-soft text-success">
            <MailCheck size={22} aria-hidden="true" />
          </span>
          <h1 className="text-[26px] leading-8 font-bold tracking-[-0.75px] text-[#292524] sm:text-[30px] sm:leading-9">
            Check your inbox
          </h1>
          <p className="max-w-[560px] text-[14px] leading-[21px] text-[#78716c]">
            If <strong className="font-semibold text-[#292524]">{email.trim()}</strong> belongs to a staff account, a
            reset link is on its way. It expires after 30 minutes. Nothing arrived? Check spam or ask your branch
            manager to reset it.
          </p>
          {formError && (
            <div className="mt-3">
              <FormError message={formError} />
            </div>
          )}
          <button
            type="button"
            disabled={resent}
            onClick={handleResend}
            className="mt-[18px] inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-4 text-[16px] leading-6 font-semibold text-ink transition hover:bg-[#f8f3ed] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {resent ? 'Link resent' : 'Resend link'}
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] leading-8 font-bold tracking-[-0.75px] text-[#292524] sm:text-[30px] sm:leading-9">
              Reset your password
            </h1>
            <p className="max-w-[560px] text-[14px] leading-[21px] text-[#78716c]">
              We’ll email you a secure link to set a new password. Links expire after 30 minutes.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <FormError message={formError} />
            <AuthField id="reset-email" label="Work email" error={error}>
              <AuthInput
                id="reset-email"
                type="email"
                autoComplete="username"
                placeholder="sarah.m@nahjcafe.internal"
                icon={atSignIcon}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={error}
              />
            </AuthField>
            <SubmitButton busy={sending}>{sending ? 'Sending…' : 'Send reset link'}</SubmitButton>
          </form>
        </>
      )}

      <Link
        to="/signin"
        className="mt-6 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
      </Link>
    </AuthLayout>
  )
}
