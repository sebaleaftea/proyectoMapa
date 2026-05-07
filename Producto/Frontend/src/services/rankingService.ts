import { api } from '../lib/api'
import type { RankingEntryAPI, RankingEntry } from '../types'

function normalizeEntry(r: RankingEntryAPI): RankingEntry {
  return {
    position: r.posicion,
    user: { id: r.usuarioId, name: r.nombre, isAnonymous: r.esAnonimo },
    points: r.puntos,
    reportsCount: r.cantidadReportes,
  }
}

export const rankingService = {
  getranking: async (): Promise<RankingEntry[]> => {
    const res = await api.get<RankingEntryAPI[]>('/ranking')
    const lista = Array.isArray(res.data) ? res.data : (res.data as any).data ?? []
    return lista.map(normalizeEntry)
  },

  getMisPuntos: async (): Promise<number> => {
    const res = await api.get<{ puntos: number } | number>('/usuarios/me/puntos')
    return typeof res.data === 'number' ? res.data : (res.data as any).puntos ?? 0
  },
}
