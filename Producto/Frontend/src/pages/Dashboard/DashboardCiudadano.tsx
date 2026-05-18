import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Camera, Trophy, ChevronRight, Clock,
  Star, Gift, Ticket, Award, Home,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { perfilService } from '../../services/perfilService'
import { Badge } from '../../components/ui/Badge'
import { Card, CardContent } from '../../components/ui/Card'
import type { ReporteDetalleAPI } from '../../types'

// ── Datos estáticos de promociones ─────────────────────────────────────────
const PROMOCIONES = [
  {
    id: 1,
    icon: Ticket,
    titulo: 'Entrada Zoológico Metropolitano',
    descripcion: 'Una entrada gratuita para ti y un acompañante.',
    puntos: 500,
    color: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 2,
    icon: Star,
    titulo: 'Descuento 20% Transantiago',
    descripcion: 'Válido por 30 días en todas las líneas de Metro.',
    puntos: 300,
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 3,
    icon: Award,
    titulo: 'Reconocimiento oficial SENADIS',
    descripcion: 'Certificado digital como ciudadano inclusivo activo.',
    puntos: 1000,
    color: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 4,
    icon: Gift,
    titulo: 'Kit de accesibilidad urbana',
    descripcion: 'Mapa impreso + guía de barreras de Santiago Centro.',
    puntos: 750,
    color: 'from-purple-500 to-violet-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
]

const CATEGORIA_LABEL: Record<string, string> = {
  RAMPA: 'Rampa',
  ASCENSOR: 'Ascensor',
  BAÑO: 'Baño accesible',
}

export function DashboardCiudadano() {
  const { user } = useAuthStore()
  const puntos = Number(user?.points) || 0

  const [reportes, setReportes] = useState<ReporteDetalleAPI[]>([])
  const [loadingReportes, setLoadingReportes] = useState(true)

  useEffect(() => {
    perfilService.getMisReportes()
      .then((data) => setReportes(data.slice(0, 3))) // Solo los 3 más recientes
      .catch(console.error)
      .finally(() => setLoadingReportes(false))
  }, [])

  return (
    <main className="flex-1 bg-bg-app pb-24 md:pb-8" aria-label="Dashboard ciudadano">

      {/* ── HERO: Saludo + Puntos ─────────────────────────────────────── */}
      <section
        className="bg-primary dark:bg-gray-900 text-white px-4 pt-8 pb-12 relative overflow-hidden"
        aria-labelledby="dashboard-greeting"
      >
        {/* Círculos decorativos de fondo */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />

        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center gap-1.5 mb-1">
            <Home className="w-4 h-4 text-white/60" aria-hidden="true" />
            <span className="text-caption text-white/60 font-medium uppercase tracking-wide">Inicio</span>
          </div>
          <h1 id="dashboard-greeting" className="text-2xl md:text-3xl font-bold leading-tight mb-1">
            ¡Bienvenido de vuelta,
          </h1>
          <p className="text-2xl md:text-3xl font-bold leading-tight text-white/90 mb-6 truncate">
            {user?.name ?? 'ciudadano'}! 👋
          </p>

          {/* Tarjeta de puntos */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-caption text-white/70 font-medium mb-0.5">Tus puntos acumulados</p>
              <p className="text-4xl font-bold tabular-nums" aria-label={`${puntos} puntos acumulados`}>
                {puntos.toLocaleString('es-CL')}
              </p>
              <p className="text-caption text-white/60 mt-1">
                {puntos >= 500
                  ? '¡Ya puedes canjear recompensas! 🎉'
                  : `Te faltan ${500 - puntos} pts para tu primera recompensa`}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0" aria-hidden="true">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 -mt-4 flex flex-col gap-6">

        {/* ── ACCIONES RÁPIDAS ──────────────────────────────────────────── */}
        <section aria-labelledby="acciones-rapidas">
          <h2 id="acciones-rapidas" className="sr-only">Acciones rápidas</h2>
          <div className="grid grid-cols-2 gap-3">

            <Link
              to="/mapa"
              className="group bg-bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Ver el mapa de accesibilidad"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-6 h-6 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-body font-semibold text-text-primary">Ver el Mapa</p>
                <p className="text-caption text-text-secondary mt-0.5">Explora barreras reportadas</p>
              </div>
            </Link>

            <Link
              to="/reportar"
              className="group bg-primary rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:bg-primary-hover transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              aria-label="Hacer un nuevo reporte de barrera arquitectónica"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Camera className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-body font-semibold text-white">Hacer Reporte</p>
                <p className="text-caption text-white/70 mt-0.5">Gana +10 pts por reporte</p>
              </div>
            </Link>

          </div>
        </section>

        {/* ── PROMOCIONES ───────────────────────────────────────────────── */}
        <section aria-labelledby="promociones-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="promociones-heading" className="text-heading-1 font-bold text-text-primary">
              🎁 Canjea tus puntos
            </h2>
            <Link
              to="/ranking"
              className="text-caption text-primary font-medium hover:underline flex items-center gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Ver ranking <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {PROMOCIONES.map(({ id, icon: Icon, titulo, descripcion, puntos: ptsRequeridos, iconBg, iconColor }) => {
              const canCanjear = puntos >= ptsRequeridos
              return (
                <Card key={id} as="article">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body font-semibold text-text-primary truncate">{titulo}</p>
                        <p className="text-caption text-text-secondary mt-0.5 line-clamp-1">{descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-body font-bold tabular-nums ${canCanjear ? 'text-primary' : 'text-text-secondary'}`}
                          aria-label={`${ptsRequeridos} puntos requeridos`}
                        >
                          {ptsRequeridos.toLocaleString('es-CL')}
                          <span className="text-caption font-normal"> pts</span>
                        </p>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${
                            canCanjear
                              ? 'bg-primary/10 text-primary'
                              : 'bg-gray-100 dark:bg-gray-800 text-text-secondary'
                          }`}
                        >
                          {canCanjear ? 'Disponible ✓' : 'Bloqueado'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* ── ACTIVIDAD RECIENTE ────────────────────────────────────────── */}
        <section aria-labelledby="actividad-heading" className="mb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 id="actividad-heading" className="text-heading-1 font-bold text-text-primary">
              📋 Actividad reciente
            </h2>
            <Link
              to="/perfil"
              className="text-caption text-primary font-medium hover:underline flex items-center gap-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card>
            <CardContent className="pt-4 pb-2">
              {loadingReportes ? (
                <div className="space-y-4 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reportes.length === 0 ? (
                <div className="py-8 text-center">
                  <Camera className="w-10 h-10 text-text-secondary mx-auto mb-3 opacity-30" aria-hidden="true" />
                  <p className="text-body text-text-secondary">Aún no tienes reportes</p>
                  <p className="text-caption text-text-secondary mt-1">
                    ¡Haz tu primer reporte y gana 10 puntos!
                  </p>
                  <Link
                    to="/reportar"
                    className="inline-block mt-4 text-body text-primary font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
                  >
                    Reportar ahora →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border dark:divide-gray-800" role="list" aria-label="Últimos reportes">
                  {reportes.map((r, i) => (
                    <div
                      key={String(r.id)}
                      role="listitem"
                      className={`flex items-start gap-3 py-3 ${i === 0 ? 'pt-0' : ''} ${i === reportes.length - 1 ? 'pb-0' : ''}`}
                    >
                      {r.fotoUrl ? (
                        <img
                          src={r.fotoUrl}
                          alt={`Foto de ${CATEGORIA_LABEL[r.categoria as string] ?? r.categoria}`}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-bg-app flex items-center justify-center shrink-0 border border-border">
                          <Camera className="w-6 h-6 text-text-secondary opacity-40" aria-hidden="true" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="text-body font-semibold text-text-primary">
                            {CATEGORIA_LABEL[r.categoria as string] ?? r.categoria}
                          </p>
                          <Badge variant="status" status={r.estado as any} />
                        </div>
                        <div className="flex items-center gap-1 text-caption text-text-secondary">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {new Date(r.fechaCreacion).toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </div>
    </main>
  )
}
