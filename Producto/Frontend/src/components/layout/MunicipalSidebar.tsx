import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Download, LogOut, MapPin, TrendingUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/municipal/dashboard', icon: LayoutDashboard, label: 'Dashboard Operativo' },
  { to: '/municipal/dashboard-riesgo', icon: TrendingUp, label: 'Riesgo y Multas' },
  { to: '/municipal/exportar', icon: Download, label: 'Exportación GIS' },
]

export function MunicipalSidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <aside
      aria-label="Panel municipal"
      className="hidden md:flex w-sidebar shrink-0 flex-col bg-bg-surface border-r border-border h-[calc(100vh-64px)] sticky top-16"
    >
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2 text-primary mb-1">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span className="text-caption font-semibold text-text-secondary uppercase tracking-wide">Municipalidad</span>
        </div>
        <p className="text-heading-1 font-semibold text-text-primary">{user?.name}</p>
        <p className="text-caption text-text-secondary mt-0.5">{user?.email}</p>
      </div>

      <nav className="flex-1 px-3 py-4" aria-label="Opciones municipales">
        <ul className="flex flex-col gap-1" role="list">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-body font-medium transition-colors min-h-touch',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 shrink-0" aria-hidden="true" strokeWidth={isActive ? 2.5 : 2} />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={() => { logout(); navigate('/') }}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-body font-medium w-full',
            'text-text-secondary hover:text-status-rejected hover:bg-status-rejected-bg transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-status-rejected'
          )}
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
