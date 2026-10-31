import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageContainer, cardClass } from '@/features/tables/shared.jsx'
import { branchNames } from './staffData.js'
import { isOnShift, useStaff } from './StaffContext.jsx'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import { Avatar, RoleChip, StaffHeading, StaffTabs, StatusChip, btn, inputClass } from './ui.jsx'

const FILTERS = [
  { key: '', label: 'All' },
  { key: 'manager', label: 'Managers' },
  { key: 'cashier', label: 'Cashiers' },
  { key: 'kitchen', label: 'Kitchen' },
]
export default function EmployeesPage() {
  const { employees, activeShift, employeesLoading, employeesError, refreshEmployees } = useStaff()
  const { branches, loading: branchesLoading, loadError: branchesError } = useBranches()
  const navigate = useNavigate()
  const [role, setRole] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => refreshEmployees({ role, branchId, status, search: query }), 250)
    return () => clearTimeout(timer)
  }, [role, branchId, status, query, refreshEmployees])
  const activeCount = employees.filter((employee) => employee.status === 'active').length
  const branchLabel = branches.find((branch) => branch.id === branchId)?.name || 'All branches'
  const rows = useMemo(() => employees, [employees])
  const roleLabel = (key) => ({ manager: 'manager', cashier: 'cashier', kitchen: 'kitchen' }[key] || key)
  return (
    <PageContainer>
      <StaffHeading subtitle={`${activeCount} active employees • ${branchLabel}`} action={<button type="button" className={btn} onClick={() => navigate('/staff/new')}><UserPlus size={18} aria-hidden="true" />Add employee</button>} />
      <StaffTabs />
      <section className={`${cardClass} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="inline-flex rounded-lg bg-page p-1" role="group" aria-label="Filter employees by role">
            {FILTERS.map(({ key, label }) => <button key={key || 'all'} type="button" aria-pressed={role === key} onClick={() => setRole(key)} className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-semibold ${role === key ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>{label}</button>)}
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Filter by branch" disabled={branchesLoading} value={branchId} onChange={(e) => setBranchId(e.target.value)} className={`${inputClass} w-auto min-w-[150px]`}>
              <option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-auto min-w-[125px]`}>
              <option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
            </select>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search staff" aria-label="Search staff" className={`${inputClass} w-full sm:w-[200px]`} />
            <button type="button" className="rounded-lg border border-line px-3 text-sm text-ink disabled:opacity-50" disabled={employeesLoading} onClick={() => refreshEmployees({ role, branchId, status, search: query }, { force: true })}>Refresh</button>
          </div>
        </div>
        {branchesError && <p role="alert" className="m-0 border-y border-line px-4 py-2 text-xs text-danger">{branchesError}</p>}
        {employeesError && <div role="alert" className="flex items-center justify-between gap-3 border-y border-line px-4 py-3 text-sm text-danger"><span>{employeesError}</span><button type="button" className="underline" onClick={() => refreshEmployees({ role, branchId, status, search: query }, { force: true })}>Retry</button></div>}
        {employeesLoading && <p className="m-0 px-4 py-2 text-xs text-muted">Loading employees…</p>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead><tr className="h-10 border-y border-line bg-sand-light text-[11px] font-medium text-muted"><th className="pl-4 font-medium">Employee</th><th className="font-medium">Role</th><th className="font-medium">Branches</th><th className="font-medium">Phone</th><th className="font-medium">Shift</th><th className="pr-4 font-medium">Status</th></tr></thead>
            <tbody>
              {rows.map((employee) => <tr key={employee.id} onClick={() => navigate(`/staff/${employee.id}`)} className="h-[60px] cursor-pointer border-b border-line last:border-b-0 hover:bg-page">
                <td className="pl-4"><div className="flex items-center gap-3"><Avatar name={employee.name} tone={employee.tone} /><div className="leading-tight"><div className="font-bold text-ink">{employee.name}</div><div className="text-xs text-muted">{employee.email}</div></div></div></td>
                <td><RoleChip role={roleLabel(employee.role)} /></td><td className="text-text">{branchNames(employee.branches, branches).join(', ')}</td><td className="whitespace-nowrap text-text">{employee.phone}</td>
                <td>{isOnShift(employee, activeShift) ? <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-success-soft px-2.5 text-[11px] font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />On shift</span> : <span className="text-xs text-muted">Off</span>}</td>
                <td className="pr-4"><StatusChip active={employee.status === 'active'} /></td>
              </tr>)}
              {!employeesLoading && rows.length === 0 && <tr><td colSpan={6} className="h-24 text-center text-muted">{employeesError ? 'Employees could not be loaded.' : 'No employees match.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
