import { useMemo, useState } from 'react'
import { Info, Search } from 'lucide-react'
import { menuItems } from '../../data/menu.js'
import CategoryTabs from './CategoryTabs.jsx'
import PageHeader from './PageHeader.jsx'
import ProductGrid from './ProductGrid.jsx'
import ViewToggle from './ViewToggle.jsx'
import './MenuPage.css'

const categories = [
  { name: 'All', count: 15 },
  { name: 'Hot Coffee', count: 4 },
  { name: 'Iced Drinks', count: 3 },
  { name: 'Seasonal Specials', count: 2 },
  { name: 'Bakery', count: 3 },
  { name: 'Desserts', count: 3 },
]

export default function MenuPage() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('grid')
  const [availability, setAvailability] = useState(() => (
    Object.fromEntries(menuItems.map((item) => [item.sku, item.available]))
  ))

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return menuItems.filter((item) => (
      (category === 'All' || item.category === category)
      && (!normalizedQuery
        || item.name.toLowerCase().includes(normalizedQuery)
        || item.sku.toLowerCase().includes(normalizedQuery))
    ))
  }, [category, query])

  const toggleAvailability = (sku) => {
    setAvailability((current) => ({ ...current, [sku]: !current[sku] }))
  }

  return (
    <div className="menu-page">
      <PageHeader />
      <div className="menu-toolbar">
        <CategoryTabs categories={categories} selected={category} onSelect={setCategory} />
        <div className="menu-toolbar-actions">
          <label className="menu-search">
            <Search size={16} strokeWidth={1.8} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search name or SKU"
              aria-label="Search name or SKU"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>
      <p className="menu-note">
        <Info size={14} strokeWidth={1.8} aria-hidden="true" />
        Availability toggles apply to Zamalek only.
      </p>
      <ProductGrid
        products={filteredItems}
        view={view}
        availability={availability}
        onToggleAvailability={toggleAvailability}
      />
    </div>
  )
}
