import { useState } from 'react'
import { Check, ChevronDown, Play } from 'lucide-react'
import {
  BRANCHES, DENOMINATIONS, REGISTERS, countedTotal, differenceOf, expectedInDrawer, formatDuration,
  formatMoney, minutesSince,
} from './staffData.js'
import { useStaff } from './StaffContext.jsx'
import { Modal, btn, btnDanger, btnOutline, inputClass } from './ui.jsx'

function Select({ label, value, onChange, options }) {
  return (
    <label className="mb-4 block text-[13px] font-medium text-ink">
      {label}
      <span className="relative mt-1.5 block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-9`}>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" className="pointer-events-none absolute right-3 top-3 text-muted" />
      </span>
    </label>
  )
}

export function StartShiftModal({ onClose }) {
  const { startShift, otherShifts } = useStaff()
  const [branch, setBranch] = useState(BRANCHES[0].name)
  const [register, setRegister] = useState(REGISTERS[0])
  const [float, setFloat] = useState('')
  const [error, setError] = useState('')

  const submit = () => {
    const openingFloat = Number(float)
    if (float.trim() === '' || Number.isNaN(openingFloat) || openingFloat < 0) {
      setError('Enter the opening cash float.')
      return
    }
    if (otherShifts.some((shift) => shift.branch === branch && shift.register === register)) {
      setError('This register is already open.')
      return
    }
    startShift({ branch, register, openingFloat })
    onClose()
  }

  return (
    <Modal
      title="Start shift"
      onClose={onClose}
      width="max-w-[448px]"
      footer={(
        <>
          <button type="button" className={btnOutline} onClick={onClose}>Cancel</button>
          <button type="button" className={btn} onClick={submit}><Play size={16} strokeWidth={2} aria-hidden="true" />Open register</button>
        </>
      )}
    >
      <Select label="Branch" value={branch} onChange={setBranch} options={BRANCHES.map((item) => item.name)} />
      <Select label="Register" value={register} onChange={setRegister} options={REGISTERS} />
      <label className="block text-[13px] font-medium text-ink">
        Opening cash float
        <span className="relative mt-1.5 block">
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={float}
            onChange={(event) => { setFloat(event.target.value); setError('') }}
            className={`${inputClass} pr-14`}
          />
          <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-muted">EGP</span>
        </span>
      </label>
      <p className={`m-0 mt-1.5 text-xs ${error ? 'text-danger' : 'text-muted'}`}>{error || 'Count the drawer before your first sale'}</p>
    </Modal>
  )
}

const TILE = 'rounded-xl bg-sand-light px-3.5 py-3'

