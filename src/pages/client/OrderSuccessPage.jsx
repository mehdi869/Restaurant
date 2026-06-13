import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default function OrderSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = location.state?.orderId

  return (
    <main className="min-h-screen flex items-center justify-center pt-16">
      <div className="text-center px-4 max-w-md mx-auto animate-fade-in-up">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Order Placed!</h1>
        <p className="text-charcoal-400 leading-relaxed mb-2">
          Your order has been sent! A waiter will call you shortly to confirm.
        </p>
        {orderId && (
          <p className="text-charcoal-500 text-sm mb-8">
            Order ID: <span className="text-amber-400 font-mono">#{orderId}</span>
          </p>
        )}

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
