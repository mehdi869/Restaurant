import { useNavigate } from 'react-router-dom'
import { X, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '../../lib/store'
import CartItem from './CartItem'
import { useEffect } from 'react'

export default function CartDrawer() {
  const { items, isOpen, closeCart } = useCartStore()
  const navigate = useNavigate()
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={closeCart} />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-charcoal-900 border-l border-charcoal-800 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-charcoal-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-white font-semibold text-lg">Your Cart</h2>
              <span className="text-charcoal-500 text-sm">({items.length})</span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-lg hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-charcoal-500">
                <ShoppingBag className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm mt-1">Add some delicious items!</p>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-charcoal-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-400 text-sm">Subtotal</span>
                <span className="text-white font-bold text-lg">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-charcoal-950 font-semibold hover:bg-amber-400 transition-colors active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
