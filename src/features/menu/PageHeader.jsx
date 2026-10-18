import { CirclePlus } from 'lucide-react'

export default function PageHeader({ productCount, unavailableCount }) {
  return (
    <header className="menu-page-header">
      <div>
        <h1>Menu Catalog</h1>
        <p>{productCount} products • {unavailableCount} unavailable at Cairo Downtown</p>
      </div>
      <button className="menu-add-button" type="button">
        <CirclePlus size={18} strokeWidth={1.8} />
        Add Product
      </button>
    </header>
  )
}
