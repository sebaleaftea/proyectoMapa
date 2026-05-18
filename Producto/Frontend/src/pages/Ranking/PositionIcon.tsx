import { Trophy, Medal } from 'lucide-react'

const MEDAL_CONFIG = [
  { color: '#FFD700', icon: Trophy, label: 'Primer lugar' },
  { color: '#C0C0C0', icon: Medal, label: 'Segundo lugar' },
  { color: '#CD7F32', icon: Medal, label: 'Tercer lugar' },
]

interface PositionIconProps {
  position: number
}

export function PositionIcon({ position }: PositionIconProps) {
  if (position <= 3) {
    const { color, icon: Icon, label } = MEDAL_CONFIG[position - 1]
    return <Icon className="w-6 h-6" style={{ color }} aria-label={label} />
  }
  return (
    <span className="w-6 text-center text-body font-bold text-text-secondary" aria-label={`Posición ${position}`}>
      {position}
    </span>
  )
}
