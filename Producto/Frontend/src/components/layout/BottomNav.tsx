import { NavLink } from 'react-router-dom'
import { Map, Camera, Trophy, UserCircle, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/inicio', icon: Home, label: 'Inicio' },
  { to: '/mapa', icon: Map, label: 'Mapa' },
  { to: '/reportar', icon: Camera, label: 'Reportar', featured: true },
  { to: '/perfil', icon: UserCircle, label: 'Mi Perfil' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Navegación ciudadana"
      className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface dark:bg-gray-900 border-t border-border dark:border-gray-800 md:hidden"
    >
      <ul className="flex items-center justify-around h-16 px-1" role="list">
        {navItems.map(({ to, icon: Icon, label, featured }) => (
          <li key={to} className="flex-1 min-w-0">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 w-full h-14 rounded-xl transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  featured
                    ? cn(
                        'bg-primary text-white mx-0.5 rounded-2xl shadow-md -translate-y-2',
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
                  <span className="text-[9px] font-medium leading-none truncate w-full text-center px-0.5">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
