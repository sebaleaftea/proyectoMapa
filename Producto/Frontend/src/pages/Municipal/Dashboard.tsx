import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, Clock, TrendingUp } from 'lucide-react'
import { HeatmapSection } from '../../components/dashboard/HeatmapSection'
import { CategoriaChart } from '../../components/dashboard/CategoriaChart'
import { dashboardService } from '../../services/dashboardService'
import { ValidatedReportsMap } from '../../components/map/ValidatedReportsMap'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { MunicipalSidebar } from '../../components/layout/MunicipalSidebar'
import { useReportStore } from '../../store/reportStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

const COMUNAS = [
  { id: 0, value: 'TODAS', label: 'Todas' },
  { id: 13114, value: 'Las Condes', label: 'Las Condes' },
  { id: 13123, value: 'Providencia', label: 'Providencia' },
  { id: 13120, value: 'Ñuñoa', label: 'Ñuñoa' },
] as const;

export function MunicipalDashboard() {
  const { reports, stats, selectedComuna, setSelectedComuna } = useReportStore()
  const { user } = useAuthStore()
  const [metrics, setMetrics] = useState({ totalBarreras: 0, exposicionMaximaUtm: 0 })
  const getComunaId = (nombre: string): number => {
  const comuna = COMUNAS.find(c => c.value === nombre);
  return comuna ? comuna.id : 1; // 1 como fallback por defecto
};
  // 1. Objeto seguro de respaldo
  const defaultStats = { totalValidated: 0, totalRampas: 0, totalAscensores: 0, totalBaños: 0, pendingReview: 0 }

  // 2. Cálculo protegido contra arreglos vacíos (undefined)
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
      defaultStats
    )
    : stats.find((s) => s.comuna === selectedComuna) ?? stats[0] ?? defaultStats

  
  const activeComunaId = getComunaId(selectedComuna);


  useEffect(() => {
    if (selectedComuna === 'TODAS') return

    dashboardService.obtenerRiesgoMunicipal(activeComunaId)
      .then((data) => {
        setMetrics({
          totalBarreras: data.totalBarreras ?? 0,
          exposicionMaximaUtm: data.exposicionMaximaUtm ?? 0,
        })
      })
      .catch((err) => console.error('Error cargando métricas:', err))
  }, [activeComunaId, selectedComuna])

  const displayMetrics = selectedComuna === 'TODAS'
    ? { totalBarreras: 0, exposicionMaximaUtm: 0 }
    : metrics

  const recentReports = reports
    .filter((r) => selectedComuna === 'TODAS' || r.comuna === selectedComuna)
    .slice(0, 6)

  const kpis = [
    {
      label: 'Exposición (UTM)',
      value: displayMetrics.exposicionMaximaUtm.toFixed(2),
      icon: TrendingUp,
      color: 'text-status-rejected',
      bg: 'bg-status-rejected-bg',
      subtitle: undefined as string | undefined,
    },
    { label: 'Barreras en mal estado', value: displayMetrics.totalBarreras, icon: TrendingUp, color: 'text-status-rejected', bg: 'bg-status-rejected-bg', subtitle: undefined as string | undefined },
    { label: 'Rampas', value: currentStats.totalRampas, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', subtitle: undefined as string | undefined },
    { label: 'Ascensores', value: currentStats.totalAscensores, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', subtitle: undefined as string | undefined },
    { label: 'Baños', value: currentStats.totalBaños, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', subtitle: undefined as string | undefined },
    { label: 'En revisión', value: currentStats.pendingReview, icon: Clock, color: 'text-status-pending', bg: 'bg-status-pending-bg', subtitle: undefined as string | undefined },
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
            {kpis.map(({ label, value, icon: Icon, color, bg, subtitle }) => (
              <li key={label}>
                <Card as="article">
                  <CardContent className="pt-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', bg)}>
                      <Icon className={cn('w-5 h-5', color)} aria-hidden="true" />
                    </div>
                    <p className="text-3xl font-bold text-text-primary leading-none">{value}</p>
                    <p className="text-caption text-text-secondary mt-1">{label}</p>
                    {subtitle && (
                      <p className={cn("text-xs font-semibold mt-2", color)}>
                        {subtitle}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <h2 className="text-heading-1 font-semibold text-text-primary">
                  Estadísticas por Categoría
                </h2>
              </CardHeader>
              <CardContent>
                <CategoriaChart comunaId={activeComunaId} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-heading-1 font-semibold text-text-primary">
                  Mapa de Calor de Riesgo
                </h2>
              </CardHeader>
              <CardContent>
                <HeatmapSection comunaId={activeComunaId} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h2 className="text-heading-1 font-semibold text-text-primary">
                    Mapa comunal — Reportes validados
                  </h2>
                </CardHeader>
                <CardContent>
                  <ValidatedReportsMap height="420px" showOnlyValidated />
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
