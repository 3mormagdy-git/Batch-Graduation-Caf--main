import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftRight, MapPin, Pencil, Plus, TrendingUp } from 'lucide-react'
import { PageContainer, PageTitle, cardClass, primaryButton } from '@/features/tables/shared.jsx'
import { useStaff } from '@/features/staff/StaffContext.jsx'
import { useBranches, staffCount } from './BranchContext.jsx'
import { WeekBarChart } from './components/Charts.jsx'
import ReportModal from './components/ReportModal.jsx'
import { ErrorPanel, StatusBadge } from './components/parts.jsx'
import { aov, chainStats, formatEGP, hours } from './branchesData.js'

const Growth = ({ value }) => (value == null ? null : (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold ${value >= 0 ? 'text-success' : 'text-danger'}`}>
    <TrendingUp size={12} aria-hidden="true" className={value < 0 ? 'rotate-180' : ''} />{Math.abs(value)}% <span className="font-normal text-muted">vs last week</span>
  </span>
))

export default function BranchesPage() {
  const { branches, loading, loadError, refreshing, loadBranches, switchBranch, activeBranchId } = useBranches()
  const { employees } = useStaff()
  const navigate = useNavigate()
  const [report, setReport] = useState(false)
  const stats = chainStats(branches)
  const maxAov = Math.max(1, ...branches.map(aov))

  if (loading) return <PageContainer><p className="text-sm text-muted">Loading branches…</p></PageContainer>
  if (loadError && !branches.length) return <PageContainer><ErrorPanel message={loadError} onRetry={() => loadBranches()} /></PageContainer>

  const card = `${cardClass} p-5`
  const label = 'text-[13px] text-muted'
  return (
    <PageContainer>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageTitle title="All branches" subtitle={`${branches.length} location${branches.length === 1 ? '' : 's'} managed from one account`} />
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => loadBranches(true)} disabled={refreshing} className="text-[13px] font-medium text-muted hover:text-ink disabled:opacity-60">{refreshing ? 'Refreshing…' : 'Refresh'}</button>
        <button type="button" onClick={() => navigate('/branches/new')} className={`${primaryButton} h-10 px-5 text-sm`}><Plus size={18} aria-hidden="true" />Add branch</button>
        </div>
      </div>

      {loadError && <p role="alert" className="mt-3 text-sm text-danger">Couldn’t refresh: {loadError}</p>}

      <div className="mt-5 grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-accent p-5 text-white">
          <div className="text-[13px] text-white/75">Chain sales today</div>
          <div className="mt-2 text-[26px] font-bold leading-8">{formatEGP(stats.sales)}</div>
          {stats.salesGrowth != null && <div className="mt-2 text-xs"><span className="font-semibold">{stats.salesGrowth >= 0 ? '▲' : '▼'} {Math.abs(stats.salesGrowth)}%</span> <span className="text-white/70">vs last week</span></div>}
        </div>
        <div className={card}><div className={label}>Orders today</div><div className="mt-2 text-[26px] font-bold leading-8 text-ink">{stats.orders.toLocaleString('en-US')}</div></div>
        <div className={card}><div className={label}>Open now</div><div className="mt-2 text-[26px] font-bold leading-8 text-ink">{stats.open} / {stats.total}</div><div className="mt-1 text-xs text-muted">branches</div></div>
        <div className={card}>
          <div className={label}>Top branch</div>
          <div className="mt-2 truncate text-[26px] font-bold leading-8 text-ink">{stats.top ? stats.top.name : '—'}</div>
          <div className="mt-1 text-xs text-muted">{stats.top ? formatEGP(stats.top.salesToday) : 'No sales yet'}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className={cardClass}>
          <h2 className="m-0 px-5 pt-4 text-[15px] font-bold text-ink">Branch list</h2>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] text-muted">
                  <th className="px-5 py-2 font-medium">Branch</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Hours</th>
                  <th className="px-3 py-2 font-medium">Floor</th><th className="px-3 py-2 text-right font-medium">Sales today</th><th className="px-5 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!branches.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">No branches yet. Use “Add branch” to create the first one.</td></tr>}
                {branches.map((branch) => (
                  <tr key={branch.id} onClick={() => navigate(`/branches/${branch.id}`)} className="cursor-pointer border-t border-line hover:bg-sand-light">
                    <td className="px-5 py-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/branches/${branch.id}`) }} className="text-left">
                        <span className="text-[13px] font-semibold text-ink">{branch.name}</span> <span className="text-[11px] text-muted">{branch.code}</span>
                        {branch.id === activeBranchId && <span className="ml-1.5 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">Active</span>}
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><MapPin size={11} aria-hidden="true" />{branch.area} • {staffCount(employees, branch.id)} staff</span>
                      </button>
                    </td>
                    <td className="px-3 py-3"><StatusBadge open={branch.open} /></td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-muted">{hours(branch)}</td>
                    <td className="px-3 py-3 text-[13px] text-muted" title={`${branch.tables.inUse} of ${branch.tables.total} tables in use`}>{branch.tables.inUse}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-[13px] font-bold text-ink">{formatEGP(branch.salesToday, branch.settings.currency)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" title="Switch to branch" aria-label={`Switch to ${branch.name}`} disabled={branch.id === activeBranchId}
                          onClick={(e) => { e.stopPropagation(); switchBranch(branch.id) }} className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink disabled:opacity-40"><ArrowLeftRight size={15} aria-hidden="true" /></button>
                        <button type="button" title="Edit branch" aria-label={`Edit ${branch.name}`}
                          onClick={(e) => { e.stopPropagation(); navigate(`/branches/${branch.id}/edit`) }} className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"><Pencil size={15} aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${cardClass} p-5`}>
          <h2 className="m-0 text-[15px] font-bold text-ink">Performance comparison</h2>
          <p className="m-0 text-xs text-muted">Average order value today</p>
          <div className="mt-4 flex flex-col gap-4">
            {branches.map((branch) => (
              <div key={branch.id}>
                <div className="flex justify-between text-[13px]"><span className="font-semibold text-ink">{branch.name}</span><span className="font-bold text-ink">{formatEGP(aov(branch), branch.settings.currency)}</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-accent" style={{ width: `${(aov(branch) / maxAov) * 100}%` }} /></div>
                <div className="mt-1 text-[11px] text-muted">{branch.ordersToday} orders</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={`${cardClass} mt-4 p-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-[15px] font-bold text-ink">Chain sales this week</h2>
          <button type="button" onClick={() => setReport(true)} className="text-[13px] font-medium text-ink underline underline-offset-2 hover:text-accent">Branch report</button>
        </div>
        <div className="mt-3"><WeekBarChart sales={stats.week.sales} orders={stats.week.orders} /></div>
      </section>
      {report && <ReportModal title="Chain report" week={stats.week} onClose={() => setReport(false)} />}
    </PageContainer>
  )
}
