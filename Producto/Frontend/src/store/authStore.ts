import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User) => void
  updatePoints: (points: number) => void
  updateProfile: (nombreUsuario: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user) => set({ user, token: user.token, isAuthenticated: true }),
      updatePoints: (points) =>
        set((state) => ({
          user: state.user ? { ...state.user, points } : null,
        })),
      updateProfile: (nombreUsuario) =>
        set((state) => ({
          user: state.user ? { ...state.user, name: nombreUsuario } : null,
        })),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'accesimap-auth',
      version: 1,
      migrate: (stored: any) => {
        if (stored?.user) {
          if (typeof stored.user.points === 'object') {
            stored.user.points = stored.user.points?.puntos ?? 0
          } else if (typeof stored.user.points !== 'number') {
            stored.user.points = 0
          }
        }
        return stored
      },
    }
  )
)

