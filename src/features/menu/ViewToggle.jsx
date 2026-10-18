import { LayoutGrid, List } from 'lucide-react'

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="menu-view-toggle" role="group" aria-label="Product view">
      <button
        className={view === 'grid' ? 'active' : ''}
        type="button"
        aria-label="Grid view"
        aria-pressed={view === 'grid'}
        onClick={() => onChange('grid')}
      >
        <LayoutGrid size={18} strokeWidth={1.8} />
      </button>
      <button
        className={view === 'list' ? 'active' : ''}
        type="button"
        aria-label="List view"
        aria-pressed={view === 'list'}
        onClick={() => onChange('list')}
      >
        <List size={18} strokeWidth={1.8} />
      </button>
    </div>
  )
}
