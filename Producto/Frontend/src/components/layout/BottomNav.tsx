import { NavLink } from 'react-router-dom'
import { Map, Camera, Trophy } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/mapa', icon: Map, label: 'Mapa' },
  { to: '/reportar', icon: Camera, label: 'Reportar', featured: true },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación ciudadana"
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface border-t border-border md:hidden"
    >
      <ul className="flex items-center justify-around h-16 px-2" role="list">
        {navItems.map(({ to, icon: Icon, label, featured }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 w-full h-14 rounded-xl transition-colors min-h-touch',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  featured
                    ? cn(
                        'bg-primary text-white mx-1 rounded-2xl shadow-md -translate-y-2',
                        isActive && 'bg-primary-hover'
                      )
                    : isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )
              }
              aria-current={undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn('w-5 h-5', featured && 'w-6 h-6')}
                    aria-hidden="true"
                    strokeWidth={isActive && !featured ? 2.5 : 2}
                  />
                  <span className={cn('text-[10px] font-medium', featured && 'text-xs')}>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
