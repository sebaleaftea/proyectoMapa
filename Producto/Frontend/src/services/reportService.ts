import { api } from '../lib/api'
import type { ApiResponse, ReporteAPI, ReporteDetalleAPI, Report, ReportCategory, ReportStatus, Comuna } from '../types'

const COMUNA_ID_MAP: Record<string, number> = {
  'Santiago Centro': 1,
  'Ñuñoa': 2,
  'La Reina': 3,
}

// Normaliza un reporte del backend al formato del frontend
function normalizeReporte(r: ReporteAPI): Report {
  return {
    id: r.id,
    category: r.categoria,
    status: r.estado,
    coordinates: { lat: r.latitud, lng: r.longitud },
    description: r.descripcion,
    photoUrl: r.fotoUrl,
    aiConfidence: r.nivelConfianzaIa != null ? Math.round(r.nivelConfianzaIa * 100) : undefined,
    createdAt: r.fechaCreacion,
    address: undefined,
    comuna: (r.comunaNombre as Comuna) ?? 'Santiago Centro',
  }
}

export interface GetReportesParams {
  comunaId?: number
  estado?: ReportStatus
}

export interface CreateReporteParams {
  foto: File
  latitud: number
  longitud: number
  categoria: ReportCategory
  descripcion?: string
}

export interface CreateReporteResponse {
  id: string
  estado: ReportStatus
  nivelConfianzaIa?: number
  puntosOtorgados?: number
  message?: string
}

export const reportService = {
  getAll: async (params?: GetReportesParams): Promise<Report[]> => {
    const res = await api.get<ApiResponse<ReporteAPI[]>>('/reportes', { params })
    const lista = Array.isArray(res.data) ? res.data : (res.data as ApiResponse<ReporteAPI[]>).data
    return lista.map(normalizeReporte)
  },

  getByComuna: async (comunaNombre: string, estado?: ReportStatus): Promise<Report[]> => {
    const comunaId = COMUNA_ID_MAP[comunaNombre]
    return reportService.getAll({ comunaId, estado })
  },

  getById: async (id: string): Promise<ReporteDetalleAPI> => {
    const res = await api.get<ApiResponse<ReporteDetalleAPI>>(`/reportes/${id}`)
    return (res.data as ApiResponse<ReporteDetalleAPI>).data
  },

  create: async (params: CreateReporteParams): Promise<CreateReporteResponse> => {
    const form = new FormData()
    form.append('foto', params.foto)
    form.append('latitud', String(params.latitud))
    form.append('longitud', String(params.longitud))
    form.append('categoria', params.categoria)
    if (params.descripcion) form.append('descripcion', params.descripcion)

    const res = await api.post<ApiResponse<CreateReporteResponse>>('/reportes', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const data = (res.data as ApiResponse<CreateReporteResponse>).data ?? res.data
    return { ...data, message: (res.data as ApiResponse<CreateReporteResponse>).message }
  },
}
