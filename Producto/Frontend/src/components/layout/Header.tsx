import { Link, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, User, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { Button } from '../ui/Button'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-primary dark:bg-gray-900 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to={isAuthenticated && user?.role === 'CIUDADANO' ? '/inicio' : '/'}
          className="flex items-center gap-2 text-white focus-visible:outline focus-visible:outline-white rounded"
          aria-label="AccesiMap CL - Ir al inicio"
        >
          <MapPin className="w-6 h-6" aria-hidden="true" />
          <span className="text-heading-1 font-bold tracking-tight">AccesiMap CL</span>
        </Link>

        {/* Contenedor derecho: Navegación de Desktop + Botón Tema */}
        <div className="flex items-center gap-2 md:gap-4">
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
            {isAuthenticated && user ? (
              <>
                <Link
                to="/mapa"
                className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-body font-medium transition-colors"
              >
                Mapa
              </Link>
              {user.role === 'MUNICIPALIDAD' && (
                <Link
                  to="/municipal/dashboard"
                  className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-body font-medium transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {user.role === 'CIUDADANO' && (
                <>
                  <Link
                    to="/reportar"
                    className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-body font-medium transition-colors"
                  >
                    Reportar
                  </Link>
                  <Link
                    to="/perfil"
                    className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-body font-medium transition-colors"
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/ranking"
                    className="text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 text-body font-medium transition-colors"
                  >
                    Ranking
                  </Link>
                </>
              )}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/30">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" aria-hidden="true">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-caption font-semibold leading-none">{String(user.name ?? '')}</p>
                    {user.role === 'CIUDADANO' && (
                      <p className="text-caption text-white/70">{Number(user.points) || 0} pts</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white/70 hover:text-white transition-colors p-1 rounded"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white/10"
            >
              Iniciar sesión
            </Button>
          )}
          </nav>

          {/* Toggle de tema (siempre visible, completamente a la derecha) */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 ml-2 rounded-full border border-white/20 hover:bg-white/20 text-white transition-all focus-visible:outline focus-visible:outline-white shrink-0"
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="w-5 h-5 fill-current" /> : <Moon className="w-5 h-5 fill-current" />}
          </button>
        </div>
      </div>
    </header>
  )
}
