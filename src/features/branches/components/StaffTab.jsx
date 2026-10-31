import { useEffect, useState } from 'react'
import { Check, UserPlus } from 'lucide-react'
import { cardClass } from '@/features/tables/shared.jsx'
import { useStaff } from '@/features/staff/StaffContext.jsx'
import { ROLES } from '@/features/staff/staffData.js'
import { Avatar, Modal, RoleChip, btn, btnDanger, btnOutline } from '@/features/staff/ui.jsx'
import { useBranches } from '../BranchContext.jsx'

function AssignModal({ branch, onClose }) {
  const { employees, refreshEmployees, employeesLoading, employeesError } = useStaff()
  const { assignEmployees } = useBranches()
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const available = employees.filter((employee) => !employee.branches.includes(branch.id))
  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]))

  const submit = async () => {
    if (saving || !selected.length) return
    setSaving(true)
    const ok = await assignEmployees(branch.id, selected)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal title={`Assign to ${branch.name}`} subtitle="Pick an employee to give access to this branch." onClose={onClose} width="max-w-[560px]"
      footer={(
        <>
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="button" className={btn} disabled={!selected.length || saving} onClick={submit}>
            {saving ? 'Assigning…' : selected.length > 1 ? `Assign ${selected.length}` : 'Assign'}
          </button>
        </>
      )}>
      {employeesLoading ? <p className="m-0 py-6 text-center text-sm text-muted">Loading employees…</p> : employeesError ? <p role="alert" className="m-0 py-6 text-center text-sm text-danger">{employeesError}</p> : available.length === 0 ? (
        <p className="m-0 py-6 text-center text-sm text-muted">Every employee is already assigned to this branch.</p>
      ) : (
        <div className="grid max-h-[50vh] grid-cols-1 gap-2.5 overflow-y-auto min-[480px]:grid-cols-2" role="group" aria-label="Employees">
          {available.map((employee) => {
            const on = selected.includes(employee.id)
            return (
              <button key={employee.id} type="button" aria-pressed={on} onClick={() => toggle(employee.id)}
                className={`relative rounded-xl border px-3.5 py-2.5 text-left transition-colors ${on ? 'border-accent bg-primary-soft' : 'border-line bg-card hover:bg-page'}`}>
                <span className="block pr-5 text-[13px] font-semibold text-ink">{employee.name}</span>
                <span className="block text-[11px] text-muted">{ROLES[employee.role]?.label || employee.role}</span>
                {on && <Check size={14} strokeWidth={2.5} className="absolute right-3 top-3 text-accent" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default function StaffTab({ branch }) {
  const { employees, refreshEmployees, employeesLoading, employeesError } = useStaff()
  useEffect(() => { refreshEmployees() }, [refreshEmployees])
  const { unassignEmployee } = useBranches()
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)
  const assigned = employees.filter((employee) => employee.branches.includes(branch.id))

  const confirmRemove = async () => {
    if (busy) return
    setBusy(true)
    await unassignEmployee(branch.id, removing.id)
    setBusy(false)
    setRemoving(null)
  }

  const assignButton = <button type="button" className={`${btn} h-9 px-4`} disabled={employeesLoading} onClick={() => setAssigning(true)}><UserPlus size={16} strokeWidth={1.8} aria-hidden="true" />Assign employee</button>
  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="m-0 text-[15px] font-bold text-ink">Assigned staff</h2>
        {assignButton}
      </div>
      {employeesLoading ? <p className="m-0 border-t border-line py-8 text-center text-sm text-muted">Loading assigned staff…</p> : employeesError ? <p role="alert" className="m-0 border-t border-line py-8 text-center text-sm text-danger">{employeesError}</p> : assigned.length === 0 ? (
        <div className="flex flex-col items-center px-6 pb-12 pt-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-accent"><UserPlus size={20} aria-hidden="true" /></span>
          <h3 className="m-0 mt-3 text-sm font-bold text-ink">No staff assigned</h3>
          <p className="m-0 mt-1 max-w-[320px] text-[13px] text-muted">Assign cashiers and kitchen staff so they can sign in here.</p>
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {assigned.map((employee) => (
            <li key={employee.id} className="flex items-center gap-3 border-t border-line px-5 py-3">
              <Avatar name={employee.name} tone={employee.tone} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">{employee.name}</div>
                <div className="truncate text-xs text-muted">{employee.email}</div>
              </div>
              <RoleChip role={employee.role} />
              <button type="button" onClick={() => setRemoving(employee)} className="text-[13px] text-muted hover:text-danger">Unassign</button>
            </li>
          ))}
        </ul>
      )}
      {assigning && <AssignModal branch={branch} onClose={() => setAssigning(false)} />}
      {removing && (
        <Modal title="Unassign employee?" subtitle={`${removing.name} will lose access to ${branch.name}.`} onClose={() => setRemoving(null)}
          footer={(
            <>
              <button type="button" className={btnOutline} onClick={() => setRemoving(null)}>Cancel</button>
              <button type="button" className={btnDanger} disabled={busy} onClick={confirmRemove}>Unassign</button>
            </>
          )}>
          <p className="m-0 text-sm text-muted">Their other branch assignments stay as they are.</p>
        </Modal>
      )}
    </section>
  )
}
