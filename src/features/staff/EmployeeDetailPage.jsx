import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Mail, Pencil, Phone, X } from 'lucide-react'
import { BackLink, PageContainer, PageTitle, cardClass } from '@/features/tables/shared.jsx'
import { PERMISSIONS } from './staffData.js'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import { useStaff } from './StaffContext.jsx'
import ShiftHistory from './ShiftHistory.jsx'
import { Avatar, RoleChip, StatusChip, btn, btnOutline } from './ui.jsx'

export default function EmployeeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { employees, history, setEmployeeStatus, fetchEmployee, refreshShifts, employeesLoading, employeeDetailLoading, employeesError } = useStaff()
  const { branches } = useBranches()
  const employee = employees.find((item) => item.id === id)
  useEffect(() => { if (id && !employee) fetchEmployee(id) }, [id, employee, fetchEmployee])
  useEffect(() => { if (employee) refreshShifts(undefined, { employeeId: id }) }, [id, employee, refreshShifts])

  if (!employee && (employeesLoading || employeeDetailLoading)) return <PageContainer><BackLink to="/staff">Employees</BackLink><PageTitle title="Loading employee…" /></PageContainer>
  if (!employee) {
    return (
      <PageContainer>
        <BackLink to="/staff">Employees</BackLink>
        <PageTitle title="Employee not found" />
        {employeesError && <p role="alert" className="text-sm text-danger">{employeesError}</p>}
      </PageContainer>
    )
  }

  const active = employee.status === 'active'
  const shifts = history.filter((row) => String(row.employeeId) === String(employee.id) || row.employee === employee.name)

  return (
    <PageContainer>
      <BackLink to="/staff">Employees</BackLink>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title={employee.name} />
        <div className="flex gap-3">
          <button type="button" className={btnOutline} onClick={() => setEmployeeStatus(employee.id, active ? 'inactive' : 'active')}>{active ? 'Deactivate' : 'Activate'}</button>
          <button type="button" className={btn} onClick={() => navigate(`/staff/${employee.id}/edit`)}><Pencil size={16} strokeWidth={1.8} aria-hidden="true" />Edit employee</button>
        </div>
      </div>

      <div className="mt-5 grid items-start gap-3.5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="flex flex-col gap-3.5">
          <section className={`${cardClass} p-5`}>
            <div className="flex flex-col items-center text-center">
              <Avatar name={employee.name} tone={employee.tone} size="h-14 w-14 text-base" />
              <div className="mt-3 text-base font-bold text-ink">{employee.name}</div>
              <div className="mt-2 flex gap-2"><RoleChip role={employee.role} /><StatusChip active={active} /></div>
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4 text-[13px] text-ink">
              <div className="flex items-center gap-2.5"><Mail size={15} strokeWidth={1.8} className="text-muted" aria-hidden="true" />{employee.email}</div>
              <div className="flex items-center gap-2.5"><Phone size={15} strokeWidth={1.8} className="text-muted" aria-hidden="true" />{employee.phone}</div>
              {employee.joined && <div className="flex items-center justify-between"><span className="text-muted">Joined</span><span className="font-medium">{employee.joined}</span></div>}
            </div>
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 mb-3 text-sm font-bold text-ink">Branch access</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {employee.branches.map((branchId) => {
                const branch = branches.find((item) => item.id === branchId)
                return (
                  <li key={branchId} className="flex items-center justify-between rounded-lg bg-page px-3 py-2.5 text-[13px] text-ink">
                    {branch?.name || branchId}<span className="text-xs text-muted">{branch?.code || ''}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-3.5">
          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 text-[15px] font-bold text-ink">Permissions</h2>
            <p className="m-0 mt-0.5 text-xs text-muted">{employee.permissions.length} permissions assigned</p>
            <ul className="m-0 mt-4 grid list-none gap-x-6 gap-y-2.5 p-0 sm:grid-cols-2">
              {employee.permissions.map((key) => ({ key, label: PERMISSIONS.find((p) => p.key === key)?.label || key })).map((permission) => {
                const granted = employee.permissions.includes(permission.key)
                return (
                  <li key={permission.key} className={`flex items-center gap-2.5 text-[13px] ${granted ? 'text-ink' : 'text-muted'}`}>
                    {granted
                      ? <Check size={15} strokeWidth={2.4} className="text-success" aria-label="Granted" />
                      : <span className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-chip-grey text-muted" aria-label="Not granted"><X size={9} strokeWidth={3} /></span>}
                    {permission.label}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={`${cardClass} pt-5`}>
            <h2 className="m-0 mb-3 px-5 text-[15px] font-bold text-ink">Shift history</h2>
            {shifts.length ? <ShiftHistory rows={shifts} /> : <p className="m-0 px-5 pb-5 text-[13px] text-muted">No shifts recorded yet.</p>}
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
