import { cn } from '../../lib/utils'

interface AvatarProps {
  name: string
  className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  const safeName = name || '?'
  const initials = safeName.split(' ').map((n) => n?.[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-body font-bold text-white shrink-0',
        'bg-primary',
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
