import { Camera, MapPin, Tag, FileText, Upload, Search, X, ImageIcon } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { LocationPickerMap } from '../../components/map/LocationPickerMap'
import { cn } from '../../lib/utils'
import { useState } from 'react'
import type { ReportCategory } from '../../types'
import type { CameraPermission, SubmitState } from './useReportForm'

const CATEGORIES: Array<{ value: ReportCategory; label: string; description: string }> = [
  { value: 'RAMPA', label: 'Rampa', description: 'Rampa dañada, ausente o con pendiente incorrecta' },
  { value: 'ASCENSOR', label: 'Ascensor', description: 'Ascensor averiado o no accesible en metro/edificio público' },
  { value: 'BAÑO', label: 'Baño accesible', description: 'Baño no adaptado o con barreras de acceso' },
]

interface Props {
  fileRef: React.RefObject<HTMLInputElement | null>
  photoPreview: string | null
  category: ReportCategory | null
  description: string
  submitState: SubmitState
  coords: { lat: number; lng: number }
  errors: { photo?: string; category?: string }
  hasCamera: boolean
  cameraPermission: CameraPermission
  isCameraOpen: boolean
  setVideoRef: (el: HTMLVideoElement | null) => void
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDropPhoto: (file: File) => void
  onCategoryChange: (value: ReportCategory) => void
  onDescriptionChange: (value: string) => void
  onCoordsChange: (coords: { lat: number; lng: number }) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onOpenCamera: () => void
  onCapturePhoto: () => void
  onCloseCamera: () => void
}

