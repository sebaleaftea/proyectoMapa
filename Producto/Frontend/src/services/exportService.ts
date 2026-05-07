import { api } from '../lib/api'

const COMUNA_ID_MAP: Record<string, number> = {
  'Santiago Centro': 1,
  'Ñuñoa': 2,
  'La Reina': 3,
}

export const exportService = {
  downloadShapefile: async (comunaNombre?: string): Promise<void> => {
    const params: Record<string, number> = {}
    if (comunaNombre && comunaNombre !== 'TODAS' && COMUNA_ID_MAP[comunaNombre]) {
      params.comunaId = COMUNA_ID_MAP[comunaNombre]
    }

    const res = await api.get('/export/shapefile', {
      params,
      responseType: 'blob',
    })

    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `accesimap_shapefile_${comunaNombre ?? 'todas'}_${new Date().toISOString().split('T')[0]}.zip`
    a.click()
    URL.revokeObjectURL(url)
  },

  downloadGeoJSON: async (comunaNombre?: string): Promise<void> => {
    // El backend actualmente solo expone Shapefile/ZIP.
    // Este método obtiene los reportes validados y los serializa a GeoJSON en el cliente.
    const { reportService } = await import('./reportService')
    const params = comunaNombre && comunaNombre !== 'TODAS' ? { comunaId: COMUNA_ID_MAP[comunaNombre] } : undefined
    const reportes = await reportService.getAll({ ...params, estado: 'VALIDADO' })

    const geojson = {
      type: 'FeatureCollection',
      features: reportes.map((r) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.coordinates.lng, r.coordinates.lat] },
        properties: {
          id: r.id,
          categoria: r.category,
          estado: r.status,
          comuna: r.comuna,
          nivelConfianzaIa: r.aiConfidence != null ? r.aiConfidence / 100 : null,
          fechaCreacion: r.createdAt,
        },
      })),
    }

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `accesimap_geojson_${comunaNombre ?? 'todas'}_${new Date().toISOString().split('T')[0]}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  },
}
