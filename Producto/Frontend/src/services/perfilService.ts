import { api } from '../lib/api'
import type { ReporteDetalleAPI } from '../types'

export interface PerfilData {
  id: string
  email: string
  nombreUsuario: string
  puntosGamificacion: number
  fechaCreacion: string
}

export interface ActualizarPerfilData {
  nombreUsuario?: string
  passwordActual?: string
  passwordNueva?: string
}

export const perfilService = {
  getMiPerfil: async (): Promise<PerfilData> => {
    const res = await api.get<PerfilData>('/usuarios/me')
    return res.data
  },

  getMisReportes: async (): Promise<ReporteDetalleAPI[]> => {
    const res = await api.get<{ data: ReporteDetalleAPI[] }>('/usuarios/me/reportes')
    return res.data.data ?? []
  },

  actualizarPerfil: async (data: ActualizarPerfilData): Promise<PerfilData> => {
    const res = await api.patch<{ data: PerfilData }>('/usuarios/me', data)
    return res.data.data
  },
}
