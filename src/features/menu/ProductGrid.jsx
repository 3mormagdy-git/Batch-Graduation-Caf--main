import ProductCard from '@/features/menu/ProductCard.jsx'

export default function ProductGrid({ products, view, availability, onToggleAvailability }) {
  if (products.length === 0) {
    return <p className="menu-empty-state">No products found.</p>
  }

  return (
    <div className={`menu-product-grid${view === 'list' ? ' list-view' : ''}`}>
      {products.map((product) => (
        <ProductCard
          key={product.sku}
          product={product}
          view={view}
          available={availability[product.sku]}
          onToggle={() => onToggleAvailability(product.sku)}
        />
      ))}
    </div>
  )
}
