import { CirclePlus } from 'lucide-react'

export default function PageHeader() {
  return (
    <header className="menu-page-header">
      <div>
        <h1>Menu Catalog</h1>
        <p>15 products • 1 unavailable at Cairo Downtown</p>
      </div>
      <button className="menu-add-button bg-accent hover:bg-accent-hover text-white" type="button">
        <CirclePlus size={18} strokeWidth={1.8} />
        Add Product
      </button>
    </header>
  )
}
