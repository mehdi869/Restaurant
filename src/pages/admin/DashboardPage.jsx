import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import OrderPanel from './OrderPanel'
import MenuManagement from './MenuManagement'
import {
  ClipboardList, Settings, LogOut, Bell, ChefHat,
} from 'lucide-react'

const TABS = [
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'menu', label: 'Menu', icon: Settings },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) {
        navigate('/admin', { replace: true })
        return
      }
      setSession(s)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) {
        navigate('/admin', { replace: true })
      }
      setSession(s)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-charcoal-950 pt-16">
      <header className="fixed top-0 left-0 right-0 z-40 bg-charcoal-950/80 backdrop-blur-xl border-b border-charcoal-800/50 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-400" />
            <span className="font-display text-xl font-bold text-white">Savory</span>
            <span className="text-charcoal-500 text-sm ml-2 hidden sm:inline">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-charcoal-400 text-sm hidden sm:block">
              {session.user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-charcoal-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-1 bg-charcoal-900 rounded-xl p-1 border border-charcoal-800 mb-6 w-fit">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-charcoal-950 shadow-lg shadow-amber-500/20'
                    : 'text-charcoal-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {activeTab === 'orders' && <OrderPanel />}
        {activeTab === 'menu' && <MenuManagement />}
      </div>
    </div>
  )
}
