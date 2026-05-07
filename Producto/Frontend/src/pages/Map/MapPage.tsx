import { useEffect } from 'react'
import { MapPin, Filter, RefreshCw } from 'lucide-react'
import { AccesiMap } from '../../components/map/AccesiMap'
import { Badge } from '../../components/ui/Badge'
import { useReportStore } from '../../store/reportStore'
import type { Comuna } from '../../types'
import { cn } from '../../lib/utils'

const COMUNAS: Array<{ value: Comuna | 'TODAS'; label: string }> = [
  { value: 'TODAS', label: 'Todas las comunas' },
  { value: 'Santiago Centro', label: 'Santiago Centro' },
  { value: 'Ñuñoa', label: 'Ñuñoa' },
  { value: 'La Reina', label: 'La Reina' },
]

export function MapPage() {
  const { reports, loading, error, fetchReports, selectedComuna, setSelectedComuna } = useReportStore()

  useEffect(() => {
    fetchReports()
  }, [])

  const validatedCount = reports.filter(
    (r) => r.status === 'VALIDADO' && (selectedComuna === 'TODAS' || r.comuna === selectedComuna)
  ).length

  return (
    <main className="flex-1 flex flex-col">
      <div className="px-4 py-3 bg-bg-surface border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-heading-1 font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
            Mapa de Accesibilidad
          </h1>
          <p className="text-caption text-text-secondary mt-0.5">
            {loading
              ? 'Cargando reportes…'
              : error
              ? 'Error al cargar — '
              : `${validatedCount} reporte${validatedCount !== 1 ? 's' : ''} validado${validatedCount !== 1 ? 's' : ''} ${selectedComuna !== 'TODAS' ? `en ${selectedComuna}` : 'en Santiago'}`}
            {error && (
              <button
                onClick={fetchReports}
                className="text-primary underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
              >
                reintentar
              </button>
            )}
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className={cn(
            'hidden sm:flex items-center gap-1.5 text-caption text-text-secondary hover:text-primary transition-colors',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded px-2 py-1',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Actualizar reportes"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} aria-hidden="true" />
          Actualizar
        </button>

        <div className="flex items-center gap-2" role="group" aria-label="Filtrar por comuna">
          <Filter className="w-4 h-4 text-text-secondary shrink-0" aria-hidden="true" />
          <div className="flex gap-1.5 flex-wrap">
            {COMUNAS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedComuna(value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-caption font-medium transition-colors min-h-[32px]',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  selectedComuna === value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200 hover:text-text-primary'
                )}
                aria-pressed={selectedComuna === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 md:p-4 bg-bg-app">
        <AccesiMap height="calc(100vh - 180px)" showOnlyValidated={false} />
      </div>

      <div className="px-4 py-2 bg-bg-surface border-t border-border">
        <div className="flex items-center gap-4 text-caption text-text-secondary" role="list" aria-label="Leyenda del mapa">
          {[
            { status: 'VALIDADO', label: 'Validado (IA ≥85%)' },
            { status: 'PENDIENTE', label: 'En revisión' },
            { status: 'RECHAZADO', label: 'Rechazado' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1.5" role="listitem">
              <Badge variant="status" status={status as any} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
