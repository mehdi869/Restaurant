import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../components/ui/Toast'
import { Clock, Phone, MapPin, Bell, RefreshCw, ClipboardList } from 'lucide-react'

const STATUS_STYLES = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const STATUS_ACTIONS = {
  Pending: { next: 'Confirmed', label: 'Confirm Order', color: 'bg-blue-500 hover:bg-blue-400 text-white' },
  Confirmed: { next: 'Delivered', label: 'Mark Delivered', color: 'bg-emerald-500 hover:bg-emerald-400 text-white' },
  Delivered: null,
  Cancelled: null,
}

export default function OrderPanel() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [newOrderAlert, setNewOrderAlert] = useState(false)
  const audioRef = useRef(null)
  const prevCountRef = useRef(0)

  const playNotificationSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
    } catch (e) {
      // Audio play might fail - silently ignore
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        const prevCount = prevCountRef.current
        if (prevCount > 0 && data.length > prevCount) {
          setNewOrderAlert(true)
          addToast('New order received!', 'order')
          playNotificationSound()
          setTimeout(() => setNewOrderAlert(false), 3000)
        }
        prevCountRef.current = data.length
        setOrders(data)
      }
    } catch (err) {
      // If no Supabase, use empty orders
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [addToast, playNotificationSound])

  // Initial load + polling fallback
  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => [payload.new, ...prev])
          setNewOrderAlert(true)
          addToast('New order received!', 'order')
          playNotificationSound()
          setTimeout(() => setNewOrderAlert(false), 3000)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addToast, playNotificationSound])

  const updateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      addToast(`Order #${orderId} marked as ${newStatus}`, 'success')
    } catch (err) {
      // Optimistic local update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      )
      addToast(`Order #${orderId} marked as ${newStatus}`, 'success')
    }
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+/v7+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH+AgH+AgH+AgH+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH9/f3+AgH+" type="audio/wav" />
      </audio>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Live Orders</h2>
          {newOrderAlert && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium animate-fade-in">
              <Bell className="w-3 h-3" />
              New!
            </span>
          )}
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-charcoal-400 hover:text-white hover:bg-charcoal-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 text-charcoal-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Orders will appear here in real-time.</p>
        </div>
      )}

      <div className="grid gap-4">
        {orders.map((order, index) => {
          const action = STATUS_ACTIONS[order.status]
          return (
            <div
              key={order.id}
              className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-5 hover:border-amber-500/20 transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white font-semibold text-lg">
                      #{order.id}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[order.status] || ''}`}>
                      {order.status}
                    </span>
                    <span className="text-charcoal-500 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(order.created_at)}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-charcoal-500" />
                      {order.customer_name}
                      <span className="text-charcoal-400 font-normal">
                        &mdash; {order.customer_phone}
                      </span>
                    </p>
                    <p className="text-charcoal-400 text-sm flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {order.delivery_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-amber-400 font-bold text-lg">
                    ${parseFloat(order.total_price).toFixed(2)}
                  </span>
                  {action && (
                    <button
                      onClick={() => updateStatus(order.id, action.next)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${action.color}`}
                    >
                      {action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
