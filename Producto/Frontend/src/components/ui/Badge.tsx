import { cn } from '../../lib/utils'
import type { ReportStatus } from '../../types'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status'
  status?: ReportStatus
}

const statusConfig: Record<ReportStatus, { label: string; classes: string }> = {
  VALIDADO: { label: 'Validado', classes: 'bg-status-validated-bg text-status-validated' },
  PENDIENTE: { label: 'Pendiente', classes: 'bg-status-pending-bg text-status-pending' },
  RECHAZADO: { label: 'Rechazado', classes: 'bg-status-rejected-bg text-status-rejected' },
}

export function Badge({ variant = 'default', status, children, className, ...props }: BadgeProps) {
  if (variant === 'status' && status) {
    const { label, classes } = statusConfig[status]
    return (
      <span
        className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium', classes, className)}
        {...props}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium bg-gray-100 text-text-secondary', className)}
      {...props}
    >
      {children}
    </span>
  )
}
