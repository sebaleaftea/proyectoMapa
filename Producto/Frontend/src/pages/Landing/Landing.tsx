import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Camera, Trophy, CheckCircle, ArrowRight, Building2, Users, Scale, X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

const steps = [
  { icon: Camera, title: 'Fotografía la barrera', description: 'Detecta una rampa dañada, ascensor averiado o baño no adaptado y toma una foto desde tu teléfono.' },
  { icon: MapPin, title: 'Geolocalización automática', description: 'El sistema captura tus coordenadas GPS exactas. Tu reporte queda anclado al mapa de Santiago.' },
  { icon: CheckCircle, title: 'Validación por IA', description: 'Azure Vision AI analiza la imagen en segundos. Si la precisión es ≥ 85%, el reporte se publica automáticamente.' },
]

const stats = [
  { value: '282', label: 'Reportes validados', description: 'en 3 comunas piloto' },
  { value: '85%', label: 'Precisión mínima', description: 'garantizada por IA' },
  { value: '3', label: 'Comunas piloto', description: 'Las Condes , Providencia y Ñuñoa' },
]

const stakeholders = [
  { icon: Users, title: 'Ciudadanos', description: 'Recupera tu derecho a la movilidad independiente con información verificada en tiempo real.' },
  { icon: Building2, title: 'Municipalidades', description: 'Reduce costos de fiscalización y obtén datos GIS listos para planificación urbana.' },
  { icon: Scale, title: 'SENADIS / MINVU', description: 'Mide el cumplimiento real del Decreto 50 de la OGUC por comuna.' },
]

export function Landing() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [showMunicipalModal, setShowMunicipalModal] = useState(false)

  const handleReportarClick = () => {
    if (!isAuthenticated) return navigate('/login')
    if (user?.role === 'CIUDADANO') return navigate('/reportar')
    setShowMunicipalModal(true)
  }

  return (
    <>
    <main>
      <section
        className="bg-primary text-white py-20 px-4"
        aria-labelledby="hero-heading"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-caption font-semibold mb-6">
            <Scale className="w-3.5 h-3.5" aria-hidden="true" />
            En cumplimiento de la Ley 20.422
          </div>
          <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            El mapa de accesibilidad<br className="hidden md:block" /> urbana de Chile
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            AccesiMap CL conecta la detección ciudadana de barreras arquitectónicas con la acción municipal,
            transformando reportes fotográficos en datos geoespaciales accionables para un Santiago más inclusivo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="accent"
              className="w-full sm:w-auto"
              aria-label="Reportar una barrera ahora"
              onClick={handleReportarClick}
            >
              <Camera className="w-5 h-5" aria-hidden="true" />
              Reportar una barrera
            </Button>
            <Link to="/mapa">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                aria-label="Ver mapa de accesibilidad"
              >
                <MapPin className="w-5 h-5" aria-hidden="true" />
                Ver el mapa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-bg-app dark:bg-gray-950 border-b border-border dark:border-gray-800" aria-label="Estadísticas del proyecto">
        <div className="max-w-4xl mx-auto px-4">
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6" role="list">
            {stats.map(({ value, label, description }) => (
              <li key={label} className="text-center">
                <p className="text-4xl font-bold text-primary leading-none">{value}</p>
                <p className="text-body font-semibold text-text-primary mt-1">{label}</p>
                <p className="text-caption text-text-secondary mt-0.5">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 max-w-4xl mx-auto" aria-labelledby="como-funciona">
        <h2 id="como-funciona" className="text-display font-bold text-text-primary text-center mb-3">
          ¿Cómo funciona?
        </h2>
        <p className="text-body text-text-secondary text-center mb-10 max-w-xl mx-auto">
          Tres pasos para convertir una barrera arquitectónica en un dato oficial para la municipalidad.
        </p>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Pasos del proceso">
          {steps.map(({ icon: Icon, title, description }, i) => (
            <li key={title} className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <span
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full text-caption font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="text-heading-1 font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-body text-text-secondary leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-16 px-4 bg-bg-app dark:bg-gray-950 border-y border-border dark:border-gray-800" aria-labelledby="stakeholders">
        <div className="max-w-4xl mx-auto">
          <h2 id="stakeholders" className="text-display font-bold text-text-primary text-center mb-10">
            ¿Para quién es AccesiMap CL?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stakeholders.map(({ icon: Icon, title, description }) => (
              <Card key={title} as="article">
                <CardContent className="pt-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-heading-1 font-semibold text-text-primary mb-2">{title}</h3>
                  <p className="text-body text-text-secondary leading-relaxed">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-accent text-white" aria-labelledby="gamificacion">
        <div className="max-w-2xl mx-auto text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-90" aria-hidden="true" />
          <h2 id="gamificacion" className="text-display font-bold mb-3">
            Gana puntos reportando
          </h2>
          <p className="text-body text-white/80 mb-8 leading-relaxed">
            Cada reporte validado te suma +10 puntos. Compite en el ranking mensual comunal
            y sé reconocido como co-creador de un Santiago más inclusivo.
          </p>
          <Link to="/ranking">
            <Button
              size="lg"
              className="bg-white text-accent hover:bg-white/90 border-0"
              aria-label="Ver ranking de ciudadanos"
            >
              Ver Ranking
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-10 px-4 bg-primary/5 dark:bg-gray-800/40 border-t border-border dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-caption text-text-secondary">
            AccesiMap CL opera en cumplimiento de la{' '}
            <strong className="text-text-primary">Ley 20.422</strong> de Igualdad de Oportunidades e Inclusión Social
            de Personas con Discapacidad y el{' '}
            <strong className="text-text-primary">Decreto 50 OGUC</strong>.
            Interfaz diseñada bajo estándar <strong className="text-text-primary">WCAG 2.1 AA</strong>.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link
              to="/mapa"
              className="text-primary text-body font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Mapa público
            </Link>
            <Link
              to="/login"
              className="text-primary text-body font-medium hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded"
            >
              Acceso municipal
            </Link>
          </div>
        </div>
      </section>
    </main>

    {showMunicipalModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="municipal-modal-title"
        onClick={() => setShowMunicipalModal(false)}
      >
        <div
          className="bg-bg-surface rounded-2xl shadow-xl max-w-sm w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <button
              onClick={() => setShowMunicipalModal(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-text-secondary transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <h2 id="municipal-modal-title" className="text-heading-1 font-bold text-text-primary mb-2">
            Opción no disponible
          </h2>
          <p className="text-body text-text-secondary leading-relaxed">
            Esta función está disponible solo para ciudadanos. Si deseas reportar una barrera, puedes iniciar sesión con una cuenta ciudadana.
          </p>
          <Button
            variant="primary"
            className="w-full mt-5"
            onClick={() => { setShowMunicipalModal(false); navigate('/login') }}
          >
            Iniciar sesión como ciudadano
          </Button>
        </div>
      </div>
    )}
    </>
  )
}
