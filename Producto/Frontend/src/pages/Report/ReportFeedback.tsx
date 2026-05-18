import { CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { SubmitState } from './useReportForm'
import type { ReportCategory } from '../../types'

const CATEGORY_LABEL: Record<ReportCategory, string> = {
  RAMPA: 'rampa',
  ASCENSOR: 'ascensor',
  BAÑO: 'baño',
}

interface Props {
  submitState: Extract<SubmitState, 'success' | 'warning' | 'error'>
  earnedPoints: number
  category: ReportCategory | null
  onNavigateToMap: () => void
  onRetry: () => void
  onReset: () => void
}

export function ReportFeedback({ submitState, earnedPoints, category, onNavigateToMap, onRetry, onReset }: Props) {
  if (submitState === 'success') {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-status-validated-bg flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-status-validated" aria-hidden="true" />
          </div>
          <h1 className="text-display font-bold text-text-primary mb-2">¡Reporte validado!</h1>
          <p className="text-body text-text-secondary mb-2">Tu reporte fue confirmado por Inteligencia Artificial.</p>
          {earnedPoints > 0 && (
            <p className="text-heading-1 font-bold text-accent mb-6">+{earnedPoints} puntos ganados</p>
          )}
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={onNavigateToMap}>Ver en el mapa</Button>
            <Button variant="ghost" onClick={onReset}>Enviar otro reporte</Button>
          </div>
        </div>
      </main>
    )
  }

  if (submitState === 'warning') {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-status-pending-bg flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-10 h-10 text-status-pending" aria-hidden="true" />
          </div>
          <h1 className="text-display font-bold text-text-primary mb-2">Reporte recibido</h1>
          <p className="text-body text-text-secondary mb-6">
            La imagen tiene baja calidad. Un revisor humano lo evaluará en las próximas 48 horas.
          </p>
          <Button variant="primary" onClick={onNavigateToMap}>Volver al mapa</Button>
        </div>
      </main>
    )
  }

  const categoryLabel = category ? CATEGORY_LABEL[category] : 'elemento'
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12 bg-bg-app" aria-live="assertive">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-status-rejected-bg flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-10 h-10 text-status-rejected" aria-hidden="true" />
        </div>
        <h1 className="text-display font-bold text-text-primary mb-2">Reporte rechazado</h1>
        <p className="text-body text-text-secondary mb-6">
          No se detectó una {categoryLabel} válida en la fotografía.
        </p>
        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={onRetry}>Intentar con otra foto</Button>
          <Button variant="ghost" onClick={onNavigateToMap}>Volver al mapa</Button>
        </div>
      </div>
    </main>
  )
}
