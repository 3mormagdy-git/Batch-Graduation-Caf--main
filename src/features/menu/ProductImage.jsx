import { useState } from 'react'
import { Coffee } from 'lucide-react'

export default function ProductImage({ name, image, focus = 'center', unavailable }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`menu-product-image${unavailable ? ' unavailable' : ''}`}>
      {image && !failed ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          style={{ objectPosition: focus }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="menu-image-fallback" aria-hidden="true">
          <Coffee size={36} strokeWidth={1.6} />
        </div>
      )}
      {unavailable && <span className="menu-unavailable-badge">Unavailable</span>}
    </div>
  )
}
