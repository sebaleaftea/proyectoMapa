import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, MapPin, Tag, FileText, Upload, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useReportStore } from '../../store/reportStore'
import { useAuthStore } from '../../store/authStore'
import { reportService } from '../../services/reportService'
import { cn } from '../../lib/utils'
import type { ReportCategory } from '../../types'

const CATEGORIES: Array<{ value: ReportCategory; label: string; description: string }> = [
  { value: 'RAMPA', label: 'Rampa', description: 'Rampa dañada, ausente o con pendiente incorrecta' },
  { value: 'ASCENSOR', label: 'Ascensor', description: 'Ascensor averiado o no accesible en metro/edificio público' },
  { value: 'BAÑO', label: 'Baño accesible', description: 'Baño no adaptado o con barreras de acceso' },
]

type SubmitState = 'idle' | 'uploading' | 'validating' | 'success' | 'warning' | 'error'

export function ReportPage() {
  const navigate = useNavigate()
  const { prependReport } = useReportStore()
  const { user, updatePoints } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [description, setDescription] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [coords, setCoords] = useState({ lat: -33.4569, lng: -70.6483 })
  const [errors, setErrors] = useState<{ photo?: string; category?: string }>({})
  const [earnedPoints, setEarnedPoints] = useState(0)

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords: c }) => setCoords({ lat: c.latitude, lng: c.longitude }),
      () => { /* usa coordenadas por defecto si el usuario niega el permiso */ }
    )
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, photo: undefined }))
  }

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!photo) newErrors.photo = 'La fotografía es obligatoria para la validación IA'
    if (!category) newErrors.category = 'Selecciona la categoría de la barrera'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate() || !category || !photo) return

    setSubmitState('uploading')
    try {
      setSubmitState('validating')
      const result = await reportService.create({
        foto: photo,
        latitud: coords.lat,
        longitud: coords.lng,
        categoria: category,
        descripcion: description || undefined,
      })

      // Actualiza el store local con el reporte recibido
      prependReport({
        id: result.id,
        category,
        status: result.estado,
        coordinates: coords,
        description: description || undefined,
        photoUrl: photoPreview ?? '',
        aiConfidence: result.nivelConfianzaIa != null ? Math.round(result.nivelConfianzaIa * 100) : undefined,
        createdAt: new Date().toISOString(),
        reporterName: user?.isAnonymous ? undefined : user?.name,
        comuna: 'Santiago Centro',
      })

      const pts = result.puntosOtorgados ?? 0
      if (pts > 0) {
        setEarnedPoints(pts)
        updatePoints((user?.points ?? 0) + pts)
      }

      if (result.estado === 'VALIDADO') setSubmitState('success')
      else if (result.estado === 'PENDIENTE') setSubmitState('warning')
      else setSubmitState('error')
    } catch {
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-status-validated-bg flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-status-validated" aria-hidden="true" />
          </div>
          <h1 className="text-display font-bold text-text-primary mb-2">¡Reporte validado!</h1>
          <p className="text-body text-text-secondary mb-2">Tu reporte fue confirmado por Inteligencia Artificial.</p>
          {earnedPoints > 0 && (
            <p className="text-heading-1 font-bold text-accent mb-6">+{earnedPoints} puntos ganados</p>
          )}
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => navigate('/mapa')}>Ver en el mapa</Button>
            <Button variant="ghost" onClick={() => { setSubmitState('idle'); setPhoto(null); setPhotoPreview(null); setCategory(null); setDescription('') }}>
              Enviar otro reporte
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (submitState === 'warning') {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-status-pending-bg flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-status-pending" aria-hidden="true" />
          </div>
          <h1 className="text-display font-bold text-text-primary mb-2">Reporte recibido</h1>
          <p className="text-body text-text-secondary mb-6">La imagen tiene baja calidad. Un revisor humano lo evaluará en las próximas 48 horas.</p>
          <Button variant="primary" onClick={() => navigate('/mapa')}>Volver al mapa</Button>
        </div>
      </main>
    )
  }

  if (submitState === 'error') {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-status-rejected-bg flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-10 h-10 text-status-rejected" aria-hidden="true" />
          </div>
          <h1 className="text-display font-bold text-text-primary mb-2">Reporte rechazado</h1>
          <p className="text-body text-text-secondary mb-6">No se detectó una {category === 'RAMPA' ? 'rampa' : category === 'ASCENSOR' ? 'ascensor' : 'baño'} válido en la fotografía.</p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={() => setSubmitState('idle')}>Intentar con otra foto</Button>
            <Button variant="ghost" onClick={() => navigate('/mapa')}>Volver al mapa</Button>
          </div>
        </div>
      </main>
    )
  }

  const isProcessing = submitState === 'uploading' || submitState === 'validating'

  return (
    <main className="flex-1 px-4 py-6 bg-bg-app pb-24 md:pb-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-display font-bold text-text-primary mb-1 flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" aria-hidden="true" />
          Nuevo Reporte
        </h1>
        <p className="text-body text-text-secondary mb-6">Reporta una barrera arquitectónica en Santiago</p>

        {isProcessing && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3"
          >
            <svg className="animate-spin w-5 h-5 text-primary shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-body font-medium text-primary">
              {submitState === 'uploading' ? 'Subiendo fotografía…' : 'Analizando imagen con Inteligencia Artificial…'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate aria-label="Formulario de reporte de accesibilidad">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-primary" aria-hidden="true" />
                <p className="text-body font-semibold text-text-primary">
                  Fotografía <span className="text-status-rejected" aria-label="obligatorio">*</span>
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="sr-only"
                id="photo-input"
                aria-label="Seleccionar fotografía de la barrera"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'w-full rounded-xl border-2 border-dashed transition-colors',
                  'flex flex-col items-center justify-center gap-3 p-6 min-h-[160px]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  photoPreview
                    ? 'border-primary/40 bg-primary/5'
                    : errors.photo
                    ? 'border-status-rejected bg-status-rejected-bg'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                )}
                aria-label={photoPreview ? 'Cambiar fotografía' : 'Abrir cámara o galería'}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Vista previa de la fotografía" className="max-h-40 rounded-lg object-cover" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-text-secondary" aria-hidden="true" />
                    <div className="text-center">
                      <p className="text-body font-medium text-text-primary">Tomar foto o subir desde galería</p>
                      <p className="text-caption text-text-secondary mt-0.5">JPG, PNG — Obligatorio para validación IA</p>
                    </div>
                  </>
                )}
              </button>
              {errors.photo && <p className="text-caption text-status-rejected mt-1.5" role="alert">{errors.photo}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                <p className="text-body font-semibold text-text-primary">Ubicación</p>
              </div>
              <div className="bg-bg-app rounded-lg px-4 py-3 border border-border">
                <p className="text-caption text-text-secondary mb-0.5">Coordenadas GPS detectadas automáticamente</p>
                <p className="text-body font-medium text-text-primary font-mono">
                  Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" aria-hidden="true" />
                <p className="text-body font-semibold text-text-primary">
                  Categoría <span className="text-status-rejected" aria-label="obligatorio">*</span>
                </p>
              </div>
              <fieldset>
                <legend className="sr-only">Tipo de barrera arquitectónica</legend>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                        'focus-within:ring-2 focus-within:ring-primary/20',
                        category === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={value}
                        checked={category === value}
                        onChange={() => { setCategory(value); setErrors((p) => ({ ...p, category: undefined })) }}
                        className="mt-0.5 accent-primary w-4 h-4"
                      />
                      <div>
                        <p className="text-body font-semibold text-text-primary">{label}</p>
                        <p className="text-caption text-text-secondary">{description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
              {errors.category && <p className="text-caption text-status-rejected mt-1.5" role="alert">{errors.category}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <label htmlFor="description" className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
                <span className="text-body font-semibold text-text-primary">Descripción</span>
                <span className="text-caption text-text-secondary ml-1">(Opcional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={300}
                placeholder="Describe brevemente la barrera encontrada…"
                className="w-full border border-border rounded-lg px-4 py-3 text-body text-text-primary bg-bg-surface placeholder:text-text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
              />
              <p className="text-caption text-text-secondary mt-1 text-right">{description.length}/300</p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isProcessing}
            disabled={isProcessing}
            className="w-full"
            aria-label="Enviar reporte de accesibilidad"
          >
            <Camera className="w-5 h-5" aria-hidden="true" />
            {isProcessing ? 'Procesando…' : 'Enviar Reporte'}
          </Button>
        </form>
      </div>
    </main>
  )
}
