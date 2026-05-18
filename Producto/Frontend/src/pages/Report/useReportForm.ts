import { useState, useRef, useEffect, useCallback } from 'react'
import { useReportStore } from '../../store/reportStore'
import { useAuthStore } from '../../store/authStore'
import { reportService } from '../../services/reportService'
import type { ReportCategory } from '../../types'

export type SubmitState = 'idle' | 'uploading' | 'validating' | 'success' | 'warning' | 'error'
export type CameraPermission = 'unknown' | 'granted' | 'denied'

export function useReportForm() {
  const { prependReport } = useReportStore()
  const { user, updatePoints } = useAuthStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [description, setDescription] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [coords, setCoords] = useState({ lat: -33.4569, lng: -70.6483 })
  const [errors, setErrors] = useState<{ photo?: string; category?: string }>({})
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [hasCamera, setHasCamera] = useState(false)
  const [cameraPermission, setCameraPermission] = useState<CameraPermission>('unknown')
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  // GPS permission
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords: c }) => setCoords({ lat: c.latitude, lng: c.longitude }),
      () => {}
    )
  }, [])

  // Detección de cámara + solicitud de permiso (igual que GPS)
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const hasVideo = devices.some(d => d.kind === 'videoinput')
      if (!hasVideo) return

      setHasCamera(true)
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(t => t.stop())
          setCameraPermission('granted')
        })
        .catch(() => setCameraPermission('denied'))
    }).catch(() => {})
  }, [])

  // Callback ref para adjuntar el stream al <video> cuando aparece el modal
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && streamRef.current) {
      el.srcObject = streamRef.current
      el.play().catch(() => {})
    }
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, photo: undefined }))
  }

  const handleDropPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, photo: undefined }))
  }

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setIsCameraOpen(true)
    } catch {
      setCameraPermission('denied')
    }
  }

  const capturePhoto = () => {
    const el = videoRef.current
    if (!el) return
    const canvas = document.createElement('canvas')
    canvas.width = el.videoWidth
    canvas.height = el.videoHeight
    canvas.getContext('2d')?.drawImage(el, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], 'foto-camara.jpg', { type: 'image/jpeg' })
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setErrors(prev => ({ ...prev, photo: undefined }))
      closeCamera()
    }, 'image/jpeg', 0.9)
  }

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setIsCameraOpen(false)
  }

  const handleCategoryChange = (value: ReportCategory) => {
    setCategory(value)
    setErrors((prev) => ({ ...prev, category: undefined }))
  }

  const validate = () => {
    const newErrors: { photo?: string; category?: string } = {}
    if (!photo) newErrors.photo = 'La fotografía es obligatoria para la validación IA'
    if (!category) newErrors.category = 'Selecciona la categoría de la barrera'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate() || !category || !photo) return

    setSubmitState('uploading')
    try {
      setSubmitState('validating')
      const result = await reportService.create({
        foto: photo,
        latitud: coords.lat,
        longitud: coords.lng,
        categoria: category,
        descripcion: description || undefined,
      })

      prependReport({
        id: result.id,
        category,
        status: result.estado,
        coordinates: coords,
        description: description || undefined,
        photoUrl: photoPreview ?? '',
        aiConfidence: result.nivelConfianzaIa != null ? Math.round(result.nivelConfianzaIa * 100) : undefined,
        createdAt: new Date().toISOString(),
        reporterName: user?.name,
        comuna: 'Santiago Centro',
      })

      const pts = result.puntosOtorgados ?? 0
      if (pts > 0) {
        setEarnedPoints(pts)
        updatePoints((user?.points ?? 0) + pts)
      }

      if (result.estado === 'VALIDADO') setSubmitState('success')
      else if (result.estado === 'PENDIENTE') setSubmitState('warning')
      else setSubmitState('error')
    } catch {
      setSubmitState('error')
    }
  }

  const resetForm = () => {
    setSubmitState('idle')
    setPhoto(null)
    setPhotoPreview(null)
    setCategory(null)
    setDescription('')
  }

  const retrySubmit = () => setSubmitState('idle')

  return {
    fileRef,
    photoPreview,
    category,
    description,
    setDescription,
    submitState,
    coords,
    setCoords,
    errors,
    earnedPoints,
    hasCamera,
    cameraPermission,
    isCameraOpen,
    setVideoRef,
    handlePhotoChange,
    handleDropPhoto,
    openCamera,
    capturePhoto,
    closeCamera,
    handleCategoryChange,
    handleSubmit,
    resetForm,
    retrySubmit,
  }
}
