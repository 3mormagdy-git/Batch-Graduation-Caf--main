import { useEffect, useState } from 'react'
import { Clock, Play, Square } from 'lucide-react'
import { PageContainer, cardClass } from '@/features/tables/shared.jsx'
import { formatDuration, formatWhole, minutesSince } from './staffData.js'
import { useStaff } from './StaffContext.jsx'
import { useBranches } from '@/features/branches/BranchContext.jsx'
import ShiftHistory from './ShiftHistory.jsx'
import { EndShiftModal, StartShiftModal } from './ShiftModals.jsx'
import { Avatar, StaffHeading, StaffTabs, btn, inputClass } from './ui.jsx'

function useNow() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  return now
}
const amount = (value) => value == null ? '—' : formatWhole(value)
export default function ShiftsPage() {
  const { activeShift, activeShifts, employees, history, shiftsLoading, shiftsError, refreshShifts } = useStaff()
  const { branches, activeBranchId, loading: branchesLoading, loadError: branchesError } = useBranches()
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [starting, setStarting] = useState(false)
  const [ending, setEnding] = useState(null)
  const now = useNow()
  useEffect(() => { if (!branchId && activeBranchId) setBranchId(activeBranchId) }, [activeBranchId, branchId])
  useEffect(() => { if (branchId) refreshShifts(branchId, { branchId, status, employeeId }) }, [branchId, status, employeeId, refreshShifts])
  const workerFor = (shift) => employees.find((employee) => String(employee.id) === String(shift.employeeId))
  const historyRows = history.map((shift) => ({ ...shift, employee: shift.employee || workerFor(shift)?.name || shift.employeeId || '—', branch: shift.branch || branches.find((branch) => String(branch.id) === String(shift.branchId))?.name || shift.branchId || '—', sales: shift.sales ?? shift.totalSales }))
  const activeBranchName = branches.find((branch) => branch.id === activeShift?.branchId)?.name
  const expected = activeShift?.expected ?? (activeShift?.openingFloat != null && activeShift?.cashSales != null ? Number(activeShift.openingFloat) + Number(activeShift.cashSales) : null)
  return (
    <PageContainer>
      <StaffHeading subtitle="Open and close registers, and reconcile cash." />
      <StaffTabs />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select aria-label="Filter shifts by branch" disabled={branchesLoading} value={branchId} onChange={(e) => setBranchId(e.target.value)} className={`${inputClass} w-auto min-w-[160px]`}>
          <option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
        <select aria-label="Filter shifts by status" value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputClass} w-auto min-w-[130px]`}>
          <option value="">All statuses</option><option value="active">Active</option><option value="closed">Closed</option>
        </select>
        <select aria-label="Filter shifts by employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className={`${inputClass} w-auto min-w-[170px]`}>
          <option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
        </select>
        <button type="button" className="h-10 rounded-lg border border-line px-3 text-sm text-ink disabled:opacity-50" disabled={!branchId || shiftsLoading} onClick={() => refreshShifts(branchId, { branchId, status, employeeId })}>Refresh</button>
      </div>
      {branchesError && <p role="alert" className="mt-2 text-xs text-danger">{branchesError}</p>}
      {shiftsError && <div role="alert" className="mt-3 flex items-center justify-between gap-3 text-sm text-danger"><span>{shiftsError}</span><button type="button" className="underline" onClick={() => refreshShifts(branchId, { branchId, status, employeeId })}>Retry</button></div>}
      {shiftsLoading && <p className="m-0 mt-2 text-xs text-muted">Loading shifts…</p>}
      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        {activeShift ? (
          <section className="rounded-2xl bg-accent p-5 text-white">
            <div className="flex items-start justify-between"><span className="text-xs text-white/70">Active shift for selected branch</span><Clock size={18} className="text-white/70" aria-hidden="true" /></div>
            <h2 className="m-0 mt-1 text-xl font-bold">{activeShift.register || 'Register'}{activeShift.branch || activeBranchName ? ` • ${activeShift.branch || activeBranchName}` : ''}</h2>
            <p className="m-0 mt-1 text-sm text-white/85">Employee: {activeShift.employee || workerFor(activeShift)?.name || '—'}{activeShift.startedAt != null ? ` • Started ${activeShift.startedLabel} • ${formatDuration(minutesSince(activeShift.startedAt, now))} ago` : ''}</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[['Orders', activeShift.orders ?? '—'], ['Sales', amount(activeShift.totalSales)], ['Cash in drawer', expected == null ? '—' : amount(expected)]].map(([label, value]) => <div key={label} className="rounded-lg bg-white/10 px-3 py-2.5"><div className="text-[11px] text-white/70">{label}</div><div className="mt-0.5 text-sm font-bold">{value}</div></div>)}
            </div>
            <button type="button" onClick={() => setEnding(activeShift)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-accent hover:bg-page"><Square size={16} aria-hidden="true" />End shift</button>
          </section>
        ) : (
          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 text-base font-bold text-ink">You’re not on shift</h2>
            <p className="m-0 mt-1 text-sm text-muted">{branchId ? 'No active shift was returned for the selected branch.' : 'Select a branch to check its active shift.'}</p>
            <button type="button" className={`${btn} mt-4`} disabled={!branchId} onClick={() => setStarting(true)}><Play size={16} aria-hidden="true" />Start shift</button>
          </section>
        )}
        <section className={`${cardClass} p-5`}>
          <h2 className="m-0 text-base font-bold text-ink">Also on shift</h2>
          <p className="m-0 mt-0.5 text-xs text-muted">{activeShifts.filter((shift) => shift.id !== activeShift?.id).length} other active register(s)</p>
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {activeShifts.filter((shift) => shift.id !== activeShift?.id).map((shift) => {
              const worker = workerFor(shift)
              return <li key={shift.id} className="flex items-center gap-3"><Avatar name={shift.employee || worker?.name || '?'} tone={worker?.tone} size="h-10 w-10 text-xs" /><div className="leading-tight"><div className="text-sm font-bold text-ink">{shift.employee || worker?.name || '—'}</div><div className="text-xs text-muted">{[shift.register, shift.branch].filter(Boolean).join(' • ')}</div></div><div className="ml-auto text-right leading-tight"><div className="text-sm font-bold text-ink">{amount(shift.totalSales)}</div><div className="text-xs text-muted">{shift.startedAt == null ? '—' : formatDuration(minutesSince(shift.startedAt, now))}</div></div></li>
            })}
            {!activeShifts.some((shift) => shift.id !== activeShift?.id) && <li className="text-xs text-muted">No other active shifts returned.</li>}
          </ul>
        </section>
      </div>
      <section className={`${cardClass} mt-4 pt-5`}>
        <div className="mb-3 flex items-center justify-between px-5"><h2 className="m-0 text-base font-bold text-ink">Shift history</h2><span className="text-xs text-muted">{history.length} record(s)</span></div>
        <ShiftHistory rows={historyRows} />
      </section>
      {starting && <StartShiftModal onClose={() => setStarting(false)} />}
      {ending && <EndShiftModal shift={ending} now={now} onClose={() => setEnding(null)} />}
    </PageContainer>
  )
}
