import { CirclePlus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PageHeader({ productCount, unavailableCount }) {
  return (
    <header className="menu-page-header">
      <div>
        <h1>Menu Catalog</h1>
        <p>{productCount} products • {unavailableCount} unavailable at Cairo Downtown</p>
      </div>
      <Link className="menu-add-button" to="/menu/new">
        <CirclePlus size={18} strokeWidth={1.8} />
        Add Product
      </Link>
    </header>
  )
}
