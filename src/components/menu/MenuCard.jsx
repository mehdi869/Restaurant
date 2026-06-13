import { useState } from 'react'
import { ShoppingCart, Check, Star } from 'lucide-react'
import { useCartStore } from '../../lib/store'

export default function MenuCard({ item }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const handleAdd = () => {
    addItem(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group relative rounded-2xl bg-charcoal-900 border border-charcoal-800 overflow-hidden hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-800 via-charcoal-700 to-charcoal-800 bg-[length:200%_100%] animate-[skeleton-loading_1.5s_ease-in-out_infinite]" />
        )}
        <img
          src={item.image_url}
          alt={item.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 to-transparent" />

        {!item.available && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-medium backdrop-blur-sm">
            Unavailable
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white text-base leading-tight">{item.name}</h3>
          <span className="shrink-0 text-amber-400 font-bold text-base">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-charcoal-400 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>

        <button
          onClick={handleAdd}
          disabled={!item.available}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            !item.available
              ? 'bg-charcoal-800 text-charcoal-500 cursor-not-allowed'
              : added
              ? 'bg-emerald-600 text-white scale-[0.98]'
              : 'bg-amber-500 text-charcoal-950 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}
