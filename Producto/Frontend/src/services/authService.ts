import { api } from '../lib/api'
import type { LoginRequest, RegisterRequest, AuthResponse } from '../types'

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/registro', {
      nombreUsuario: data.nombreUsuario,
      email: data.email,
      password: data.password,
    })
    return res.data
  },
}
