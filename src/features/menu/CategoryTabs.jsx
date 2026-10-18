export default function CategoryTabs({ categories, selected, onSelect }) {
  return (
    <div className="menu-category-tabs" role="group" aria-label="Filter products by category">
      {categories.map(({ name, count }) => {
        const active = selected === name
        return (
          <button
            className={`menu-category-pill${active ? ' active bg-accent hover:bg-accent-hover text-white' : ''}`}
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(name)}
          >
            <span>{name}</span>
            <span className="menu-category-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
