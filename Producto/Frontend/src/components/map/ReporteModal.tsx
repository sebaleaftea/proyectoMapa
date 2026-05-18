import { X, MapPin } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { ReporteDetalleAPI, ReportCategory } from '../../types'
import { useState, useCallback } from 'react'
import { ValidacionesModal } from '../modals/ValidacionesModal'
import { reportService } from '../../services/reportService'

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  RAMPA: 'Rampa',
  ASCENSOR: 'Ascensor',
  BAÑO: 'Baño accesible',
}

interface ReporteModalProps {
  data: ReporteDetalleAPI | null
  loading: boolean
  reporteId: string
  onClose: () => void
  onDataRefetch?: (newData: ReporteDetalleAPI) => void
}

export function ReporteModal({ data, loading, reporteId, onClose, onDataRefetch }: ReporteModalProps) {
  if (!data && !loading) return null

  const [mostrarValidaciones, setMostrarValidaciones] = useState(false)
  const [localData, setLocalData] = useState<ReporteDetalleAPI | null>(null)

  // Usa localData si está disponible (actualizado tras un voto), si no el prop original
  const displayData = localData ?? data

  /**
   * Callback que se ejecuta cuando el usuario envía un voto exitoso.
   * Hace un refetch del detalle del reporte para actualizar los contadores.
   */
  const handleValidacionExitosa = useCallback(async () => {
    try {
      const updated = await reportService.getById(reporteId)
      setLocalData(updated)
      onDataRefetch?.(updated)
    } catch {
      // Si falla el refetch, el modal se cierra y el usuario puede volver a abrir
    }
  }, [reporteId, onDataRefetch])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detalle del reporte"
    >
      <div
        className="bg-bg-surface rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3 pb-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-text-secondary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : displayData ? (
          <>
            <div className="mx-4 rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img
                src={displayData.fotoUrl}
                alt={`Foto de ${CATEGORY_LABELS[displayData.categoria]}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-heading-1 font-semibold text-text-primary">
                  {CATEGORY_LABELS[displayData.categoria]}
                </span>
                <Badge variant="status" status={displayData.estado} />
              </div>

              {displayData.descripcion && (
                <p className="text-body text-text-secondary">{displayData.descripcion}</p>
              )}

              <div className="flex items-start gap-2 text-caption text-text-secondary">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>
                  {displayData.latitud.toFixed(5)}, {displayData.longitud.toFixed(5)}
                </span>
              </div>

              <p className="text-caption text-text-secondary">
                {new Date(displayData.fechaCreacion).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              {/* Metadatos de validación (IA vs Ciudadana) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Lado Izquierdo: Confianza IA — multiplicamos por 100 para pasar de decimal a % */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-text-secondary">Confianza IA:</span>
                    <span className="text-caption font-semibold text-text-primary">
                      {Math.round((displayData.nivelConfianzaIa ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(0, (displayData.nivelConfianzaIa ?? 0) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Lado Derecho: Aprobación Ciudadana */}
                <div className="space-y-1">
                  {displayData.porcentajeCiudadano == null ? (
                    <div className="text-caption text-text-secondary">Sin votos ciudadanos</div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-caption text-text-secondary">Aprobación Ciudadana:</span>
                      <span className="text-caption font-semibold text-text-primary">
                        {Math.round(displayData.porcentajeCiudadano * 10) / 10}%
                        {typeof displayData.totalValidacionesCiudadanas === 'number' ? ` (${displayData.totalValidacionesCiudadanas})` : ''}
                      </span>
                    </div>
                  )}

                  {/* Mini barra */}
                  {displayData.porcentajeCiudadano != null && (
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          displayData.porcentajeCiudadano >= 80 ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, displayData.porcentajeCiudadano))}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botón para abrir validaciones */}
              <button
                onClick={() => setMostrarValidaciones(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Ver Validaciones
              </button>

            </div>
            <>
              {/* Modal de validaciones */}
              {mostrarValidaciones && (
                <ValidacionesModal
                  reporteId={displayData.id ?? reporteId}
                  onClose={() => setMostrarValidaciones(false)}
                  onValidacionExitosa={handleValidacionExitosa}
                />
              )}
            </>
          </>
        ) : null}
      </div>
    </div>
  )
}
