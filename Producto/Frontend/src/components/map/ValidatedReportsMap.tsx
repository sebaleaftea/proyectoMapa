import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useReportStore } from '../../store/reportStore'
import type { ReportStatus } from '../../types'

const STATUS_COLORS: Record<ReportStatus, string> = {
  VALIDADO: '#1B5E20',
  PENDIENTE: '#F57F17',
  RECHAZADO: '#B71C1C',
}

const CATEGORY_LABELS = { RAMPA: 'Rampa', ASCENSOR: 'Ascensor', BAÑO: 'Baño accesible' }

interface Props {
  height?: string
  showOnlyValidated?: boolean
}

export function ValidatedReportsMap({ height = '420px', showOnlyValidated = false }: Props) {
  const { reports, selectedComuna } = useReportStore()

  const filteredReports = reports.filter((r) => {
    if (showOnlyValidated && r.status !== 'VALIDADO') return false
    if (selectedComuna !== 'TODAS' && r.comuna !== selectedComuna) return false
    return true
  })

  return (
    <div
      style={{ height, isolation: 'isolate' }}
      className="rounded-xl overflow-hidden border border-border"
      aria-label="Mapa de reportes validados"
    >
      <MapContainer
        center={[-33.4569, -70.6483]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredReports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.coordinates.lat, report.coordinates.lng]}
            radius={8}
            fillColor={STATUS_COLORS[report.status]}
            color="#FFFFFF"
            weight={2}
            fillOpacity={0.9}
          >
            <Popup>
              <strong>{CATEGORY_LABELS[report.category]}</strong>
              {report.address && <><br />{report.address}</>}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
