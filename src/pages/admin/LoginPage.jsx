import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.email.trim() || !form.password.trim()) {
      addToast('Please enter email and password', 'error')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })

      if (error) throw error

      addToast('Welcome back!', 'success')
      navigate('/admin/dashboard')
    } catch (err) {
      addToast(err.message || 'Invalid credentials', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-charcoal-950 px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Staff Login</h1>
          <p className="text-charcoal-400 text-sm mt-1">Sign in to manage orders</p>
        </div>

        <form onSubmit={handleLogin} className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-charcoal-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="waiter@savory.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-charcoal-400 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-charcoal-800 border border-charcoal-700 text-white placeholder:text-charcoal-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 text-charcoal-950 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-charcoal-600 text-xs mt-6">
          Secure staff access only.
        </p>
      </div>
    </main>
  )
}
