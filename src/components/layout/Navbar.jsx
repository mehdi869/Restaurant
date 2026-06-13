import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingBag, ChefHat } from 'lucide-react'
import { useCartStore } from '../../lib/store'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, openCart } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-charcoal-950/80 backdrop-blur-xl border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate(isAdmin ? '/admin' : '/')}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ChefHat className="w-6 h-6" />
          <span className="font-display text-xl font-bold tracking-tight">
            Savory
          </span>
        </button>

        {!isAdmin && (
          <button
            onClick={openCart}
            className="relative p-2 text-charcoal-300 hover:text-amber-400 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-charcoal-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        )}
      </div>
    </nav>
  )
}
