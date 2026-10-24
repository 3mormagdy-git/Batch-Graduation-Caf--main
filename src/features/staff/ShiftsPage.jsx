import { useEffect, useState } from 'react'
import { Clock, Play, Square } from 'lucide-react'
import { PageContainer, cardClass } from '@/features/tables/shared.jsx'
import { expectedInDrawer, formatDuration, formatWhole, minutesSince } from './staffData.js'
import { useStaff } from './StaffContext.jsx'
import ShiftHistory from './ShiftHistory.jsx'
import { EndShiftModal, StartShiftModal } from './ShiftModals.jsx'
import { Avatar, StaffHeading, StaffTabs, btn } from './ui.jsx'

function useNow() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export default function ShiftsPage() {
  const { activeShift, otherShifts, employees, history } = useStaff()
  const [starting, setStarting] = useState(false)
  // Snapshot of the shift being ended: the modal must outlive the shift (it shows the "Shift closed" step).
  const [ending, setEnding] = useState(null)
  const now = useNow()
  
  return (
    <PageContainer>
      <StaffHeading subtitle="Open and close registers, and reconcile cash." />
      <StaffTabs />

      <div className="mt-4 grid gap-3.5 md:grid-cols-2">
        {activeShift ? (
          <section className="rounded-2xl bg-accent p-5 text-white">
            <div className="flex items-start justify-between">
              <span className="text-xs text-white/70">Your active shift</span>
              <Clock size={18} strokeWidth={1.8} className="text-white/70" aria-hidden="true" />
            </div>
            <h2 className="m-0 mt-1 text-xl font-bold">{activeShift.register} • {activeShift.branch}</h2>
            <p className="m-0 mt-1 text-sm text-white/85">Started {activeShift.startedLabel} • {formatDuration(minutesSince(activeShift.startedAt, now))} ago</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                ['Orders', activeShift.orders],
                ['Sales', formatWhole(activeShift.totalSales)],
                ['Cash in drawer', formatWhole(expectedInDrawer(activeShift))],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/10 px-3 py-2.5">
                  <div className="text-[11px] text-white/70">{label}</div>
                  <div className="mt-0.5 text-sm font-bold">{value}</div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setEnding(activeShift)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-accent hover:bg-page">
              <Square size={16} strokeWidth={2} aria-hidden="true" />End shift
            </button>
          </section>
        ) : (
          <section className={`${cardClass} p-5`}>
            <h2 className="m-0 text-base font-bold text-ink">You’re not on shift</h2>
            <p className="m-0 mt-1 text-sm text-muted">Start a shift to open a register and take payments at Cairo Downtown.</p>
            <button type="button" onClick={() => setStarting(true)} className={`${btn} mt-4`}>
              <Play size={16} strokeWidth={2} aria-hidden="true" />Start shift
            </button>
          </section>
        )}

        <section className={`${cardClass} p-5`}>
          <h2 className="m-0 text-base font-bold text-ink">Also on shift</h2>
          <p className="m-0 mt-0.5 text-xs text-muted">{otherShifts.length} other register{otherShifts.length === 1 ? '' : 's'} open</p>
          <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
            {otherShifts.map((shift) => {
              const worker = employees.find((employee) => employee.id === shift.employeeId)
              return (
                <li key={shift.employeeId} className="flex items-center gap-3">
                  <Avatar name={worker?.name || '?'} tone={worker?.tone} size="h-10 w-10 text-xs" />
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-ink">{worker?.name}</div>
                    <div className="text-xs text-muted">{shift.register} • {shift.branch}</div>
                  </div>
                  <div className="ml-auto text-right leading-tight">
                    <div className="text-sm font-bold text-ink">{formatWhole(shift.sales)}</div>
                    <div className="text-xs text-muted">{formatDuration(minutesSince(shift.startedAt, now))}</div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section className={`${cardClass} mt-4 pt-5`}>
        <h2 className="m-0 mb-3 px-5 text-base font-bold text-ink">Shift history</h2>
        <ShiftHistory rows={history} />
      </section>

      {starting && <StartShiftModal onClose={() => setStarting(false)} />}
      {ending && <EndShiftModal shift={ending} now={now} onClose={() => setEnding(null)} />}
    </PageContainer>
  )
}
