import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los íconos de Leaflet en Vite (rutas de assets rotas por defecto)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Coords {
  lat: number
  lng: number
}

interface Props {
  coords: Coords
  onCoordsChange: (coords: Coords) => void
}

/**
 * Subcomponente: escucha clicks en el mapa y actualiza las coords.
 */
function ClickHandler({ onCoordsChange }: { onCoordsChange: (c: Coords) => void }) {
  useMapEvents({
    click(e) {
      onCoordsChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

/**
 * Subcomponente: vuela suavemente hacia la nueva posición de coords
 * cuando el usuario edita los inputs de texto manualmente.
 */
function MapSync({ coords }: { coords: Coords }) {
  const map = useMap()
  const prevCoords = useRef<Coords>(coords)

  useEffect(() => {
    const prev = prevCoords.current
    // Solo vuela si el cambio de coordenadas fue significativo (evita loops)
    const dist = Math.abs(coords.lat - prev.lat) + Math.abs(coords.lng - prev.lng)
    if (dist > 0.0001) {
      map.flyTo([coords.lat, coords.lng], map.getZoom(), { animate: true, duration: 0.8 })
    }
    prevCoords.current = coords
  }, [coords, map])

  return null
}

/**
 * Mapa interactivo para seleccionar/ajustar ubicación de un reporte.
 * - Click en el mapa mueve el pin
 * - Pin arrastrable actualiza las coords
 * - Sincroniza automáticamente si las coords cambian desde fuera (inputs / geocoding)
 */
export function LocationPickerMap({ coords, onCoordsChange }: Props) {
  const position: [number, number] = [coords.lat, coords.lng]

  return (
    <div
      className="rounded-xl overflow-hidden border border-border shadow-sm mt-3"
      style={{ height: '300px', isolation: 'isolate' }}
      aria-label="Mapa para seleccionar ubicación del reporte"
    >
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Sincroniza el mapa cuando cambian las coords externamente */}
        <MapSync coords={coords} />

        {/* Detecta clicks en el mapa */}
        <ClickHandler onCoordsChange={onCoordsChange} />

        {/* Pin arrastrable */}
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const latlng = (e.target as L.Marker).getLatLng()
              onCoordsChange({ lat: latlng.lat, lng: latlng.lng })
            },
          }}
        />
      </MapContainer>
    </div>
  )
}
