import { useEffect, useState } from 'react'
import { AlertCircle, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { MunicipalSidebar } from '../../components/layout/MunicipalSidebar'
import { dashboardService, type DashboardMetrics } from '../../services/dashboardService'
import { useReportStore } from '../../store/reportStore'
import { HeatmapSection } from '../../components/dashboard/HeatmapSection'
import { CategoriaChart } from '../../components/dashboard/CategoriaChart'

const COMUNAS = [
  { id: 13114, value: 'Las Condes', label: 'Las Condes' },
  { id: 13123, value: 'Providencia', label: 'Providencia' },
  { id: 13120, value: 'Ñuñoa', label: 'Ñuñoa' },
] as const

const UTM_A_CLP = 65000

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatUTM(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function DashboardMunicipal() {
  const { selectedComuna } = useReportStore()
  const comunaObj = COMUNAS.find((c) => c.value === selectedComuna)
  const activeComunaId = comunaObj?.id ?? 13114

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await dashboardService.obtenerRiesgoMunicipal(activeComunaId)
        setMetrics(data)
      } catch {
        setError('No se pudieron cargar las métricas de riesgo.')
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [activeComunaId])

  const exposicionCLP = metrics ? Math.round(metrics.exposicionMaximaUtm * UTM_A_CLP) : 0

  return (
    <div className="flex flex-1 overflow-hidden">
      <MunicipalSidebar />

      <main className="flex-1 overflow-y-auto bg-bg-app">
        <div className="p-4 md:p-6 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-display font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
              Dashboard de Riesgo Municipal
            </h1>
            <p className="text-body text-text-secondary mt-1">
              Exposición financiera a multas según Ley 20.422 sobre Accesibilidad
            </p>
          </div>

          {error && (
            <Card className="mb-6 border-l-4 border-red-500">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">{error}</p>
                  <p className="text-sm text-red-700 mt-1">
                    Verifica tu conexión e intenta recargar la página.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <h2 className="text-heading-2 font-semibold text-text-primary flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                      Barreras Críticas
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">Reportes validados en MAL_ESTADO</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-5xl font-bold text-amber-600">{metrics?.totalBarreras ?? 0}</div>
                      <p className="text-sm text-text-secondary">Infracciones encontradas en la comuna</p>
                      <div className="mt-4 h-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-red-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-white">
                  <CardHeader className="pb-3">
                    <h2 className="text-heading-2 font-semibold text-text-primary flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-red-600" aria-hidden="true" />
                      Exposición a Multas
                    </h2>
                    <p className="text-sm text-text-secondary mt-1">Máxima penalidad económica</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Exposición en UTM</p>
                        <div className="text-4xl font-bold text-red-600">
                          {metrics ? formatUTM(metrics.exposicionMaximaUtm) : '0.00'}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-red-100">
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">Equivalente en CLP (aprox.)</p>
                        <div className="text-3xl font-bold text-red-700">{formatCurrency(exposicionCLP)}</div>
                        <p className="text-xs text-red-600 mt-1">
                          * Cálculo: 1 UTM ≈ ${UTM_A_CLP.toLocaleString('es-CL')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="pt-5">
                    <HeatmapSection comunaId={activeComunaId} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="text-heading-2 font-semibold text-text-primary flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" aria-hidden="true" />
                      Distribución por Categoría
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">Barreras por tipo de infraestructura</p>
                  </CardHeader>
                  <CardContent>
                    <CategoriaChart comunaId={activeComunaId} />
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-8 bg-blue-50 border-l-4 border-blue-500">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Nota Normativa:</span> Estas métricas se
                    calculan conforme a la <span className="font-semibold">Ley 20.422</span> sobre
                    "Establecimientos públicos de atención abierta al público". La exposición a
                    multas incluye sanciones máximas por infracción validada en estado "MAL_ESTADO".
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
