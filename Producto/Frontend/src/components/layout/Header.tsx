import { Link, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white focus-visible:outline focus-visible:outline-white rounded"
          aria-label="AccesiMap CL - Ir al inicio"
        >
          <MapPin className="w-6 h-6" aria-hidden="true" />
          <span className="text-heading-1 font-bold tracking-tight">AccesiMap CL</span>
        </Link>

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
                    <p className="text-caption font-semibold leading-none">{user.isAnonymous ? 'Anónimo' : user.name}</p>
                    {user.role === 'CIUDADANO' && (
                      <p className="text-caption text-white/70">{user.points} pts</p>
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
      </div>
    </header>
  )
}
