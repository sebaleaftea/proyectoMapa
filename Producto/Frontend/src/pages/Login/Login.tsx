import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, User, EyeOff, Eye, MapPin, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import { rankingService } from '../../services/rankingService'
import type { UserRole } from '../../types'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [role, setRole] = useState<UserRole>('CIUDADANO')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const auth = await authService.login({ email, password })

      login({
        id: auth.userId,
        name: auth.nombreUsuario ?? email.split('@')[0],
        email,
        role: auth.role,
        points: 0,
        token: auth.token,
        isAnonymous: false,
      })

      if (auth.role === 'CIUDADANO') {
        try { 
          const puntosData = await rankingService.getMisPuntos('global')
          useAuthStore.getState().updatePoints(Number(puntosData.puntos) || 0)
        } catch { /* sin puntos aún */ }
      }

      navigate(auth.role === 'MUNICIPALIDAD' || auth.role === 'ADMINISTRADOR' ? '/municipal/dashboard' : '/inicio')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <MapPin className="w-7 h-7" aria-hidden="true" />
            <span className="text-display font-bold">AccesiMap CL</span>
          </div>
          <p className="text-body text-text-secondary">Inicia sesión para contribuir al mapa de accesibilidad de Santiago</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <fieldset className="mb-6">
              <legend className="text-body font-semibold text-text-primary mb-3">Tipo de acceso</legend>
              <div className="grid grid-cols-2 gap-3" role="group">
                {([
                  { value: 'CIUDADANO', icon: User, label: 'Ciudadano', desc: 'Reportar barreras' },
                  { value: 'MUNICIPALIDAD', icon: Building2, label: 'Municipalidad', desc: 'Panel de gestión' },
                ] as const).map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-h-touch',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                      role === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                    )}
                    aria-pressed={role === value}
                    aria-label={`Acceder como ${label}`}
                  >
                    <Icon className="w-6 h-6" aria-hidden="true" />
                    <div>
                      <p className="text-body font-semibold leading-none">{label}</p>
                      <p className="text-caption mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </fieldset>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="usuario@ejemplo.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-body font-medium text-text-primary">
                  Contraseña <span className="text-status-rejected" aria-label="campo obligatorio">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full border border-border rounded-lg px-4 py-3 pr-12 text-body-large text-text-primary bg-bg-surface placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-caption text-status-rejected bg-status-rejected-bg border border-status-rejected/30 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                Iniciar sesión
              </Button>
            </form>

            {role === 'CIUDADANO' && (
              <>
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" aria-hidden="true" />
                  <span className="text-caption text-text-secondary">o</span>
                  <div className="flex-1 h-px bg-border" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/registro"
                    className="flex items-center justify-center gap-2 w-full text-body font-medium text-text-secondary hover:text-text-primary transition-colors py-2 border border-border rounded-lg hover:bg-bg-surface"
                  >
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    No tienes cuenta — Regístrate
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-caption text-text-secondary mt-4">
          Al ingresar aceptas los términos del sistema AccesiMap CL,<br />
          en cumplimiento de la Ley 20.422.
        </p>
      </div>
    </main>
  )
}
