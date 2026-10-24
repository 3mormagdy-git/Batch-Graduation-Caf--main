import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChefHat, Crown, Monitor } from 'lucide-react'
import { BackLink, PageContainer, PageTitle, cardClass } from '@/features/tables/shared.jsx'
import { ALL_PERMISSIONS, BRANCHES, PERMISSIONS, ROLES } from './staffData.js'
import { useStaff } from './StaffContext.jsx'
import { btn, btnOutline, checkboxClass, inputClass } from './ui.jsx'

const STEPS = ['Details', 'Role', 'Branches', 'Permissions']
const ROLE_ICON = { manager: Crown, cashier: Monitor, kitchen: ChefHat }
const EMPTY = { name: '', email: '', phone: '', pin: '', role: '', branches: [], permissions: [] }

function Stepper({ step }) {
  return (
    <ol className="m-0 grid list-none grid-cols-2 gap-3.5 p-0 sm:grid-cols-4">
      {STEPS.map((label, index) => {
        const state = index < step ? 'done' : index === step ? 'current' : 'todo'
        return (
          <li
            key={label}
            aria-current={state === 'current' ? 'step' : undefined}
            className={`flex h-[42px] items-center gap-2.5 rounded-lg border px-3.5 text-[13px] font-semibold ${
              state === 'current' ? 'border-accent bg-primary-soft text-accent' : state === 'done' ? 'border-line bg-card text-success' : 'border-line bg-card text-muted'
            }`}
          >
            <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] ${
              state === 'current' ? 'bg-accent text-white' : state === 'done' ? 'bg-success text-white' : 'bg-sand text-muted'
            }`}>
              {state === 'done' ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : index + 1}
            </span>
            {label}
          </li>
        )
      })}
    </ol>
  )
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block text-[13px] font-medium text-ink">
      {label}<span className="text-accent">*</span>
      <span className="mt-1.5 block">{children}</span>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export default function EmployeeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, roleDefaults, addEmployee, updateEmployee } = useStaff()
  const editing = employees.find((employee) => employee.id === id)
  const isEdit = Boolean(id)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => (editing ? {
    name: editing.name, email: editing.email, phone: editing.phone, pin: editing.pin || '',
    role: editing.role, branches: editing.branches, permissions: editing.permissions,
  } : EMPTY))
  const [errors, setErrors] = useState({})

  if (isEdit && !editing) {
    return (
      <PageContainer>
        <BackLink to="/staff">Employees</BackLink>
        <PageTitle title="Employee not found" />
      </PageContainer>
    )
  }

  const set = (patch) => setForm((current) => ({ ...current, ...patch }))
  const field = (name) => (event) => { set({ [name]: event.target.value }); setErrors((current) => ({ ...current, [name]: '' })) }
  const back = isEdit ? `/staff/${id}` : '/staff'

  const validate = () => {
    const next = {}
    if (step === 0) {
      if (!form.name.trim()) next.name = 'Full name is required.'
      if (!form.email.trim()) next.email = 'Work email is required.'
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.'
      if (!form.phone.trim()) next.phone = 'Phone is required.'
      if (!form.pin.trim()) next.pin = 'Register PIN is required.'
    }
    if (step === 1 && !form.role) next.role = 'Select a role.'
    if (step === 2 && form.branches.length === 0) next.branches = 'Assign at least one branch.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => { if (validate()) setStep((value) => value + 1) }

  const chooseRole = (role) => {
    // Picking a different role loads that role's default permissions.
    if (role !== form.role) set({ role, permissions: roleDefaults[role] })
    setErrors({})
  }
  const toggle = (name, value) => set({
    [name]: form[name].includes(value) ? form[name].filter((item) => item !== value) : [...form[name], value],
  })

  const save = () => {
    const data = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), pin: form.pin.trim(),
      role: form.role, branches: form.branches,
      permissions: form.role === 'manager' ? ALL_PERMISSIONS : form.permissions,
    }
    if (isEdit) {
      updateEmployee(id, data)
      navigate(`/staff/${id}`)
    } else {
      navigate(`/staff/${addEmployee(data).id}`)
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[852px]">
        <BackLink to={back}>{isEdit ? editing.name : 'Employees'}</BackLink>
        <PageTitle title={isEdit ? 'Edit employee' : 'Add employee'} />
        <div className="mt-6"><Stepper step={step} /></div>

        <section className={`${cardClass} mt-4 p-5`}>
          {step === 0 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Personal details</h2>
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name}><input className={inputClass} placeholder="Laila Hamdy" value={form.name} onChange={field('name')} /></Field>
                <Field label="Work email" error={errors.email}><input className={inputClass} type="email" placeholder="laila@nahj.cafe" value={form.email} onChange={field('email')} /></Field>
                <Field label="Phone" error={errors.phone}><input className={inputClass} type="tel" placeholder="+20 1xx xxx xxxx" value={form.phone} onChange={field('phone')} /></Field>
                <Field label="Register PIN" error={errors.pin} hint="Used to sign in at the POS"><input className={inputClass} type="password" inputMode="numeric" autoComplete="off" value={form.pin} onChange={field('pin')} /></Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Select role</h2>
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Role">
                {Object.entries(ROLES).map(([key, role]) => {
                  const Icon = ROLE_ICON[key]
                  const selected = form.role === key
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => chooseRole(key)}
                      className={`rounded-xl border p-4 text-left ${selected ? 'border-accent bg-primary-soft' : 'border-line bg-card hover:bg-page'}`}
                    >
                      <Icon size={20} strokeWidth={1.8} className="text-accent" aria-hidden="true" />
                      <div className="mt-3 text-sm font-bold text-ink">{role.label}</div>
                      <div className="mt-1 text-xs leading-snug text-muted">{role.description}</div>
                    </button>
                  )
                })}
              </div>
              {errors.role && <p className="m-0 mt-2 text-xs text-danger">{errors.role}</p>}
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Assign branches</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {BRANCHES.map((branch) => {
                  const selected = form.branches.includes(branch.id)
                  return (
                    <label key={branch.id} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 ${selected ? 'border-accent bg-primary-soft' : 'border-line bg-card hover:bg-page'}`}>
                      <input type="checkbox" className={`${checkboxClass} mt-0.5`} checked={selected} onChange={() => { toggle('branches', branch.id); setErrors({}) }} />
                      <span className="leading-tight">
                        <span className="block text-[13px] font-bold text-ink">{branch.name}</span>
                        <span className="mt-0.5 block text-xs text-muted">{branch.address}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
              {errors.branches && <p className="m-0 mt-2 text-xs text-danger">{errors.branches}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Set permissions</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {PERMISSIONS.map((permission) => {
                  const isDefault = roleDefaults[form.role]?.includes(permission.key)
                  const locked = form.role === 'manager' // managers always have full access
                  return (
                    <label key={permission.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-card px-3.5 py-3 hover:bg-page">
                      <span className="leading-tight">
                        <span className="block text-[13px] font-medium text-ink">{permission.label}</span>
                        <span className="mt-0.5 block text-xs text-muted">{permission.group}{isDefault ? ' • role default' : ''}</span>
                      </span>
                      <input
                        type="checkbox"
                        className={checkboxClass}
                        checked={locked || form.permissions.includes(permission.key)}
                        disabled={locked}
                        onChange={() => toggle('permissions', permission.key)}
                      />
                    </label>
                  )
                })}
              </div>
            </>
          )}

          <div className="mt-5 flex items-center justify-between">
            {step === 0
              ? <button type="button" className={btnOutline} onClick={() => navigate(back)}>Cancel</button>
              : <button type="button" className={btnOutline} onClick={() => setStep((value) => value - 1)}>Back</button>}
            {step < 3
              ? <button type="button" className={btn} onClick={next}>Continue</button>
              : <button type="button" className={btn} onClick={save}>Save employee</button>}
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
