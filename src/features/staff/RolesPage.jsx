import { useState } from 'react'
import { Lock } from 'lucide-react'
import { PageContainer, cardClass } from '@/features/tables/shared.jsx'
import { PERMISSIONS, ROLES } from './staffData.js'
import { useStaff } from './StaffContext.jsx'
import { StaffHeading, StaffTabs, btn, checkboxClass } from './ui.jsx'

const EDITABLE_ROLES = ['cashier', 'kitchen']
const sameSet = (a, b) => a.length === b.length && a.every((key) => b.includes(key))

export default function RolesPage() {
  const { employees, roles, rolesError, roleDefaults, saveRoleDefaults } = useStaff()
  const [draft, setDraft] = useState(roleDefaults)

  const dirty = EDITABLE_ROLES.some((role) => !sameSet(draft[role], roleDefaults[role]))
  const people = (role) => employees.filter((employee) => employee.role === role).length

  const toggle = (role, key) => setDraft((current) => ({
    ...current,
    [role]: current[role].includes(key) ? current[role].filter((item) => item !== key) : [...current[role], key],
  }))

  const groups = []
  PERMISSIONS.forEach((permission) => {
    const last = groups[groups.length - 1]
    if (last && last.name === permission.group) last.items.push(permission)
    else groups.push({ name: permission.group, items: [permission] })
  })

  return (
    <PageContainer>
      <StaffHeading
        subtitle="Default permissions applied when an employee is given a role."
        action={<button type="button" className={btn} disabled={!dirty} onClick={() => saveRoleDefaults(draft)}>Save changes</button>}
      />
      <StaffTabs />

      {rolesError && <p role="alert" className="mt-3 text-xs text-danger">{rolesError}</p>}
      {roles.length > 0 && <p className="mt-3 text-xs text-muted">Backend roles: {roles.map((role) => typeof role === 'string' ? role : role.name || role.role || role.label).filter(Boolean).join(', ')}</p>}
      <p className="mt-2 text-xs text-muted">Global role defaults below are saved in this browser only; the backend currently documents read-only role definitions. Employee-specific permissions are saved through employee updates.</p>
      <section className={`${cardClass} mt-4 overflow-x-auto`}>
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="h-[52px] text-[11px] font-medium text-muted">
              <th className="pl-4 font-medium">Permission</th>
              {Object.entries(ROLES).map(([role, { label }]) => (
                <th key={role} className="w-[140px] text-center font-medium">
                  <div className="text-[13px] font-bold text-ink">{label}</div>
                  <div>{people(role)} people</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <GroupRows key={group.name} group={group} draft={draft} onToggle={toggle} />
            ))}
          </tbody>
        </table>
      </section>
      <p className="mt-4 text-xs text-muted">Managers always have full access. Individual employees can have extra permissions granted on their profile.</p>
    </PageContainer>
  )
}

function GroupRows({ group, draft, onToggle }) {
  return (
    <>
      <tr className="h-8 border-y border-line bg-sand-light"><th colSpan={4} className="pl-4 text-[11px] font-semibold text-muted">{group.name}</th></tr>
      {group.items.map((permission) => (
        <tr key={permission.key} className="h-[48px] border-b border-line last:border-b-0">
          <td className="pl-4 text-ink">{permission.label}</td>
          <td className="text-center"><Lock size={15} strokeWidth={1.8} className="mx-auto text-muted" aria-label="Always granted" /></td>
          {EDITABLE_ROLES.map((role) => (
            <td key={role} className="text-center">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={draft[role].includes(permission.key)}
                onChange={() => onToggle(role, permission.key)}
                aria-label={`${permission.label} for ${ROLES[role].label}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
