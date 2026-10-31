import { useState } from 'react'
import { Coffee } from 'lucide-react'
import Toggle from '@/components/ui/Toggle.jsx'
import { menuItems } from '@/data/menu.js'
import { cardClass } from '@/features/tables/shared.jsx'
import { useBranches } from '../BranchContext.jsx'

function Thumb({ src, name }) {
  const [failed, setFailed] = useState(false)
  return failed || !src
    ? <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-beige text-muted"><Coffee size={16} aria-hidden="true" /></span>
    : <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-10 w-10 shrink-0 rounded-lg object-cover" title={name} />
}

// Availability is stored per branch (BranchContext); product records come from the shared menu data.
export default function MenuTab({ branch }) {
  const { availability, setMenuAvailability } = useBranches()
  const mine = availability[branch.id] || {}
  return (
    <section className={cardClass}>
      <div className="px-5 py-4">
        <h2 className="m-0 text-[15px] font-bold text-ink">Menu availability</h2>
        <p className="m-0 mt-0.5 text-xs text-muted">Turn items on or off for {branch.name}. Other branches are not affected.</p>
      </div>
      <ul className="m-0 list-none p-0">
        {menuItems.map((item) => {
          const on = mine[item.sku] ?? item.available
          return (
            <li key={item.sku} className="flex items-center gap-3 border-t border-line px-5 py-2.5">
              <Thumb src={item.image} name={item.name} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-ink">{item.name}</div>
                <div className="text-[11px] text-muted">{item.sku}</div>
              </div>
              <span className="whitespace-nowrap text-xs font-semibold text-ink">{item.price} {branch.settings.currency}</span>
              <Toggle checked={on} onChange={() => setMenuAvailability(branch.id, item.sku, !on)} label={`${item.name} available at ${branch.name}`} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
