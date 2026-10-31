import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, BarChart3, MapPin, Pencil, Phone } from 'lucide-react'
import Toggle from '@/components/ui/Toggle.jsx'
import { BackLink, PageContainer, PageTitle, cardClass, outlineButton, primaryButton } from '@/features/tables/shared.jsx'
import { useStaff } from '@/features/staff/StaffContext.jsx'
import { useBranches, staffCount } from './BranchContext.jsx'
import { WeekAreaChart } from './components/Charts.jsx'
import MenuTab from './components/MenuTab.jsx'
import ReportModal from './components/ReportModal.jsx'
import SettingsTab from './components/SettingsTab.jsx'
import StaffTab from './components/StaffTab.jsx'
import { ErrorPanel, NotFound } from './components/parts.jsx'
import { aov, formatEGP, hours, weekGrowth } from './branchesData.js'

const TABS = [['overview', 'Overview'], ['settings', 'Settings'], ['staff', 'Staff'], ['menu', 'Menu availability']]

function Kpi({ label, value, primary, children }) {
  return (
    <div className={`rounded-2xl p-5 ${primary ? 'bg-accent text-white' : `${cardClass}`}`}>
      <div className={`text-[13px] ${primary ? 'text-white/75' : 'text-muted'}`}>{label}</div>
      <div className={`mt-2 text-2xl font-bold leading-8 ${primary ? '' : 'text-ink'}`}>{value}</div>
      {children}
    </div>
  )
}

function Overview({ branch, onReport }) {
  const { currency, vat, serviceCharge, acceptDelivery, deliveryFee } = branch.settings
  const growth = weekGrowth(branch.week.sales, branch.week.prevSales)
  const rows = [
    ['Code', branch.code], ['Manager', branch.manager || '—'], ['Opening hours', hours(branch).replace(' - ', ' – ')],
    ['Currency', currency], ['VAT', `${vat}%`], ['Service charge', `${serviceCharge}% (dine-in)`],
    ['Delivery', acceptDelivery ? `Yes • ${deliveryFee} ${currency}` : 'No'],
  ]
  return (
    <>
      <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 xl:grid-cols-4">
        <Kpi primary label="Sales today" value={formatEGP(branch.salesToday, currency)}>
          <div className="mt-2 text-xs">{growth == null ? <span className="text-white/70">No weekly comparison yet</span> : <><span className="font-semibold">{growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%</span> <span className="text-white/70">vs last week</span></>}</div>
        </Kpi>
        <Kpi label="Orders today" value={branch.ordersToday} />
        <Kpi label="Average order" value={formatEGP(aov(branch), currency)} />
        <Kpi label="Tables in use" value={`${branch.tables.inUse} / ${branch.tables.total}`} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className={`${cardClass} p-5`}>
          <div className="flex items-center justify-between"><h2 className="m-0 text-[15px] font-bold text-ink">Sales this week</h2>
            <button type="button" onClick={onReport} className="text-[13px] font-medium text-ink underline underline-offset-2 hover:text-accent">Report</button></div>
          <div className="mt-3"><WeekAreaChart sales={branch.week.sales} prevSales={branch.week.prevSales} orders={branch.week.orders} /></div>
        </section>
        <section className={`${cardClass} p-5`}>
          <h2 className="m-0 text-[15px] font-bold text-ink">Branch profile</h2>
          <dl className="m-0 mt-4 flex flex-col gap-3">
            {rows.map(([name, value]) => (
              <div key={name} className="flex justify-between gap-4 text-[13px]"><dt className="text-muted">{name}</dt><dd className="m-0 text-right font-semibold text-ink">{value}</dd></div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}

export default function BranchDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { getBranch, loading, refreshBranch, setBranchStatus, switchBranch, activeBranchId } = useBranches()
  const { employees } = useStaff()
  const [report, setReport] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [checked, setChecked] = useState(false) // true once GET /api/branches/:id has answered
  const [fetchError, setFetchError] = useState(null)
  const branch = getBranch(id)

  // Re-fetch the selected branch from the API whenever it is opened (also covers direct links).
  useEffect(() => {
    if (loading) return undefined
    let cancelled = false
    setChecked(false)
    refreshBranch(id).then(({ error }) => { if (!cancelled) { setFetchError(error || null); setChecked(true) } })
    return () => { cancelled = true }
  }, [id, loading, refreshBranch])

  if (loading || (!branch && !checked)) return <PageContainer><p className="text-sm text-muted">Loading branch…</p></PageContainer>
  if (!branch) {
    return (
      <PageContainer>
        {fetchError && fetchError.status !== 404
          ? <ErrorPanel message={fetchError.message} onRetry={() => { setChecked(false); refreshBranch(id).then(({ error }) => { setFetchError(error || null); setChecked(true) }) }} />
          : <NotFound />}
      </PageContainer>
    )
  }

  const tab = TABS.some(([key]) => key === params.get('tab')) ? params.get('tab') : 'overview'
  const toggleStatus = async () => { if (toggling) return; setToggling(true); await setBranchStatus(branch.id, !branch.open); setToggling(false) }
  const isActive = branch.id === activeBranchId

  return (
    <PageContainer>
      <BackLink to="/branches">All branches</BackLink>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PageTitle title={branch.name} />
          <p className="m-0 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1"><MapPin size={13} aria-hidden="true" />{branch.address}</span>
            <span className="inline-flex items-center gap-1"><Phone size={13} aria-hidden="true" />{branch.phone}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="mr-1 inline-flex items-center gap-2 text-[13px] text-ink">{branch.open ? 'Open' : 'Closed'}
            <Toggle checked={branch.open} onChange={toggleStatus} label={`${branch.name} open status`} /></span>
          <button type="button" className={outlineButton} onClick={() => setReport(true)}><BarChart3 size={16} aria-hidden="true" />Reports</button>
          <button type="button" className={outlineButton} disabled={isActive} onClick={() => switchBranch(branch.id)} title={isActive ? 'This is the active branch' : undefined}>
            <ArrowLeftRight size={16} aria-hidden="true" />{isActive ? 'Active branch' : 'Switch to branch'}</button>
          <button type="button" className={`${primaryButton} h-10 px-4 text-sm`} onClick={() => navigate(`/branches/${branch.id}/edit`)}><Pencil size={15} aria-hidden="true" />Edit</button>
        </div>
      </div>

      <div role="tablist" aria-label="Branch sections" className="mt-5 inline-flex max-w-full overflow-x-auto rounded-xl bg-sand p-1">
        {TABS.map(([key, text]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setParams(key === 'overview' ? {} : { tab: key })}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[13px] font-medium ${tab === key ? 'bg-card text-ink shadow-sm' : 'text-muted hover:text-ink'}`}>
            {text}{key === 'staff' && <span className="ml-1.5 text-[11px] text-muted">{staffCount(employees, branch.id)}</span>}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'overview' && <Overview branch={branch} onReport={() => setReport(true)} />}
        {tab === 'settings' && <SettingsTab key={branch.id} branch={branch} />}
        {tab === 'staff' && <StaffTab branch={branch} />}
        {tab === 'menu' && <MenuTab branch={branch} />}
      </div>
      {report && <ReportModal title={`${branch.name} report`} week={branch.week} currency={branch.settings.currency} onClose={() => setReport(false)} />}
    </PageContainer>
  )
}
