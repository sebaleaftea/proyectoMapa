import { useEffect, useState } from 'react'
import { useThemeClasses } from '../../lib/useThemeClasses'
import { ThumbsUp, ThumbsDown, X } from 'lucide-react'
import type { ValidacionResponseDTO, ValidacionRequestDTO } from '../../services/dashboardService'
import { dashboardService } from '../../services/dashboardService'
import { useAuthStore } from '../../store/authStore'

interface ValidacionesModalProps {
  reporteId: string
  onClose: () => void
  onValidacionExitosa?: () => void
}

/**
 * Modal para mostrar y crear validaciones ciudadanas de reportes.
 * - Muestra nombreUsuario en lugar de email
 * - Bloquea el formulario si el usuario ya votó
 * - Llama a onValidacionExitosa() tras un voto exitoso para que el padre actualice sus datos
 */
export function ValidacionesModal({ reporteId, onClose, onValidacionExitosa }: ValidacionesModalProps) {
  const { user } = useAuthStore()

  const theme = useThemeClasses()

  const [validaciones, setValidaciones] = useState<ValidacionResponseDTO[]>([])
  const [loadingValidaciones, setLoadingValidaciones] = useState(true)
  const [errorValidaciones, setErrorValidaciones] = useState<string | null>(null)

  const [votoSeleccionado, setVotoSeleccionado] = useState<boolean | null>(null)
  const [comentario, setComentario] = useState('')
  const [loadingCrear, setLoadingCrear] = useState(false)
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [yaVoto, setYaVoto] = useState(false)

  useEffect(() => {
    const cargarValidaciones = async () => {
      try {
        setLoadingValidaciones(true)
        setErrorValidaciones(null)
        const data = await dashboardService.obtenerValidaciones(reporteId)
        setValidaciones(data)

        if (user?.name) {
          const yaVotoPreviamente = data.some((v) => v.nombreUsuario === user.name)
          setYaVoto(yaVotoPreviamente)
        }
      } catch (error) {
        setErrorValidaciones(
          error instanceof Error ? error.message : 'Error al cargar validaciones'
        )
      } finally {
        setLoadingValidaciones(false)
      }
    }
    cargarValidaciones()
  }, [reporteId, user?.name])

  const handleEnviarValidacion = async () => {
    if (votoSeleccionado === null) {
      setErrorCrear('Debes seleccionar un voto (Pulgar Arriba o Abajo)')
      return
    }

    try {
      setLoadingCrear(true)
      setErrorCrear(null)

      const payload: ValidacionRequestDTO = {
        esPositiva: votoSeleccionado,
        comentario: comentario.trim() || undefined,
      }

      const nuevaValidacion = await dashboardService.crearValidacion(reporteId, payload)
      setValidaciones([nuevaValidacion, ...validaciones])
      setYaVoto(true)
      onValidacionExitosa?.()

    } catch (error: any) {
      const serverMsg = error?.response?.data?.message
      if (error?.response?.status === 400 && serverMsg) {
        setErrorCrear(serverMsg)
        setYaVoto(true)
      } else {
        setErrorCrear(error instanceof Error ? error.message : 'Error al crear validación')
      }
    } finally {
      setLoadingCrear(false)
    }
  }

  const formatearFecha = (fechaString: string): string => {
    const fecha = new Date(fechaString)
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={`fixed inset-0 ${theme.overlay} flex items-center justify-center p-4 z-50`}>
      <div className={`${theme.modalBg} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col`}>
        {/* HEADER */}
        <div className={`flex items-center justify-between p-6 border-b ${theme.border}`}>
          <h2 className={`text-xl font-bold ${theme.headerText}`}>Validaciones Ciudadanas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sección Superior: Formulario o mensaje de ya votó */}
          <div className={`p-6 border-b ${theme.border} ${theme.sectionBg} flex-shrink-0`}>
            {yaVoto ? (
              <div className={`flex items-center gap-3 p-4 rounded-lg ${theme.success} border`}>
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-semibold">Ya has validado este reporte</p>
                  <p className="text-xs mt-0.5">Gracias por tu aporte ciudadano.</p>
                </div>
              </div>
            ) : (
              <>
                <h3 className={`text-sm font-semibold mb-4 ${theme.sectionText}`}>Añade tu validación</h3>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setVotoSeleccionado(true)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      votoSeleccionado === true ? theme.buttonConfirm : theme.buttonNeutral
                    }`}
                    disabled={loadingCrear}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Confirmo
                  </button>
                  <button
                    onClick={() => setVotoSeleccionado(false)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      votoSeleccionado === false ? theme.buttonDeny : theme.buttonNeutral
                    }`}
                    disabled={loadingCrear}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    No Confirmo
                  </button>
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value.slice(0, 500))}
                  placeholder="Comentario opcional (máx 500 caracteres)..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 ${theme.input}`}
                  rows={3}
                  disabled={loadingCrear}
                  maxLength={500}
                />
                <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">{comentario.length}/500 caracteres</div>
                {errorCrear && (
                  <div className={`mt-3 p-3 rounded-lg text-sm ${theme.error} border`}>
                    {errorCrear}
                  </div>
                )}
                <button
                  onClick={handleEnviarValidacion}
                  disabled={loadingCrear || votoSeleccionado === null}
                  className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                    loadingCrear || votoSeleccionado === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loadingCrear ? 'Enviando...' : 'Enviar Validación'}
                </button>
              </>
            )}
          </div>
          {/* Sección Inferior: Lista */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className={`text-sm font-semibold mb-4 ${theme.sectionText}`}>{validaciones.length} validaciones</h3>
            {loadingValidaciones ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${theme.skeleton} h-20 rounded-lg animate-pulse`} />
                ))}
              </div>
            ) : errorValidaciones ? (
              <div className={`p-4 rounded-lg text-sm ${theme.error} border`}>
                {errorValidaciones}
              </div>
            ) : validaciones.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Aún no hay validaciones para este reporte</p>
                <p className="text-xs mt-2">Sé el primero en validar 👆</p>
              </div>
            ) : (
              <div className="space-y-3">
                {validaciones.map((validacion, idx) => (
                  <div key={idx} className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${theme.border} ${theme.modalBg}`}> 
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${theme.commentUser}`}>{validacion.nombreUsuario}</span>
                        {validacion.esPositiva ? (
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <span className={`text-xs ${theme.commentDate}`}>{formatearFecha(validacion.fechaCreacion)}</span>
                    </div>
                    {validacion.comentario && (
                      <p className={`text-sm text-justify ${theme.comment}`}>{validacion.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
