import { create } from 'zustand'
import type { Report, ComunaStats, Comuna } from '../types'
import { reportService } from '../services/reportService'

function computeStats(reports: Report[]): ComunaStats[] {
  const comunas: Comuna[] = ['Las Condes', 'Providencia', 'Ñuñoa']
  return comunas.map((comuna) => {
    const comunaReports = reports.filter((r) => r.comuna === comuna)
    return {
      comuna,
      totalValidated: comunaReports.filter((r) => r.status === 'VALIDADO').length,
      totalRampas: comunaReports.filter((r) => r.status === 'VALIDADO' && r.category === 'RAMPA').length,
      totalAscensores: comunaReports.filter((r) => r.status === 'VALIDADO' && r.category === 'ASCENSOR').length,
      totalBaños: comunaReports.filter((r) => r.status === 'VALIDADO' && r.category === 'BAÑO').length,
      pendingReview: comunaReports.filter((r) => r.status === 'PENDIENTE').length,
    }
  })
}

interface ReportState {
  reports: Report[]
  stats: ComunaStats[]
  selectedComuna: Comuna | 'TODAS'
  loading: boolean
  error: string | null
  fetchReports: () => Promise<void>
  setSelectedComuna: (comuna: Comuna | 'TODAS') => void
  prependReport: (report: Report) => void
}

export const useReportStore = create<ReportState>()((set, get) => ({
  reports: [],
  stats: [],
  selectedComuna: 'TODAS',
  loading: false,
  error: null,

  fetchReports: async () => {
    set({ loading: true, error: null })
    try {
      const reports = await reportService.getAll()
      set({ reports, stats: computeStats(reports), loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Error al cargar reportes' })
    }
  },

  setSelectedComuna: (selectedComuna) => set({ selectedComuna }),

  prependReport: (report) => {
    const reports = [report, ...get().reports]
    set({ reports, stats: computeStats(reports) })
  },
}))
