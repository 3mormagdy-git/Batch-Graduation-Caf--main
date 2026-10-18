import { useMemo, useState } from 'react'
import { Info, Search } from 'lucide-react'
import { menuItems } from '@/data/menu.js'
import CategoryTabs from '@/features/menu/CategoryTabs.jsx'
import PageHeader from '@/features/menu/PageHeader.jsx'
import ProductGrid from '@/features/menu/ProductGrid.jsx'
import ViewToggle from '@/features/menu/ViewToggle.jsx'
import '@/features/menu/MenuPage.css'

const categoryNames = ['Hot Coffee', 'Iced Drinks', 'Seasonal Specials', 'Bakery', 'Desserts']

const categories = [
  { name: 'All', count: menuItems.length },
  ...categoryNames.map((name) => ({
    name,
    count: menuItems.filter((item) => item.category === name).length,
  })),
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

  const unavailableCount = Object.values(availability).filter((available) => !available).length

  const toggleAvailability = (sku) => {
    setAvailability((current) => ({ ...current, [sku]: !current[sku] }))
  }

  return (
    <div className="menu-page">
      <PageHeader productCount={menuItems.length} unavailableCount={unavailableCount} />
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
