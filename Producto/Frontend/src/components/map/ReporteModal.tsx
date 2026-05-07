import { X, MapPin } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { ReporteDetalleAPI, ReportCategory } from '../../types'

const CATEGORY_LABELS: Record<ReportCategory, string> = {
  RAMPA: 'Rampa',
  ASCENSOR: 'Ascensor',
  BAÑO: 'Baño accesible',
}

interface ReporteModalProps {
  data: ReporteDetalleAPI | null
  loading: boolean
  onClose: () => void
}

export function ReporteModal({ data, loading, onClose }: ReporteModalProps) {
  if (!data && !loading) return null

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
        ) : data ? (
          <>
            <div className="mx-4 rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img
                src={data.fotoUrl}
                alt={`Foto de ${CATEGORY_LABELS[data.categoria]}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-heading-1 font-semibold text-text-primary">
                  {CATEGORY_LABELS[data.categoria]}
                </span>
                <Badge variant="status" status={data.estado} />
              </div>

              {data.descripcion && (
                <p className="text-body text-text-secondary">{data.descripcion}</p>
              )}

              <div className="flex items-start gap-2 text-caption text-text-secondary">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
                <span>
                  {data.latitud.toFixed(5)}, {data.longitud.toFixed(5)}
                </span>
              </div>

              <p className="text-caption text-text-secondary">
                {new Date(data.fechaCreacion).toLocaleDateString('es-CL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
