import { api } from '../lib/api'
import type { RankingEntryAPI, RankingEntry } from '../types'

function normalizeEntry(r: RankingEntryAPI): RankingEntry {
  return {
    position: r.posicion,
    user: { id: r.usuarioId, name: r.nombre || 'Usuario' },
    points: r.puntos,
    reportsCount: Math.floor(r.puntos / 10),
  }
}

export interface MisPuntosResponse {
  id: string;
  email: string;
  puntos: number;
  posicion: number;
}

export const rankingService = {
  getranking: async (tipo: 'global' | 'mensual'): Promise<RankingEntry[]> => {
    const res = await api.get<RankingEntryAPI[]>(`/ranking?tipo=${tipo}`)
    const lista: RankingEntryAPI[] = Array.isArray(res.data) ? res.data : ((res.data as { data: RankingEntryAPI[] }).data ?? [])
    return lista.map(normalizeEntry)
  },

  getMisPuntos: async (tipo: 'global' | 'mensual', token?: string): Promise<MisPuntosResponse> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const res = await api.get<MisPuntosResponse>(`/usuarios/me/puntos?tipo=${tipo}`, { headers })
    return res.data
  },
}
