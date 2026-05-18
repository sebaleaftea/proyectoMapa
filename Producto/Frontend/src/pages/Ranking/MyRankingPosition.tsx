import { useEffect, useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { rankingService } from '../../services/rankingService'
import type { MisPuntosResponse } from '../../services/rankingService'


export function MyRankingPosition({ tipo }: { tipo: 'global' | 'mensual' }) {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<MisPuntosResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!user) return
    const fetchStats = async () => {
      setLoading(true)
      try {
        const result = await rankingService.getMisPuntos(tipo)
        setStats(result)
      } catch (error) {
        console.error("Error cargando mis puntos", error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [tipo, user])

  if (!user || loading || !stats) return null;

  // Convertir explícitamente a primitivos seguros para React
  const posicionNum = typeof stats.posicion === 'number' ? stats.posicion : Number(stats.posicion)
  const puntosNum = typeof stats.puntos === 'number' ? stats.puntos : Number(stats.puntos)
  const posicionDisplay: string = posicionNum === 999 ? '>20' : (posicionNum > 0 ? String(posicionNum) : '-')
  const puntosDisplay: string = String(isNaN(puntosNum) ? 0 : puntosNum)

  return (
    <Card className="mb-6 border-primary bg-primary/10">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <h3 className="font-bold text-primary uppercase tracking-wide">Tu Posición ({tipo})</h3>
          <p className="text-sm mt-1 text-text-primary">
            Estás en el puesto <span className="font-bold">#{posicionDisplay}</span> con <span className="font-bold">{puntosDisplay} pts</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
