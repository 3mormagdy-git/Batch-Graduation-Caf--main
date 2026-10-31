import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { BackLink, PageContainer, PageTitle, cardClass } from '@/features/tables/shared.jsx'
import { useStaff } from '@/features/staff/StaffContext.jsx'
import { btn, btnOutline, inputClass } from '@/features/staff/ui.jsx'
import { useBranches } from './BranchContext.jsx'
import { Field, TextField, errorInput } from './components/fields.jsx'
import SettingsFields from './components/SettingsFields.jsx'
import { NotFound } from './components/parts.jsx'
import { DEFAULT_SETTINGS } from './branchesData.js'
import { EMPTY_DETAILS, fromSettings, toDetails, toSettings, validateDetails, validateSettings } from './validation.js'

const STEPS = ['Branch details', 'Settings', 'Review & save']

function Stepper({ step, onGo }) {
  return (
    <ol className="m-0 mt-6 grid list-none grid-cols-1 gap-3 p-0 min-[560px]:grid-cols-3" aria-label="Progress">
      {STEPS.map((label, i) => {
        const done = i < step, current = i === step
        return (
          <li key={label}>
            <button type="button" disabled={!done} onClick={() => onGo(i)} aria-current={current ? 'step' : undefined}
              className={`flex h-10 w-full items-center gap-2 rounded-xl border px-3 text-[13px] font-semibold ${current ? 'border-accent bg-primary-soft text-accent' : done ? 'border-line bg-card text-success' : 'border-line bg-card text-muted'}`}>
              <span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] ${current ? 'bg-accent text-white' : done ? 'bg-success text-white' : 'bg-sand text-muted'}`}>
                {done ? <Check size={11} strokeWidth={3} aria-hidden="true" /> : i + 1}
              </span>{label}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function ReviewColumn({ title, rows }) {
  return (
    <div>
      <h3 className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <dl className="m-0 flex flex-col gap-2.5">
        {rows.map(([name, value]) => (
          <div key={name} className="flex justify-between gap-4 text-[13px]"><dt className="text-muted">{name}</dt><dd className="m-0 text-right font-semibold text-ink">{value || '—'}</dd></div>
        ))}
      </dl>
    </div>
  )
}

// One wizard for both /branches/new and /branches/:id/edit.
export default function BranchFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { branches, loading, getBranch, createBranch, updateBranch, notify } = useBranches()
  const { employees } = useStaff()
  const existing = editing ? getBranch(id) : null
  const [step, setStep] = useState(0)
  const [details, setDetails] = useState(null)
  const [settings, setSettings] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const lock = useRef(false)

  if (loading) return <PageContainer><p className="text-sm text-muted">Loading…</p></PageContainer>
  if (editing && !existing) return <PageContainer><NotFound /></PageContainer>

  // Form state is created once from the branch (edit) or defaults (add), then lives here across steps.
  const d = details ?? (existing
    ? { name: existing.name, code: existing.code, area: existing.area, phone: existing.phone, address: existing.address, manager: existing.manager, opens: existing.opens, closes: existing.closes }
    : EMPTY_DETAILS)
  const s = settings ?? fromSettings(existing ? existing.settings : DEFAULT_SETTINGS)
  const managerNames = employees.filter((e) => e.role === 'manager' && e.status === 'active').map((e) => e.name)
  if (d.manager && !managerNames.includes(d.manager)) managerNames.push(d.manager) // keep a manager the API already has
  const setD = (key) => (value) => { setDetails({ ...d, [key]: value }); setErrors((e) => ({ ...e, [key]: undefined })) }
  const title = editing ? `Edit ${existing.name}` : 'Add branch'
  const backTo = editing ? `/branches/${existing.id}` : '/branches'

  const next = () => {
    const found = step === 0 ? validateDetails(d, branches, existing?.id) : validateSettings(s)
    setErrors(found)
    if (Object.keys(found).length) { notify('Please fix the highlighted fields.', 'error'); return }
    setStep(step + 1)
  }

  const submit = async () => {
    if (lock.current) return
    // Re-check everything: the user can jump back and forth between steps.
    const bad = { ...validateDetails(d, branches, existing?.id), ...validateSettings(s) }
    if (Object.keys(bad).length) { setErrors(bad); setStep(Object.keys(validateDetails(d, branches, existing?.id)).length ? 0 : 1); return }
    lock.current = true
    setSubmitting(true)
    const payload = { ...toDetails(d), settings: toSettings(s) }
    const saved = editing ? await updateBranch(existing.id, payload) : await createBranch(payload)
    if (saved) {
      notify(editing ? `${saved.name} updated.` : `${saved.name} created.`)
      navigate(`/branches/${saved.id}`)
      return
    }
    lock.current = false
    setSubmitting(false)
  }

  const delivery = s.acceptDelivery ? `${Number(s.deliveryFee)} ${s.currency.toUpperCase()} fee` : 'Not offered'
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[860px]">
        <BackLink to={backTo}>{editing ? existing.name : 'All branches'}</BackLink>
        <PageTitle title={title} subtitle="Branches share the menu and staff directory, with their own settings." />
        <Stepper step={step} onGo={(i) => { setErrors({}); setStep(i) }} />

        <section className={`${cardClass} mt-4 p-6`}>
          {step === 0 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Branch details</h2>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <TextField id="b-name" label="Branch name" required value={d.name} onChange={setD('name')} error={errors.name} placeholder="Alexandria Corniche" maxLength={60} />
                <TextField id="b-code" label="Short code" required value={d.code} onChange={(v) => setD('code')(v.toUpperCase())} error={errors.code} hint="Shown on kitchen tickets and reports" placeholder="ALX" maxLength={6} />
                <TextField id="b-area" label="Area / city" required value={d.area} onChange={setD('area')} error={errors.area} placeholder="Stanley, Alexandria" />
                <TextField id="b-phone" label="Phone" required type="tel" value={d.phone} onChange={setD('phone')} error={errors.phone} placeholder="+20 3 xxx xxxx" />
                <TextField id="b-address" label="Street address" required className="sm:col-span-2" value={d.address} onChange={setD('address')} error={errors.address} placeholder="410 El Geish Rd, Stanley" />
                <div className="grid gap-x-5 gap-y-4 sm:col-span-2 sm:grid-cols-[1fr_1fr_1fr]">
                  <Field label="Branch manager" htmlFor="b-manager">
                    <select id="b-manager" value={d.manager} onChange={(e) => setD('manager')(e.target.value)} className={inputClass}>
                      <option value="">No manager</option>
                      {managerNames.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </Field>
                  <TextField id="b-opens" label="Opens" type="time" value={d.opens} onChange={setD('opens')} error={errors.opens} />
                  <TextField id="b-closes" label="Closes" type="time" value={d.closes} onChange={setD('closes')} error={errors.closes} />
                </div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="m-0 text-[15px] font-bold text-ink">Configure settings</h2>
              <p className="m-0 mb-4 text-xs text-muted">Currency, tax, service charge and receipt for this branch.</p>
              <SettingsFields values={s} errors={errors} onChange={(v) => { setSettings(v); setErrors({}) }} idPrefix="w" />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="m-0 mb-5 text-[15px] font-bold text-ink">Review &amp; save</h2>
              <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
                <ReviewColumn title="Details" rows={[['Name', d.name.trim()], ['Code', d.code.trim().toUpperCase()], ['Location', d.area.trim()], ['Address', d.address.trim()], ['Phone', d.phone.trim()], ['Manager', d.manager], ['Hours', `${d.opens} - ${d.closes}`]]} />
                <ReviewColumn title="Settings" rows={[['Currency', s.currency.toUpperCase()], ['VAT', `${Number(s.vat)}%`], ['Service', `${Number(s.serviceCharge)}%`], ['Delivery', delivery], ['Receipt footer', s.receiptFooter.trim()]]} />
              </div>
            </>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            {step === 0
              ? <button type="button" className={btnOutline} onClick={() => navigate(backTo)}>Cancel</button>
              : <button type="button" className={btnOutline} disabled={submitting} onClick={() => { setErrors({}); setStep(step - 1) }}>Back</button>}
            {step < 2
              ? <button type="button" className={btn} onClick={next}>{step === 0 ? 'Continue to settings' : 'Review'}</button>
              : <button type="button" className={btn} disabled={submitting} onClick={submit}>{submitting ? 'Saving…' : editing ? 'Save changes' : 'Create branch'}</button>}
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
