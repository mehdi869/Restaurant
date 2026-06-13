import { useState, useMemo } from 'react'
import { MENU_ITEMS } from '../../data/menu-items'
import MenuCard from './MenuCard'
import { MenuCardSkeleton } from '../ui/Skeleton'
import CategoryFilter from './CategoryFilter'

export default function MenuGrid() {
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(false)

  const filtered = useMemo(() => {
    if (category === 'all') return MENU_ITEMS
    return MENU_ITEMS.filter((item) => item.category === category)
  }, [category])

  return (
    <section className="pb-16">
      <CategoryFilter active={category} onChange={setCategory} />
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <p className="text-charcoal-500 text-sm mb-6">
              Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => (
                <div key={item.id} className="animate-fade-in-up">
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
