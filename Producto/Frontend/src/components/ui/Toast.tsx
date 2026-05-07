import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  message: string
}

const toastConfig: Record<ToastType, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle className="w-5 h-5 shrink-0" />, classes: 'bg-status-validated-bg text-status-validated border-status-validated/30' },
  warning: { icon: <AlertCircle className="w-5 h-5 shrink-0" />, classes: 'bg-status-pending-bg text-status-pending border-status-pending/30' },
  error: { icon: <XCircle className="w-5 h-5 shrink-0" />, classes: 'bg-status-rejected-bg text-status-rejected border-status-rejected/30' },
  info: { icon: <AlertCircle className="w-5 h-5 shrink-0" />, classes: 'bg-blue-50 text-primary border-primary/30' },
}

interface ToastItemProps {
  toast: ToastData
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { icon, classes } = toastConfig[toast.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-modal',
        'animate-in slide-in-from-right-4 duration-300',
        'max-w-sm w-full',
        classes
      )}
    >
      {icon}
      <p className="flex-1 text-body font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div
      aria-label="Notificaciones"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
