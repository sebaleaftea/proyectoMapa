import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User) => void
  updatePoints: (points: number) => void
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
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'accesimap-auth' }
  )
)
