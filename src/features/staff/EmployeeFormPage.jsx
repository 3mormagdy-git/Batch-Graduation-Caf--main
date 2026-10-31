import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, ChefHat, Crown, Monitor } from 'lucide-react'
import { BackLink, PageContainer, PageTitle, cardClass } from '@/features/tables/shared.jsx'
import { PERMISSIONS, ROLES } from './staffData.js'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import { useStaff } from './StaffContext.jsx'
import { btn, btnOutline, checkboxClass, inputClass } from './ui.jsx'

const STEPS = ['Details', 'Role', 'Branches', 'Permissions']
const ROLE_ICON = { manager: Crown, cashier: Monitor, kitchen: ChefHat }
const EMPTY = { name: '', email: '', phone: '', password: '', role: '', branches: [], permissions: [] }

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
  const { employees, roles, roleDefaults, createEmployee, updateEmployee, fetchEmployee, employeesLoading, employeeDetailLoading, employeesError, saving } = useStaff()
  const { branches, loading: branchesLoading, loadError: branchesError } = useBranches()
  const editing = employees.find((employee) => employee.id === id)
  const isEdit = Boolean(id)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loadError, setLoadError] = useState('')
  useEffect(() => { if (id && !editing) fetchEmployee(id) }, [id, editing, fetchEmployee])
  useEffect(() => {
    if (editing) setForm({
      name: editing.name, email: editing.email, phone: editing.phone, password: '',
      role: editing.role, branches: editing.branches || [], permissions: editing.permissions || [],
      status: editing.status, hiredAt: editing.hiredAt,
    })
  }, [editing])

  if (isEdit && !editing) {
    return (
      <PageContainer>
        <BackLink to="/staff">Employees</BackLink>
        <PageTitle title={(employeesLoading || employeeDetailLoading) ? "Loading employee…" : "Employee not found"} />
        {employeesError && <p role="alert" className="text-sm text-danger">{employeesError}</p>}
      </PageContainer>
    )
  }

  const set = (patch) => setForm((current) => ({ ...current, ...patch }))
  const field = (name) => (event) => { set({ [name]: event.target.value }); setErrors((current) => ({ ...current, [name]: '' })) }
  const back = isEdit ? `/staff/${id}` : '/staff'
  const apiPermissions = roles.flatMap((item) => Array.isArray(item?.permissions) ? item.permissions : [])
    .map((permission) => typeof permission === 'string'
      ? { key: permission, label: permission, group: 'Backend' }
      : { key: permission.key || permission.code || permission.name, label: permission.label || permission.name || permission.key || permission.code, group: permission.group || 'Backend' })
    .filter((permission) => permission.key)
  const dynamicPermissions = [...apiPermissions, ...form.permissions.map((key) => ({ key, label: key, group: 'Employee' }))]
  const permissionOptions = [...PERMISSIONS, ...dynamicPermissions.filter((item, index) => !PERMISSIONS.some((known) => known.key === item.key) && dynamicPermissions.findIndex((other) => other.key === item.key) === index)]
  const roleOptions = roles.length ? roles.map((item) => {
    const apiValue = typeof item === 'string' ? item : item.name || item.role || item.value || ''
    const key = ({ Manager: 'manager', Cashier: 'cashier', 'Kitchen Staff': 'kitchen' })[apiValue] || String(apiValue).toLowerCase()
    return { key, label: typeof item === 'object' ? (item.label || item.name || item.role || apiValue) : item, description: item.description || ROLES[key]?.description || '' }
  }).filter((item) => item.key) : Object.entries(ROLES).map(([key, value]) => ({ key, ...value }))

  const validate = () => {
    const next = {}
    if (step === 0) {
      if (!form.name.trim()) next.name = 'Full name is required.'
      if (!form.email.trim()) next.email = 'Work email is required.'
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.'
      if (!form.phone.trim()) next.phone = 'Phone is required.'
      if (!isEdit && !form.password.trim()) next.password = 'Password is required.'
    }
    if (step === 1 && !form.role) next.role = 'Select a role.'
    if (step === 2 && form.branches.length === 0) next.branches = 'Assign at least one branch.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const next = () => { if (validate()) setStep((value) => value + 1) }

  const chooseRole = (role) => {
    // Picking a different role loads that role's default permissions.
    if (role !== form.role) {
      const apiRole = roles.find((item) => {
        const value = typeof item === 'string' ? item : item.name || item.role || item.value
        return String(value).toLowerCase() === String(role).toLowerCase() || ({ Manager: 'manager', Cashier: 'cashier', 'Kitchen Staff': 'kitchen' })[value] === role
      })
      const defaults = Array.isArray(apiRole?.permissions) ? apiRole.permissions.map((permission) => typeof permission === 'string' ? permission : (permission.key || permission.code || permission.name)).filter(Boolean) : (roleDefaults[role] || [])
      set({ role, permissions: defaults })
    }
    setErrors({})
  }
  const toggle = (name, value) => set({
    [name]: form[name].includes(value) ? form[name].filter((item) => item !== value) : [...form[name], value],
  })

  const save = async () => {
    setLoadError('')
    const data = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
      role: form.role, branches: form.branches,
      permissions: form.role === 'manager' ? permissionOptions.map((permission) => permission.key) : form.permissions,
      status: form.status || 'active',
      hiredAt: form.hiredAt || new Date().toISOString().slice(0, 10),
    }
    const saved = isEdit ? await updateEmployee(id, data) : await createEmployee(data)
    if (!saved) { setLoadError('The employee could not be saved. Review the server error and try again.'); return }
    navigate(isEdit ? `/staff/${id}` : `/staff/${saved.id}`)
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
                <Field label={isEdit ? "New password (optional)" : "Password"} error={errors.password} hint={isEdit ? "Leave blank to keep the current password." : "Used for employee account access."}><input className={inputClass} type="password" autoComplete="new-password" value={form.password} onChange={field('password')} /></Field>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Select role</h2>
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Role">
                {roleOptions.map((role) => {
                  const key = role.key
                  const Icon = ROLE_ICON[key] || Monitor
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
              {branchesLoading ? <p className="text-sm text-muted">Loading branches…</p> : branchesError ? <p role="alert" className="text-sm text-danger">{branchesError}</p> : <div className="grid gap-3 sm:grid-cols-3">
                {branches.map((branch) => {
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
              </div>}
              {errors.branches && <p className="m-0 mt-2 text-xs text-danger">{errors.branches}</p>}
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="m-0 mb-4 text-[15px] font-bold text-ink">Set permissions</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {permissionOptions.map((permission) => {
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

          {loadError && <p role="alert" className="m-0 mt-3 text-sm text-danger">{loadError}</p>}
          {employeesError && <p role="alert" className="m-0 mt-2 text-sm text-danger">{employeesError}</p>}
          <div className="mt-5 flex items-center justify-between">
            {step === 0
              ? <button type="button" className={btnOutline} onClick={() => navigate(back)}>Cancel</button>
              : <button type="button" className={btnOutline} onClick={() => setStep((value) => value - 1)}>Back</button>}
            {step < 3
              ? <button type="button" className={btn} onClick={next}>Continue</button>
              : <button type="button" className={btn} disabled={saving || branchesLoading || branches.length === 0} onClick={save}>{saving ? "Saving…" : "Save employee"}</button>}
          </div>
        </section>
      </div>
    </PageContainer>
  )
}
