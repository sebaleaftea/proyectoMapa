import { useCallback, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useReportStore } from '../../store/reportStore'
import { ReporteModal } from './ReporteModal'
import { reportService } from '../../services/reportService'
import type { ReporteDetalleAPI, ReportStatus } from '../../types'

const SANTIAGO_CENTER = { lat: -33.4569, lng: -70.6483 }

const MARKER_COLORS: Record<ReportStatus, string> = {
  VALIDADO: '#1B5E20',
  PENDIENTE: '#F57F17',
  RECHAZADO: '#B71C1C',
}

const CATEGORY_LABELS = { RAMPA: 'Rampa', ASCENSOR: 'Ascensor', BAÑO: 'Baño accesible' }

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

interface AccesiMapProps {
  filterStatus?: ReportStatus
  height?: string
  showOnlyValidated?: boolean
}

export function AccesiMap({ height = '100%', showOnlyValidated = false }: AccesiMapProps) {
  const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY ?? ''

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GMAPS_KEY,
    id: 'google-map-script',
  })

  const { reports, selectedComuna } = useReportStore()
  const [modalData, setModalData] = useState<ReporteDetalleAPI | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)

  const handleMarkerClick = useCallback(async (reportId: string) => {
    setModalData(null)
    setModalLoading(true)
    try {
      const data = await reportService.getById(reportId)
      setModalData(data)
    } finally {
      setModalLoading(false)
    }
  }, [])

  const closeModal = useCallback(() => {
    setModalData(null)
    setModalLoading(false)
  }, [])

  const filteredReports = reports.filter((r) => {
    if (showOnlyValidated && r.status !== 'VALIDADO') return false
    if (selectedComuna !== 'TODAS' && r.comuna !== selectedComuna) return false
    return true
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  if (loadError || !GMAPS_KEY) {
    return (
      <div
        className="flex items-center justify-center bg-bg-map rounded-xl border border-border"
        style={{ height }}
        role="img"
        aria-label="Mapa no disponible - configure la clave de Google Maps"
      >
        <div className="text-center px-6">
          <p className="text-heading-1 font-semibold text-text-primary mb-2">Mapa no disponible</p>
          <p className="text-body text-text-secondary">
            Configure <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">VITE_GOOGLE_MAPS_KEY</code> en el archivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">.env</code>
          </p>
          <div className="mt-6 p-4 bg-bg-surface rounded-xl border border-border text-left">
            <p className="text-caption text-text-secondary font-semibold mb-2">Reportes cargados ({filteredReports.length}):</p>
            <ul className="flex flex-col gap-1">
              {filteredReports.slice(0, 4).map((r) => (
                <li key={r.id} className="flex items-center gap-2 text-caption text-text-secondary">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: MARKER_COLORS[r.status] }} aria-hidden="true" />
                  {CATEGORY_LABELS[r.category]} — {r.address}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-bg-map rounded-xl animate-pulse"
        style={{ height }}
        aria-label="Cargando mapa..."
        role="status"
      >
        <p className="text-body text-text-secondary">Cargando mapa…</p>
      </div>
    )
  }

  return (
    <>
      <div style={{ height }} className="rounded-xl overflow-hidden border border-border" role="application" aria-label="Mapa interactivo de accesibilidad urbana de Santiago">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={SANTIAGO_CENTER}
          zoom={14}
          onLoad={onLoad}
          options={{
            styles: MAP_STYLES,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={report.coordinates}
              onClick={() => handleMarkerClick(report.id)}
              title={`${CATEGORY_LABELS[report.category]} - ${report.status}`}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: MARKER_COLORS[report.status],
                fillOpacity: 0.9,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 10,
              }}
            />
          ))}
        </GoogleMap>
      </div>

      <ReporteModal data={modalData} loading={modalLoading} onClose={closeModal} />
    </>
  )
}
