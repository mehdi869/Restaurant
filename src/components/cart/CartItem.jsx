import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../lib/store'

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <div className="flex gap-3 py-4 border-b border-charcoal-800/50 last:border-0">
      <img
        src={item.image_url}
        alt={item.name}
        className="w-16 h-16 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
        <p className="text-amber-400 text-sm font-semibold mt-0.5">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded-md bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-white text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-md bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-auto p-1 rounded-md text-charcoal-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
