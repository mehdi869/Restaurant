import { CATEGORIES } from '../../data/menu-items'

export default function CategoryFilter({ active, onChange }) {
  return (
    <div id="menu" className="sticky top-16 z-30 bg-charcoal-950/90 backdrop-blur-xl border-b border-charcoal-800/50 py-3">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active === cat.id
                  ? 'bg-amber-500 text-charcoal-950 shadow-lg shadow-amber-500/25'
                  : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
