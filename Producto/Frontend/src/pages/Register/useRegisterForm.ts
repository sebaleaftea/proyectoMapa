import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'

type FieldErrors = { nombre?: string; email?: string; password?: string; confirm?: string }

export function useRegisterForm() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [nombreUsuario, setNombreUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<FieldErrors>({})

  const clearFieldError = (field: keyof FieldErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }))

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}

    if (!nombreUsuario.trim()) {
      newErrors.nombre = 'El nombre de usuario es obligatorio'
    } else if (nombreUsuario.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Ingresa un correo electrónico válido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Debes confirmar tu contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError(null)
    try {
      const auth = await authService.register({ nombreUsuario: nombreUsuario.trim(), email, password })
      login({
        id: auth.userId,
        name: auth.nombreUsuario,
        email,
        role: auth.role,
        points: 0,
        token: auth.token,
        isAnonymous: false,
      })
      navigate('/mapa')
    } catch (e: unknown) {
      const msg = (e as any)?.response?.data?.message
      if (msg?.includes('registrado') || msg?.includes('email')) {
        setError('Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?')
      } else {
        setError(msg ?? 'Ocurrió un error al crear la cuenta. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    nombreUsuario, setNombreUsuario,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    loading,
    error,
    errors,
    clearFieldError,
    handleSubmit,
  }
}

