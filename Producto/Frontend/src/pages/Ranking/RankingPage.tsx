import { useEffect, useState } from 'react'
import { Trophy, Medal, Star, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAuthStore } from '../../store/authStore'
import { rankingService } from '../../services/rankingService'
import { cn } from '../../lib/utils'
import type { RankingEntry } from '../../types'

const MEDAL_CONFIG = [
  { color: '#FFD700', icon: Trophy, label: 'Primer lugar' },
  { color: '#C0C0C0', icon: Medal, label: 'Segundo lugar' },
  { color: '#CD7F32', icon: Medal, label: 'Tercer lugar' },
]

function PositionIcon({ position }: { position: number }) {
  if (position <= 3) {
    const { color, icon: Icon, label } = MEDAL_CONFIG[position - 1]
    return <Icon className="w-6 h-6" style={{ color }} aria-label={label} />
  }
  return (
    <span className="w-6 text-center text-body font-bold text-text-secondary" aria-label={`Posición ${position}`}>
      {position}
    </span>
  )
}

function Avatar({ name, isAnonymous }: { name: string; isAnonymous: boolean }) {
  const initials = isAnonymous ? '?' : name.split(' ').map((n) => n[0]).slice(0, 2).join('')
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-body font-bold text-white shrink-0',
        isAnonymous ? 'bg-text-secondary' : 'bg-primary'
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

export function RankingPage() {
  const { user } = useAuthStore()
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRanking = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await rankingService.getranking()
      setRanking(data)
    } catch {
      setError('No se pudo cargar el ranking. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRanking() }, [])

  const userPosition = user
    ? ranking.find((r) => r.user.id === user.id) ??
      { position: ranking.length + 1, user: { id: user.id, name: user.name, isAnonymous: user.isAnonymous }, points: user.points, reportsCount: Math.floor(user.points / 10) }
    : null

  const now = new Date()
  const mesLabel = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })

  return (
    <main className="flex-1 px-4 py-6 bg-bg-app pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-accent" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-display font-bold text-text-primary">Ranking Mensual</h1>
              <p className="text-caption text-text-secondary capitalize">{mesLabel} · Santiago, Chile</p>
            </div>
          </div>
          <button
            onClick={fetchRanking}
            disabled={loading}
            className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="Actualizar ranking"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-xl text-caption text-status-rejected" role="alert">
            {error}
          </div>
        )}

        {user && !user.isAnonymous && userPosition && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="pt-4">
              <p className="text-caption font-semibold text-primary uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" aria-hidden="true" />
                Tu posición
              </p>
              <div className="flex items-center gap-4">
                <PositionIcon position={userPosition.position} />
                <Avatar name={userPosition.user.name} isAnonymous={userPosition.user.isAnonymous} />
                <div className="flex-1 min-w-0">
                  <p className="text-body font-semibold text-text-primary truncate">{userPosition.user.name}</p>
                  <p className="text-caption text-text-secondary">{userPosition.reportsCount} reportes</p>
                </div>
                <div className="text-right">
                  <p className="text-heading-1 font-bold text-accent">{userPosition.points}</p>
                  <p className="text-caption text-text-secondary">puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-heading-1 font-semibold text-text-primary">Tabla de posiciones</h2>
          </CardHeader>

          {loading && ranking.length === 0 ? (
            <div className="px-5 py-8 text-center text-body text-text-secondary" role="status" aria-live="polite">
              Cargando ranking…
            </div>
          ) : ranking.length === 0 ? (
            <div className="px-5 py-8 text-center text-body text-text-secondary">
              Aún no hay reportes este mes. ¡Sé el primero!
            </div>
          ) : (
            <div role="list" aria-label="Clasificación de ciudadanos por reportes de accesibilidad">
              {ranking.map((entry, i) => (
                <div
                  key={entry.user.id}
                  role="listitem"
                  className={cn(
                    'flex items-center gap-4 px-5 py-4 transition-colors',
                    i < ranking.length - 1 && 'border-b border-border',
                    entry.position <= 3 && 'bg-gray-50/50',
                    user?.id === entry.user.id && 'bg-primary/5'
                  )}
                >
                  <div className="w-6 flex items-center justify-center">
                    <PositionIcon position={entry.position} />
                  </div>
                  <Avatar name={entry.user.name} isAnonymous={entry.user.isAnonymous} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-text-primary truncate">
                      {entry.user.isAnonymous ? 'Usuario Anónimo' : entry.user.name}
                      {user?.id === entry.user.id && (
                        <span className="ml-2 text-caption text-primary font-normal">(tú)</span>
                      )}
                    </p>
                    <p className="text-caption text-text-secondary">{entry.reportsCount} reportes validados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-heading-1 font-bold text-accent">{entry.points}</p>
                    <p className="text-caption text-text-secondary">pts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="mt-4 p-4 bg-bg-surface rounded-xl border border-border">
          <p className="text-caption text-text-secondary text-center">
            Cada reporte validado por IA (≥85% de confianza) suma <strong className="text-accent">+10 puntos</strong>.
            El ranking se actualiza diariamente.
          </p>
        </div>
      </div>
    </main>
  )
}
