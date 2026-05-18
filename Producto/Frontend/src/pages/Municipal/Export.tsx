import { useEffect, useState } from 'react'
import { Download, FileJson, Layers, Filter, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { MunicipalSidebar } from '../../components/layout/MunicipalSidebar'
import { useReportStore } from '../../store/reportStore'
import { exportService } from '../../services/exportService'
import type { ReportCategory, Comuna } from '../../types'

const CATEGORIAS: Array<{ value: ReportCategory | 'TODAS'; label: string }> = [
  { value: 'TODAS', label: 'Todas las categorías' },
  { value: 'RAMPA', label: 'Rampas' },
  { value: 'ASCENSOR', label: 'Ascensores' },
  { value: 'BAÑO', label: 'Baños accesibles' },
]

const COMUNAS: Array<{ value: Comuna | 'TODAS'; label: string }> = [
  { value: 'TODAS', label: 'Todas las comunas' },
  { value: 'Las Condes', label: 'Las Condes' },
  { value: 'Providencia', label: 'Providencia' },
  { value: 'Ñuñoa', label: 'Ñuñoa' },
]

type DownloadState = 'geojson' | 'shapefile' | null

export function MunicipalExport() {
  const { reports, fetchReports } = useReportStore()
  const [filterComuna, setFilterComuna] = useState<Comuna | 'TODAS'>('TODAS')
  const [filterCategory, setFilterCategory] = useState<ReportCategory | 'TODAS'>('TODAS')
  const [downloading, setDownloading] = useState<DownloadState>(null)
  const [downloaded, setDownloaded] = useState<DownloadState>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => { fetchReports() }, [])

  const filteredCount = reports.filter((r) => {
    if (r.status !== 'VALIDADO') return false
    if (filterComuna !== 'TODAS' && r.comuna !== filterComuna) return false
    if (filterCategory !== 'TODAS' && r.category !== filterCategory) return false
    return true
  }).length

  const handleDownload = async (type: 'geojson' | 'shapefile') => {
    setDownloading(type)
    setDownloadError(null)
    try {
      if (type === 'shapefile') {
        await exportService.downloadShapefile(filterComuna !== 'TODAS' ? filterComuna : undefined)
      } else {
        await exportService.downloadGeoJSON(filterComuna !== 'TODAS' ? filterComuna : undefined)
      }
      setDownloaded(type)
      setTimeout(() => setDownloaded(null), 3000)
    } catch {
      setDownloadError('Error al generar el archivo. Verifica tu conexión e intenta de nuevo.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <MunicipalSidebar />

      <main className="flex-1 overflow-y-auto bg-bg-app">
        <div className="p-4 md:p-6 max-w-3xl">
          <div className="mb-6">
            <h1 className="text-display font-bold text-text-primary flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" aria-hidden="true" />
              Exportación GIS
            </h1>
            <p className="text-body text-text-secondary mt-1">
              Descarga los reportes validados en formatos compatibles con QGIS y ArcGIS,
              según la Ley 20.422.
            </p>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <h2 className="text-heading-1 font-semibold text-text-primary flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
                Filtros de exportación
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <fieldset>
                  <legend className="text-body font-medium text-text-primary mb-2">Comuna</legend>
                  <div className="flex flex-col gap-1.5">
                    {COMUNAS.map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="comuna"
                          value={value}
                          checked={filterComuna === value}
                          onChange={() => setFilterComuna(value)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-body text-text-primary">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="text-body font-medium text-text-primary mb-2">Categoría</legend>
                  <div className="flex flex-col gap-1.5">
                    {CATEGORIAS.map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={value}
                          checked={filterCategory === value}
                          onChange={() => setFilterCategory(value)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-body text-text-primary">{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-body font-semibold text-text-primary">
                  Registros a exportar:{' '}
                  <span className="text-primary">{filteredCount}</span> reportes validados
                </p>
                <p className="text-caption text-text-secondary mt-0.5">
                  Solo se exportan reportes con estado <strong>VALIDADO</strong> (confianza IA ≥ 85%)
                </p>
              </div>
            </CardContent>
          </Card>

          {downloadError && (
            <div className="mb-4 p-3 bg-status-rejected-bg border border-status-rejected/30 rounded-xl" role="alert">
              <p className="text-caption text-status-rejected">{downloadError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card as="article">
              <CardContent className="pt-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileJson className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-heading-1 font-semibold text-text-primary mb-1">GeoJSON</h3>
                <p className="text-body text-text-secondary mb-4 leading-relaxed">
                  Formato estándar para sistemas GIS. Compatible con QGIS, ArcGIS, Mapbox y APIs geoespaciales.
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleDownload('geojson')}
                  loading={downloading === 'geojson'}
                  disabled={filteredCount === 0 || downloading !== null}
                  className="w-full"
                  aria-label={`Descargar ${filteredCount} reportes en formato GeoJSON`}
                >
                  {downloaded === 'geojson' ? (
                    <><CheckCircle className="w-4 h-4" /> Descargado</>
                  ) : (
                    <><Download className="w-4 h-4" /> Exportar GeoJSON</>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card as="article">
              <CardContent className="pt-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Layers className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-heading-1 font-semibold text-text-primary mb-1">Shapefile (ZIP)</h3>
                <p className="text-body text-text-secondary mb-4 leading-relaxed">
                  Archivo ZIP con capas .shp generadas por el backend, listas para importar en QGIS o ArcGIS.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handleDownload('shapefile')}
                  loading={downloading === 'shapefile'}
                  disabled={filteredCount === 0 || downloading !== null}
                  className="w-full"
                  aria-label={`Descargar ${filteredCount} reportes en formato Shapefile ZIP`}
                >
                  {downloaded === 'shapefile' ? (
                    <><CheckCircle className="w-4 h-4" /> Descargado</>
                  ) : (
                    <><Download className="w-4 h-4" /> Exportar Shapefile</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {filteredCount === 0 && (
            <div className="mt-4 p-4 bg-status-pending-bg border border-status-pending/30 rounded-xl">
              <p className="text-body font-medium text-status-pending">
                No hay reportes validados con los filtros seleccionados.
              </p>
            </div>
          )}

          <div className="mt-6 p-4 bg-bg-surface rounded-xl border border-border">
            <p className="text-caption text-text-secondary">
              Datos generados por AccesiMap CL en cumplimiento del{' '}
              <strong className="text-text-primary">Decreto 50 OGUC</strong> y la{' '}
              <strong className="text-text-primary">Ley 20.422</strong>.
              Los reportes incluidos han sido validados automáticamente con precisión ≥ 85%.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
