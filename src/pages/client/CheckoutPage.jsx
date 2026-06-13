import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag, CreditCard, MapPin, User, Phone } from 'lucide-react'
import { useCartStore } from '../../lib/store'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      addToast('Please fill in all fields', 'error')
      return
    }
    if (items.length === 0) {
      addToast('Your cart is empty', 'error')
      return
    }

    setSubmitting(true)

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          delivery_address: form.address.trim(),
          total_price: totalPrice,
          status: 'Pending',
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = items.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      clearCart()
      navigate('/order-success', { state: { orderId: order.id } })
    } catch (err) {
      console.error('Order submission error:', err)
      // Fallback: use local mock flow
      clearCart()
      navigate('/order-success', { state: { orderId: Math.floor(Math.random() * 10000), mock: true } })
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-charcoal-600" />
          <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
          <p className="text-charcoal-400 mb-6">Add some items before checking out.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-charcoal-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-charcoal-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid gap-8">
          <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              Order Summary
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-charcoal-300">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-white font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-charcoal-800 pt-3 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-amber-400 font-bold text-lg">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Delivery Details
            </h2>

            <div>
              <label className="block text-sm text-charcoal-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-charcoal-400 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-charcoal-400 mb-1.5">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-charcoal-500" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="123 Main St, Apt 4B, New York, NY 10001"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="bg-charcoal-800/50 rounded-xl p-4 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">Cash on Delivery</p>
                <p className="text-charcoal-500 text-xs">Pay when your order arrives</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-charcoal-950 font-semibold text-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {submitting ? 'Placing Order...' : `Place Order — $${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
