import { useState, useEffect } from 'react'
import { User, Mail, Lock, Clock, Camera, CheckCircle, AlertCircle, ChevronRight, EyeOff, Eye, Edit2, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuthStore } from '../../store/authStore'
import { perfilService } from '../../services/perfilService'
import { cn } from '../../lib/utils'
import type { ReporteDetalleAPI } from '../../types'

type SaveState = 'idle' | 'saving' | 'success' | 'error'

const CATEGORIA_LABEL: Record<string, string> = {
  RAMPA: 'Rampa',
  ASCENSOR: 'Ascensor',
  BAÑO: 'Baño accesible',
}

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore()

  // — Estado del nombre —
  const [editingNombre, setEditingNombre] = useState(false)
  const [nombreDraft, setNombreDraft] = useState(user?.name ?? '')
  const [nombreState, setNombreState] = useState<SaveState>('idle')
  const [nombreError, setNombreError] = useState('')

  // — Estado de contraseña —
  const [showPwdForm, setShowPwdForm] = useState(false)
  const [pwdActual, setPwdActual] = useState('')
  const [pwdNueva, setPwdNueva] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [showPwdActual, setShowPwdActual] = useState(false)
  const [showPwdNueva, setShowPwdNueva] = useState(false)
  const [pwdState, setPwdState] = useState<SaveState>('idle')
  const [pwdError, setPwdError] = useState('')

  // — Historial de reportes —
  const [reportes, setReportes] = useState<ReporteDetalleAPI[]>([])
  const [loadingReportes, setLoadingReportes] = useState(true)

  useEffect(() => {
    perfilService.getMisReportes()
      .then(setReportes)
      .catch(console.error)
      .finally(() => setLoadingReportes(false))
  }, [])

  // — Guardar nombre —
  const handleGuardarNombre = async () => {
    if (!nombreDraft.trim() || nombreDraft.trim().length < 2) {
      setNombreError('El nombre debe tener al menos 2 caracteres')
      return
    }
    setNombreError('')
    setNombreState('saving')
    try {
      await perfilService.actualizarPerfil({ nombreUsuario: nombreDraft.trim() })
      updateProfile(nombreDraft.trim())
      setNombreState('success')
      setEditingNombre(false)
      setTimeout(() => setNombreState('idle'), 2500)
    } catch {
      setNombreState('error')
    }
  }

  const handleCancelarNombre = () => {
    setNombreDraft(user?.name ?? '')
    setNombreError('')
    setEditingNombre(false)
    setNombreState('idle')
  }

  // — Cambiar contraseña —
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwdError('')
    if (pwdNueva !== pwdConfirm) {
      setPwdError('Las contraseñas nuevas no coinciden')
      return
    }
    if (pwdNueva.length < 6) {
      setPwdError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setPwdState('saving')
    try {
      await perfilService.actualizarPerfil({ passwordActual: pwdActual, passwordNueva: pwdNueva })
      setPwdState('success')
      setPwdActual('')
      setPwdNueva('')
      setPwdConfirm('')
      setShowPwdForm(false)
      setTimeout(() => setPwdState('idle'), 3000)
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje ?? 'Error al cambiar la contraseña'
      setPwdError(msg)
      setPwdState('error')
    }
  }

  const initials = (user?.name ?? '?').charAt(0).toUpperCase()

  return (
    <main className="flex-1 px-4 py-6 bg-bg-app pb-24 md:pb-6">
      <div className="max-w-lg mx-auto flex flex-col gap-5">
        <h1 className="text-display font-bold text-text-primary flex items-center gap-2">
          <User className="w-6 h-6 text-primary" aria-hidden="true" />
          Mi Perfil
        </h1>

        {/* ── Card Avatar + Info ─────────────────────── */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-display font-bold shrink-0" aria-hidden="true">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                {editingNombre ? (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={nombreDraft}
                      onChange={(e) => { setNombreDraft(e.target.value); setNombreError('') }}
                      autoFocus
                      className="w-full border border-primary rounded-lg px-3 py-1.5 text-body font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 bg-bg-surface"
                      aria-label="Editar nombre de usuario"
                    />
                    {nombreError && <p className="text-caption text-status-rejected">{nombreError}</p>}
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="primary" loading={nombreState === 'saving'} onClick={handleGuardarNombre}>
                        Guardar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelarNombre}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-heading-1 font-bold text-text-primary truncate">{user?.name}</p>
                    <button
                      onClick={() => { setNombreDraft(user?.name ?? ''); setEditingNombre(true) }}
                      className="text-text-secondary hover:text-primary transition-colors shrink-0"
                      aria-label="Editar nombre"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {nombreState === 'success' && (
                  <p className="text-caption text-status-validated flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Nombre actualizado
                  </p>
                )}
                {user?.role === 'CIUDADANO' && (
                  <p className="text-caption text-text-secondary mt-0.5">{Number(user.points) || 0} pts</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-app border border-border">
              <Mail className="w-4 h-4 text-text-secondary shrink-0" aria-hidden="true" />
              <div>
                <p className="text-caption text-text-secondary">Correo electrónico</p>
                <p className="text-body font-medium text-text-primary">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Card Contraseña ─────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-heading-1 font-semibold text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" aria-hidden="true" />
                Seguridad
              </h2>
              {!showPwdForm && (
                <button
                  onClick={() => setShowPwdForm(true)}
                  className="text-body text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Cambiar contraseña <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </CardHeader>

          {showPwdForm && (
            <CardContent>
              {pwdState === 'success' && (
                <div className="mb-4 p-3 rounded-xl bg-status-validated-bg border border-status-validated/30 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-status-validated" />
                  <p className="text-caption text-status-validated font-medium">¡Contraseña cambiada correctamente!</p>
                </div>
              )}
              <form onSubmit={handleCambiarPassword} className="flex flex-col gap-3" noValidate>
                {/* Contraseña actual */}
                {[
                  { id: 'pwd-actual', label: 'Contraseña actual', value: pwdActual, setter: setPwdActual, show: showPwdActual, toggle: () => setShowPwdActual(v => !v) },
                  { id: 'pwd-nueva', label: 'Nueva contraseña', value: pwdNueva, setter: setPwdNueva, show: showPwdNueva, toggle: () => setShowPwdNueva(v => !v) },
                  { id: 'pwd-confirm', label: 'Confirmar nueva contraseña', value: pwdConfirm, setter: setPwdConfirm, show: showPwdNueva, toggle: () => setShowPwdNueva(v => !v) },
                ].map(({ id, label, value, setter, show, toggle }) => (
                  <div key={id} className="flex flex-col gap-1">
                    <label htmlFor={id} className="text-caption font-medium text-text-primary">{label}</label>
                    <div className="relative">
                      <input
                        id={id}
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={(e) => { setter(e.target.value); setPwdError('') }}
                        className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-body text-text-primary bg-bg-surface placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={show ? 'Ocultar' : 'Mostrar'}
                      >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwdError && (
                  <div role="alert" className="flex items-center gap-2 text-caption text-status-rejected bg-status-rejected-bg border border-status-rejected/30 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {pwdError}
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <Button type="submit" variant="primary" size="sm" loading={pwdState === 'saving'}>
                    Guardar contraseña
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setShowPwdForm(false); setPwdError(''); setPwdActual(''); setPwdNueva(''); setPwdConfirm('') }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* ── Card Historial de reportes ───────────────── */}
        <Card>
          <CardHeader>
            <h2 className="text-heading-1 font-semibold text-text-primary flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" aria-hidden="true" />
              Mis reportes
              {!loadingReportes && (
                <span className="ml-auto text-caption text-text-secondary font-normal">{reportes.length} total</span>
              )}
            </h2>
          </CardHeader>
          <CardContent className="pt-0">
            {loadingReportes ? (
              <div className="py-8 flex items-center justify-center">
                <svg className="animate-spin w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            ) : reportes.length === 0 ? (
              <div className="py-10 text-center">
                <Camera className="w-10 h-10 text-text-secondary mx-auto mb-3 opacity-40" aria-hidden="true" />
                <p className="text-body text-text-secondary">Aún no has hecho ningún reporte</p>
                <p className="text-caption text-text-secondary mt-1">¡Ayuda a mapear las barreras de Santiago!</p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto -mx-2 px-2 divide-y divide-border">
                {reportes.map((r, i) => (
                  <div key={String(r.id)} className={cn('py-3 flex items-start gap-3', i === 0 && 'pt-0')}>
                    {/* Miniatura */}
                    {r.fotoUrl ? (
                      <img
                        src={r.fotoUrl}
                        alt={`Foto del reporte ${CATEGORIA_LABEL[r.categoria as string] ?? r.categoria}`}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-bg-app flex items-center justify-center shrink-0 border border-border">
                        <Camera className="w-6 h-6 text-text-secondary opacity-50" aria-hidden="true" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-body font-semibold text-text-primary">
                          {CATEGORIA_LABEL[r.categoria as string] ?? r.categoria}
                        </p>
                        <Badge variant="status" status={r.estado as any} />
                      </div>
                      {r.descripcion && (
                        <p className="text-caption text-text-secondary line-clamp-2">{r.descripcion}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-caption text-text-secondary">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {new Date(r.fechaCreacion).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
