import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageContainer, cardClass } from '@/features/tables/shared.jsx'
import { BRANCH_NAME, branchNames } from './staffData.js'
import { isOnShift, useStaff } from './StaffContext.jsx'
import { Avatar, RoleChip, StaffHeading, StaffTabs, StatusChip, btn } from './ui.jsx'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'manager', label: 'Managers' },
  { key: 'cashier', label: 'Cashiers' },
  { key: 'kitchen', label: 'Kitchen' },
]

export default function EmployeesPage() {
  const { employees, activeShift } = useStaff()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')

  const count = (key) => (key === 'all' ? employees.length : employees.filter((employee) => employee.role === key).length)
  const activeCount = employees.filter((employee) => employee.status === 'active').length

  const rows = useMemo(() => {
    const text = query.trim().toLowerCase()
    return employees.filter((employee) => (
      (filter === 'all' || employee.role === filter)
      && (!text || [employee.name, employee.email, employee.phone].some((value) => value.toLowerCase().includes(text)))
    ))
  }, [employees, filter, query])

  return (
    <PageContainer>
      <StaffHeading
        subtitle={`${activeCount} active employees • ${BRANCH_NAME}`}
        action={<button type="button" className={btn} onClick={() => navigate('/staff/new')}><UserPlus size={18} strokeWidth={1.8} aria-hidden="true" />Add employee</button>}
      />
      <StaffTabs />

      <section className={`${cardClass} mt-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3 p-3">
          <div className="inline-flex rounded-lg bg-page p-1" role="group" aria-label="Filter employees by role">
            {FILTERS.map(({ key, label }) => {
              const active = filter === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(key)}
                  className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-semibold ${active ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  {label}
                  <span className={`rounded px-1.5 text-[11px] ${active ? 'bg-primary-soft text-accent' : 'text-muted'}`}>{count(key)}</span>
                </button>
              )
            })}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search staff"
            aria-label="Search staff"
            className="h-9 w-full rounded-lg border border-line bg-card px-3 text-[13px] text-ink placeholder:text-muted focus:border-accent focus:outline-none sm:w-[240px]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="h-10 border-y border-line bg-sand-light text-[11px] font-medium text-muted">
                <th className="pl-4 font-medium">Employee</th>
                <th className="font-medium">Role</th>
                <th className="font-medium">Branches</th>
                <th className="font-medium">Phone</th>
                <th className="font-medium">Shift</th>
                <th className="pr-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => navigate(`/staff/${employee.id}`)}
                  className="h-[60px] cursor-pointer border-b border-line last:border-b-0 hover:bg-page"
                >
                  <td className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.name} tone={employee.tone} />
                      <div className="leading-tight">
                        <div className="font-bold text-ink">{employee.name}</div>
                        <div className="text-xs text-muted">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><RoleChip role={employee.role} /></td>
                  <td className="text-text">{branchNames(employee.branches).join(', ')}</td>
                  <td className="whitespace-nowrap text-text">{employee.phone}</td>
                  <td>
                    {isOnShift(employee, activeShift)
                      ? <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-success-soft px-2.5 text-[11px] font-semibold text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" />On shift</span>
                      : <span className="text-xs text-muted">Off</span>}
                  </td>
                  <td className="pr-4"><StatusChip active={employee.status === 'active'} /></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="h-24 text-center text-muted">No employees match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
