import ProductImage from '@/features/menu/ProductImage.jsx'
import Toggle from '@/components/ui/Toggle.jsx'

export default function ProductCard({ product, view, available, onToggle }) {
  return (
    <article className={`menu-product-card${view === 'list' ? ' menu-product-card--list' : ''}`}>
      <ProductImage
        name={product.name}
        image={product.image}
        focus={product.focus}
        unavailable={!available}
      />
      <div className="menu-product-body">
        <div className="menu-product-meta">{product.category} • {product.sku}</div>
        <h2 className="menu-product-name">{product.name}</h2>
        <div className="menu-product-bottom">
          <div className="menu-product-price"><strong>{product.price}</strong><span> EGP</span></div>
          <Toggle checked={available} onChange={onToggle} label={`${product.name} availability`} />
        </div>
      </div>
    </article>
  )
}
