import { usePwaInstall } from '../../lib/usePwaInstall'
import { Download } from 'lucide-react'
import { Button } from '../ui/Button'

export function InstallBanner() {
  const { isInstallable, installPwa } = usePwaInstall()

  // Detección simple de iOS para mostrar mensaje alternativo
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

  if (!isInstallable) {
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      return (
        <div className="bg-primary/10 border-b border-primary/20 p-3 flex justify-between items-center text-center">
          <p className="text-caption font-medium text-text-primary w-full">
            Para instalar la app, presiona "Compartir" en Safari y selecciona "Agregar a inicio".
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
      <p className="text-body font-medium text-text-primary">
        Mejora tu experiencia usando nuestra aplicación nativa.
      </p>
      <Button variant="primary" onClick={installPwa} className="flex items-center gap-2 whitespace-nowrap">
        <Download className="w-4 h-4" />
        Obtén la versión para móviles acá
      </Button>
    </div>
  )
}