export function ReportForm({
  fileRef,
  photoPreview,
  category,
  description,
  submitState,
  coords,
  errors,
  hasCamera,
  cameraPermission,
  isCameraOpen,
  setVideoRef,
  onPhotoChange,
  onDropPhoto,
  onCategoryChange,
  onDescriptionChange,
  onCoordsChange,
  onSubmit,
  onOpenCamera,
  onCapturePhoto,
  onCloseCamera,
}: Props) {
  const isProcessing = submitState === 'uploading' || submitState === 'validating'

  const [addressInput, setAddressInput] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleAddressSearch = async () => {
    const query = addressInput.trim()
    if (!query) return
    setGeocoding(true)
    setGeocodeError(null)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=cl`
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
      const data = await res.json()
      if (data.length === 0) {
        setGeocodeError('No se encontró la dirección. Intenta ser más específico.')
      } else {
        onCoordsChange({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
      }
    } catch {
      setGeocodeError('Error al buscar la dirección. Verifica tu conexión.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const item = e.dataTransfer.items[0]
    if (item?.kind === 'file' && item.type.startsWith('image/')) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) onDropPhoto(file)
  }

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

        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate aria-label="Formulario de reporte de accesibilidad">
          {/* Sección fotografía */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-primary" aria-hidden="true" />
                <p className="text-body font-semibold text-text-primary">
                  Fotografía <span className="text-status-rejected" aria-label="obligatorio">*</span>
                </p>
              </div>

              {/* Input de archivo oculto */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                className="sr-only"
                id="photo-input"
                aria-label="Seleccionar fotografía de la barrera"
              />

              {/* Zona de drag-and-drop / preview */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    'w-full rounded-xl border-2 border-dashed transition-all duration-150',
                    'flex flex-col items-center justify-center gap-3 p-6 min-h-[160px]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    isDragOver
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : photoPreview
                      ? 'border-primary/40 bg-primary/5'
                      : errors.photo
                      ? 'border-status-rejected bg-status-rejected-bg'
                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                  )}
                  aria-label={photoPreview ? 'Cambiar fotografía' : 'Seleccionar imagen o arrastrar aquí'}
                >
                  {isDragOver ? (
                    <>
                      <ImageIcon className="w-10 h-10 text-primary" aria-hidden="true" />
                      <p className="text-body font-semibold text-primary">Suelta la imagen aquí</p>
                    </>
                  ) : photoPreview ? (
                    <img src={photoPreview} alt="Vista previa de la fotografía" className="max-h-40 rounded-lg object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-text-secondary" aria-hidden="true" />
                      <div className="text-center">
                        <p className="text-body font-medium text-text-primary">Subir desde galería</p>
                        <p className="text-caption text-text-secondary mt-0.5">
                          JPG, PNG — o arrastra una imagen aquí
                        </p>
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Botón cámara (si hay cámara disponible con permiso) */}
              {hasCamera && cameraPermission === 'granted' && (
                <button
                  type="button"
                  onClick={onOpenCamera}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 text-primary text-body font-semibold hover:bg-primary/5 transition-colors"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  Tomar foto con la cámara
                </button>
              )}

              {/* Aviso si cámara detectada pero sin permiso */}
              {hasCamera && cameraPermission === 'denied' && (
                <p className="mt-2 text-caption text-text-secondary flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Cámara detectada — permite el acceso en tu navegador para tomarfoto directo
                </p>
              )}

              {errors.photo && (
                <p className="text-caption text-status-rejected mt-1.5" role="alert">{errors.photo}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
                <p className="text-body font-semibold text-text-primary">Ubicación</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="latitud" className="text-caption text-text-secondary mb-1 block">Latitud</label>
                  <input
                    id="latitud"
                    type="number"
                    step="any"
                    value={coords.lat}
                    onChange={(e) => onCoordsChange({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg-app rounded-lg px-3 py-2 border border-border text-body font-medium text-text-primary font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="-33.4569"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="longitud" className="text-caption text-text-secondary mb-1 block">Longitud</label>
                  <input
                    id="longitud"
                    type="number"
                    step="any"
                    value={coords.lng}
                    onChange={(e) => onCoordsChange({ ...coords, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-bg-app rounded-lg px-3 py-2 border border-border text-body font-medium text-text-primary font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="-70.6483"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="address-search" className="text-caption text-text-secondary mb-1 block">
                  Buscar por dirección
                </label>
                <div className="flex gap-2">
                  <input
                    id="address-search"
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                    placeholder="Ej: Av. Libertador Bernardo O'Higgins 1235, Santiago"
                    className="flex-1 bg-bg-app rounded-lg px-3 py-2 border border-border text-body text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={geocoding || !addressInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-body font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    aria-label="Buscar dirección en el mapa"
                  >
                    {geocoding ? (
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <Search className="w-4 h-4" aria-hidden="true" />
                    )}
                    Buscar
                  </button>
                </div>
                {geocodeError && (
                  <p className="text-caption text-status-rejected mt-1.5" role="alert">{geocodeError}</p>
                )}
              </div>

              <LocationPickerMap coords={coords} onCoordsChange={onCoordsChange} />
              <p className="text-caption text-text-secondary mt-2">
                Arrastra el pin o haz clic en el mapa para ajustar la ubicación exacta.
              </p>
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
                  {CATEGORIES.map(({ value, label, description: desc }) => (
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
                        onChange={() => onCategoryChange(value)}
                        className="mt-0.5 accent-primary w-4 h-4"
                      />
                      <div>
                        <p className="text-body font-semibold text-text-primary">{label}</p>
                        <p className="text-caption text-text-secondary">{desc}</p>
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
                onChange={(e) => onDescriptionChange(e.target.value)}
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

      {/* Modal de cámara */}
      {isCameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Cámara"
        >
          <div className="relative w-full max-w-md bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={onCloseCamera}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              aria-label="Cerrar cámara"
            >
              <X className="w-5 h-5" />
            </button>

            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover bg-neutral-900"
            />

            <div className="p-4 flex justify-center">
              <button
                type="button"
                onClick={onCapturePhoto}
                className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                aria-label="Capturar foto"
              >
                <Camera className="w-7 h-7 text-primary" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
