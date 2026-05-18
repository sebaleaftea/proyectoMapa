import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previene que aparezca el prompt automático estándar de Chrome
      e.preventDefault()
      // Guarda el evento para poder dispararlo luego con nuestro botón
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installPwa = async () => {
    if (!deferredPrompt) return
    
    // Muestra el prompt nativo de instalación
    await deferredPrompt.prompt()
    
    // Espera a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('El usuario aceptó la instalación')
    } else {
      console.log('El usuario rechazó la instalación')
    }
    
    // El prompt solo se puede usar una vez
    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return { isInstallable, installPwa }
}
