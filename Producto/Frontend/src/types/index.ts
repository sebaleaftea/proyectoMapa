// Enumeraciones — coinciden exactamente con los enums del backend Java
export type ReportStatus = 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO'
export type ReportCategory = 'RAMPA' | 'ASCENSOR' | 'BAÑO'
export type UserRole = 'CIUDADANO' | 'MUNICIPALIDAD' | 'ADMINISTRADOR'
export type Comuna = 'Santiago Centro' | 'Ñuñoa' | 'La Reina'

export interface Coordinates {
  lat: number
  lng: number
}

// Reporte tal como lo devuelve el backend (GET /reportes)
export interface ReporteAPI {
  id: string
  categoria: ReportCategory
  descripcion?: string
  fotoUrl: string
  latitud: number
  longitud: number
  estado: ReportStatus
  estadoElemento?: string
  justificacionIa?: string
  nivelConfianzaIa?: number   // 0.0–1.0
  fechaCreacion: string
  comunaId?: number
  comunaNombre?: string
}

// Reporte normalizado para el frontend
export interface Report {
  id: string
  category: ReportCategory
  status: ReportStatus
  coordinates: Coordinates
  description?: string
  photoUrl: string
  aiConfidence?: number       // 0–100 (nivelConfianzaIa * 100)
  createdAt: string
  reporterName?: string
  address?: string
  comuna: Comuna
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  esAnonimo?: boolean
}

export interface AuthResponse {
  token: string
  userId: string
  role: UserRole
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  points: number
  avatarUrl?: string
  isAnonymous: boolean
  token: string
  comuna?: Comuna
}

// Gamificación — respuesta de GET /ranking
export interface RankingEntryAPI {
  usuarioId: string
  nombre: string
  esAnonimo: boolean
  puntos: number
  cantidadReportes: number
  posicion: number
}

export interface RankingEntry {
  position: number
  user: { id: string; name: string; isAnonymous: boolean }
  points: number
  reportsCount: number
}

// Estadísticas comunales (derivadas en frontend a partir de los reportes)
export interface ComunaStats {
  comuna: Comuna
  totalValidated: number
  totalRampas: number
  totalAscensores: number
  totalBaños: number
  pendingReview: number
}

// Reporte detalle — respuesta de GET /reportes/:id
export interface ReporteDetalleAPI {
  id: string
  usuarioId: string
  categoria: ReportCategory
  descripcion?: string
  fotoUrl: string
  latitud: number
  longitud: number
  estado: ReportStatus
  estadoElemento?: string
  justificacionIa?: string
  nivelConfianzaIa?: number
  fechaCreacion: string
  fechaActualizacion: string
}

// Wrapper estándar de respuestas del backend
export interface ApiResponse<T> {
  data: T
  message?: string
  count?: number
}