export function EndShiftModal({ shift, now, onClose }) {
  const { endShift } = useStaff()
  const [step, setStep] = useState('summary') // summary → count → review → done
  const [counts, setCounts] = useState({})
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState(0)

  const expected = expectedInDrawer(shift)
  const counted = countedTotal(counts)
  const difference = differenceOf(expected, counted)
  const subtitle = `${shift.register} • ${shift.branch}`

  if (step === 'summary') {
    const tiles = [
      ['Duration', formatDuration(minutesSince(shift.startedAt, now))],
      ['Orders', shift.orders],
      ['Total sales', formatMoney(shift.totalSales)],
      ['Cash sales', formatMoney(shift.cashSales)],
      ['Opening float', formatMoney(shift.openingFloat)],
      ['Expected in drawer', formatMoney(expected)],
    ]
    return (
      <Modal
        title="End shift"
        subtitle={subtitle}
        onClose={onClose}
        footer={(
          <>
            <button type="button" className={btnOutline} onClick={onClose}>Keep shift open</button>
            <button type="button" className={btn} onClick={() => setStep('count')}>Count cash drawer</button>
          </>
        )}
      >
        <div className="grid grid-cols-2 gap-3">
          {tiles.map(([label, value]) => (
            <div key={label} className={TILE}>
              <div className="text-xs text-muted">{label}</div>
              <div className="mt-1 text-base font-bold text-ink">{value}</div>
            </div>
          ))}
        </div>
      </Modal>
    )
  }

  if (step === 'count') {
    return (
      <Modal
        title="End shift"
        subtitle={subtitle}
        onClose={onClose}
        footer={(
          <>
            <button type="button" className={btnOutline} onClick={() => setStep('summary')}>Back</button>
            <button type="button" className={btn} onClick={() => setStep('review')}>Review difference</button>
          </>
        )}
      >
        <p className="m-0 mb-3 text-[13px] text-muted">Enter the number of notes and coins for each denomination.</p>
        <div className="grid grid-cols-4 gap-2.5">
          {DENOMINATIONS.map((value) => (
            <label key={value} className="rounded-xl border border-line px-3 py-2.5 text-xs font-medium text-muted focus-within:border-accent">
              {value} EGP
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="0"
                value={counts[value] ?? ''}
                onChange={(event) => setCounts((current) => ({ ...current, [value]: event.target.value }))}
                className="mt-1 block w-full border-0 bg-transparent p-0 text-lg font-semibold text-ink placeholder:text-muted/60 focus:outline-none"
              />
            </label>
          ))}
        </div>
        <div className={`${TILE} mt-3.5 flex items-center justify-between`}>
          <span className="text-[13px] text-muted">Counted total</span>
          <strong className="text-xl text-ink">{formatMoney(counted)}</strong>
        </div>
      </Modal>
    )
  }

  if (step === 'review') {
    const balanced = difference === 0
    const label = balanced ? 'Balanced' : difference < 0 ? 'Short' : 'Over'
    const tone = balanced ? 'bg-success-soft text-success' : difference < 0 ? 'bg-[#fbe9ea] text-danger' : 'bg-[#fbf1e0] text-[#9a6412]'
    const confirm = () => {
      if (!balanced && !explanation.trim()) {
        setError('Add an explanation for the difference.')
        return
      }
      setResult(endShift({ counted, explanation: explanation.trim() }))
      setStep('done')
    }
    return (
      <Modal
        title="End shift"
        subtitle={subtitle}
        onClose={onClose}
        footer={(
          <>
            <button type="button" className={btnOutline} onClick={() => setStep('count')}>Recount</button>
            <button type="button" className={balanced ? btn : btnDanger} onClick={confirm}>Confirm &amp; end shift</button>
          </>
        )}
      >
        <div className="overflow-hidden rounded-xl border border-line text-[13px]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="text-muted">Expected</span><strong className="text-ink">{formatMoney(expected)}</strong></div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3"><span className="text-muted">Counted</span><strong className="text-ink">{formatMoney(counted)}</strong></div>
          <div className={`flex items-center justify-between px-4 py-3.5 ${tone}`}>
            <strong>{label}</strong>
            <strong className="text-xl">{balanced ? formatMoney(0) : `${difference > 0 ? '+' : '-'}${formatMoney(Math.abs(difference))}`}</strong>
          </div>
        </div>
        {!balanced && (
          <label className="mt-4 block text-[13px] font-medium text-ink">
            Explanation <span className="text-accent">*</span>
            <textarea
              rows={3}
              value={explanation}
              onChange={(event) => { setExplanation(event.target.value); setError('') }}
              placeholder="e.g. Refunded 45 EGP in cash without a ticket"
              className="mt-1.5 block w-full resize-none rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-[rgb(120_38_61/25%)]"
            />
            {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
          </label>
        )}
      </Modal>
    )
  }

  const message = result === 0
    ? 'The drawer matches the expected cash.'
    : `Recorded a ${result > 0 ? 'surplus' : 'shortage'} of ${formatMoney(Math.abs(result))}.`
  return (
    <Modal title="Shift closed" onClose={onClose} footer={<button type="button" className={btn} onClick={onClose}>Done</button>}>
      <div className="flex flex-col items-center py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-success text-success"><Check size={22} strokeWidth={2.2} aria-hidden="true" /></span>
        <h3 className="m-0 mt-4 text-base font-bold text-ink">Drawer reconciled</h3>
        <p className="m-0 mt-1.5 max-w-[320px] text-[13px] text-muted">{message} The Z-report was sent to the branch manager.</p>
      </div>
    </Modal>
  )
}
