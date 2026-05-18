import { api } from '../lib/api'

export interface DashboardMetrics {
  totalBarreras: number
  exposicionMaximaUtm: number
}
// Interfaz para el Gráfico de Barras
export interface CategoriaStat {
  categoria: string;
  cantidad: number;
}

// Interfaz para el Mapa de Calor (Leaflet)
export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

// ======================== VALIDACIONES CIUDADANAS ========================

/**
 * DTO para enviar validación desde el frontend al backend
 */
export interface ValidacionRequestDTO {
  esPositiva: boolean
  comentario?: string
}

/**
 * DTO para recibir validaciones del backend
 */
export interface ValidacionResponseDTO {
  nombreUsuario: string
  esPositiva: boolean
  comentario: string
  fechaCreacion: string
}
/**
 * Servicio para obtener métricas de riesgo municipal del dashboard.
 * Consume el endpoint `/api/v1/dashboard/riesgo-municipal/{comunaId}`
 */
export const dashboardService = {
  /**
   * Obtiene métricas de riesgo (barreras validadas y exposición a multas)
   * para una comuna específica según la Ley 20.422
   */
  obtenerRiesgoMunicipal: async (comunaId: number): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>(
      `/dashboard/riesgo-municipal/${comunaId}`
    )
    return response.data
  },
  obtenerHeatmap: async (comunaId: number): Promise<HeatmapPoint[]> => {
    const response = await api.get(`/dashboard/heatmap/${comunaId}`);
    return response.data;
  },

  obtenerEstadisticas: async (comunaId: number): Promise<CategoriaStat[]> => {
    const response = await api.get(`/dashboard/estadisticas/por-categoria/${comunaId}`);
    return response.data;
  },

  // ======================== VALIDACIONES CIUDADANAS ========================

  /**
   * Obtiene todas las validaciones ciudadanas de un reporte específico.
   * Las validaciones se retornan ordenadas por fecha descendente.
   *
   * @param reporteId ID del reporte (UUID)
   * @returns Promise con lista de ValidacionResponseDTO
   */
  obtenerValidaciones: async (reporteId: string): Promise<ValidacionResponseDTO[]> => {
    const response = await api.get<ValidacionResponseDTO[]>(
      `/reportes/${reporteId}/validaciones`
    )
    return response.data
  },

  /**
   * Crea una nueva validación ciudadana para un reporte.
   * El email del usuario se extrae automáticamente del JWT en el backend.
   *
   * @param reporteId ID del reporte (UUID)
   * @param data DTO con voto (esPositiva) y comentario opcional
   * @returns Promise con la validación creada
   */
  crearValidacion: async (
    reporteId: string,
    data: ValidacionRequestDTO
  ): Promise<ValidacionResponseDTO> => {
    const response = await api.post<ValidacionResponseDTO>(
      `/reportes/${reporteId}/validaciones`,
      data
    )
    return response.data
  },
}

