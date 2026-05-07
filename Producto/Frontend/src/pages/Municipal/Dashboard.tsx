import { LayoutDashboard, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { AccesiMap } from '../../components/map/AccesiMap'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MunicipalSidebar } from '../../components/layout/MunicipalSidebar'
import { useReportStore } from '../../store/reportStore'
import { useAuthStore } from '../../store/authStore'
import type { Comuna } from '../../types'
import { cn } from '../../lib/utils'

const COMUNAS: Array<{ value: Comuna | 'TODAS'; label: string }> = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'Santiago Centro', label: 'Santiago Centro' },
  { value: 'Ñuñoa', label: 'Ñuñoa' },
  { value: 'La Reina', label: 'La Reina' },
]

export function MunicipalDashboard() {
  const { reports, stats, selectedComuna, setSelectedComuna } = useReportStore()
  const { user } = useAuthStore()

  const currentStats = selectedComuna === 'TODAS'
    ? stats.reduce(
        (acc, s) => ({
          ...acc,
          totalValidated: acc.totalValidated + s.totalValidated,
          totalRampas: acc.totalRampas + s.totalRampas,
          totalAscensores: acc.totalAscensores + s.totalAscensores,
          totalBaños: acc.totalBaños + s.totalBaños,
          pendingReview: acc.pendingReview + s.pendingReview,
        }),
        { totalValidated: 0, totalRampas: 0, totalAscensores: 0, totalBaños: 0, pendingReview: 0 }
      )
    : stats.find((s) => s.comuna === selectedComuna) ?? stats[0]

  const recentReports = reports
    .filter((r) => selectedComuna === 'TODAS' || r.comuna === selectedComuna)
    .slice(0, 6)

  const kpis = [
    { label: 'Total validados', value: currentStats.totalValidated, icon: CheckCircle, color: 'text-status-validated', bg: 'bg-status-validated-bg' },
    { label: 'Rampas', value: currentStats.totalRampas, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Ascensores', value: currentStats.totalAscensores, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'En revisión', value: currentStats.pendingReview, icon: Clock, color: 'text-status-pending', bg: 'bg-status-pending-bg' },
  ]

  return (
    <div className="flex flex-1 overflow-hidden">
      <MunicipalSidebar />

      <main className="flex-1 overflow-y-auto bg-bg-app">
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-display font-bold text-text-primary flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-primary" aria-hidden="true" />
                Dashboard Comunal
              </h1>
              <p className="text-caption text-text-secondary mt-0.5">
                {user?.name} · Datos en tiempo real
              </p>
            </div>

            <div className="flex items-center gap-2" role="group" aria-label="Filtrar por comuna">
              {COMUNAS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSelectedComuna(value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-body font-medium transition-colors min-h-touch',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                    selectedComuna === value
                      ? 'bg-primary text-white'
                      : 'bg-bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/50'
                  )}
                  aria-pressed={selectedComuna === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" role="list" aria-label="Indicadores clave">
            {kpis.map(({ label, value, icon: Icon, color, bg }) => (
              <li key={label}>
                <Card as="article">
                  <CardContent className="pt-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                      <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-bold text-text-primary leading-none">{value}</p>
                    <p className="text-caption text-text-secondary mt-1">{label}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-heading-1 font-semibold text-text-primary">
                    Mapa comunal — Reportes validados
                  </h2>
                </CardHeader>
                <CardContent>
                  <AccesiMap height="420px" showOnlyValidated />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <h2 className="text-heading-1 font-semibold text-text-primary flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" aria-hidden="true" />
                    Reportes recientes
                  </h2>
                </CardHeader>
                <div role="list" aria-label="Últimos reportes recibidos">
                  {recentReports.map((report, i) => (
                    <div
                      key={report.id}
                      role="listitem"
                      className={cn(
                        'px-5 py-3 flex items-start gap-3',
                        i < recentReports.length - 1 && 'border-b border-border'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-body font-medium text-text-primary">
                            {report.category === 'RAMPA' ? 'Rampa' : report.category === 'ASCENSOR' ? 'Ascensor' : 'Baño'}
                          </p>
                          <Badge variant="status" status={report.status} />
                        </div>
                        <p className="text-caption text-text-secondary truncate">{report.address}</p>
                        {report.aiConfidence && (
                          <p className="text-caption text-text-secondary mt-0.5">IA: {report.aiConfidence}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
