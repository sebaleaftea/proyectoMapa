import { Link } from 'react-router-dom'
import { UserPlus, EyeOff, Eye, MapPin, CheckCircle, Shield, Trophy, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { cn } from '../../lib/utils'
import { useRegisterForm } from './useRegisterForm'

export function Register() {
  const {
    nombreUsuario, setNombreUsuario,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    loading,
    error,
    errors,
    clearFieldError,
    handleSubmit,
  } = useRegisterForm()

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <MapPin className="w-7 h-7" aria-hidden="true" />
            <span className="text-display font-bold">AccesiMap CL</span>
          </div>
          <h1 className="text-heading-1 font-bold text-text-primary mb-1">Crear cuenta</h1>
          <p className="text-body text-text-secondary">
            Únete y contribuye al mapa de accesibilidad de Santiago
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: MapPin, label: 'Reportar barreras', color: 'text-primary' },
            { icon: Trophy, label: 'Ganar puntos', color: 'text-accent' },
            { icon: Shield, label: 'Validación IA', color: 'text-status-validated' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg-surface dark:bg-gray-900 border border-border dark:border-gray-800"
            >
              <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
              <span className="text-caption text-text-secondary text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate aria-label="Formulario de registro">
              <div className="flex flex-col gap-1">
                <Input
                  label="Nombre de usuario"
                  type="text"
                  placeholder="¿Cómo te llamas?"
                  value={nombreUsuario}
                  onChange={(e) => { setNombreUsuario(e.target.value); clearFieldError('nombre') }}
                  required
                  autoComplete="name"
                  aria-invalid={!!errors.nombre}
                  aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                />
                {errors.nombre && (
                  <p id="nombre-error" role="alert" className="text-caption text-status-rejected">{errors.nombre}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Input
                  label="Correo electrónico"
                  type="email"
                  placeholder="usuario@ejemplo.cl"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                  required
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-caption text-status-rejected">{errors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="register-password" className="text-body font-medium text-text-primary">
                  Contraseña <span className="text-status-rejected" aria-label="campo obligatorio">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                    required
                    autoComplete="new-password"
                    className={cn(
                      'w-full border rounded-lg px-4 py-3 pr-12 text-body-large text-text-primary bg-bg-surface dark:bg-gray-900 dark:text-gray-100 placeholder:text-text-secondary dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors',
                      errors.password
                        ? 'border-status-rejected focus:border-status-rejected focus:ring-status-rejected/20'
                        : 'border-border focus:border-primary focus:ring-primary/20'
                    )}
                    placeholder="Mínimo 6 caracteres"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : 'password-hint'}
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
                {errors.password ? (
                  <p id="password-error" role="alert" className="text-caption text-status-rejected">{errors.password}</p>
                ) : (
                  <p id="password-hint" className="text-caption text-text-secondary">Mínimo 6 caracteres</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="register-confirm-password" className="text-body font-medium text-text-primary">
                  Confirmar contraseña <span className="text-status-rejected" aria-label="campo obligatorio">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirm') }}
                    required
                    autoComplete="new-password"
                    className={cn(
                      'w-full border rounded-lg px-4 py-3 pr-12 text-body-large text-text-primary bg-bg-surface dark:bg-gray-900 dark:text-gray-100 placeholder:text-text-secondary dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-colors',
                      errors.confirm
                        ? 'border-status-rejected focus:border-status-rejected focus:ring-status-rejected/20'
                        : confirmPassword && password === confirmPassword
                        ? 'border-status-validated focus:border-status-validated focus:ring-status-validated/20'
                        : 'border-border focus:border-primary focus:ring-primary/20'
                    )}
                    placeholder="Repite tu contraseña"
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm ? (
                  <p id="confirm-error" role="alert" className="text-caption text-status-rejected">{errors.confirm}</p>
                ) : confirmPassword && password === confirmPassword ? (
                  <p className="text-caption text-status-validated flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Las contraseñas coinciden
                  </p>
                ) : null}
              </div>

              {error && (
                <div role="alert" className="text-caption text-status-rejected bg-status-rejected-bg border border-status-rejected/30 rounded-lg px-4 py-2.5">
                  <p>{error}</p>
                  {error.includes('iniciar sesión') && (
                    <Link to="/login" className="inline-block mt-1 text-primary font-semibold hover:underline">
                      Ir a iniciar sesión →
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={loading}
                className="w-full mt-2"
                aria-label="Crear cuenta en AccesiMap"
              >
                <UserPlus className="w-5 h-5" aria-hidden="true" />
                {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" aria-hidden="true" />
              <span className="text-caption text-text-secondary">o</span>
              <div className="flex-1 h-px bg-border" aria-hidden="true" />
            </div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full text-body font-medium text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Ya tengo cuenta — Iniciar sesión
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-caption text-text-secondary mt-4">
          Al registrarte aceptas los términos del sistema AccesiMap CL,<br />
          en cumplimiento de la Ley 20.422.
        </p>
      </div>
    </main>
  )
}
