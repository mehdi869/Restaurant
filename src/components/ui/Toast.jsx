import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, BellRing } from 'lucide-react'

const ToastContext = createContext()

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border animate-slide-in-right ${
        isSuccess
          ? 'bg-emerald-900/90 border-emerald-700 text-emerald-100'
          : isError
          ? 'bg-red-900/90 border-red-700 text-red-100'
          : 'bg-amber-900/90 border-amber-700 text-amber-100'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
      ) : isError ? (
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
      ) : (
        <BellRing className="w-5 h-5 mt-0.5 shrink-0 animate-bell-ring" />
      )}
      <p className="text-sm flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="shrink-0 hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
