import { useState } from 'react'
import { btn } from '@/features/staff/ui.jsx'
import { cardClass } from '@/features/tables/shared.jsx'
import { useBranches } from '../BranchContext.jsx'
import { fromSettings, toSettings, validateSettings } from '../validation.js'
import SettingsFields from './SettingsFields.jsx'

export default function SettingsTab({ branch }) {
  const { saveSettings, notify } = useBranches()
  const [values, setValues] = useState(() => fromSettings(branch.settings))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (saving) return
    const found = validateSettings(values)
    setErrors(found)
    if (Object.keys(found).length) { notify('Fix the highlighted fields first.', 'error'); return }
    setSaving(true)
    await saveSettings(branch.id, toSettings(values))
    setSaving(false)
  }

  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="m-0 text-[15px] font-bold text-ink">Branch settings</h2>
      <p className="m-0 mb-4 text-xs text-muted">These apply only to this branch. Chain-wide defaults live in Settings.</p>
      <SettingsFields values={values} errors={errors} onChange={(next) => { setValues(next); setErrors({}) }} idPrefix="tab" />
      <div className="mt-5 flex justify-end"><button type="button" className={btn} disabled={saving} onClick={submit}>{saving ? 'Saving…' : 'Save settings'}</button></div>
    </section>
  )
}
