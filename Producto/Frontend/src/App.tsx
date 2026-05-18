import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { InstallBanner } from './components/layout/InstallBanner'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { Landing } from './pages/Landing/Landing'
import { Login } from './pages/Login/Login'
import { Register } from './pages/Register/Register'
import { MapPage } from './pages/Map/MapPage'
import { ReportPage } from './pages/Report/ReportPage'
import { RankingPage } from './pages/Ranking/RankingPage'
import { MunicipalDashboard } from './pages/Municipal/Dashboard'
import { MunicipalExport } from './pages/Municipal/Export'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { useEffect } from 'react'
import { DashboardMunicipal } from './pages/Municipal/DashboardMunicipal'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { DashboardCiudadano } from './pages/Dashboard/DashboardCiudadano'


function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function CitizenRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role === 'MUNICIPALIDAD') return <Navigate to="/municipal/dashboard" replace />
  return <>{children}</>
}

function MunicipalRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'MUNICIPALIDAD') return <Navigate to="/mapa" replace />
  return <>{children}</>
}

function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  const showBottomNav = isAuthenticated && user?.role === 'CIUDADANO'
  return (
    <>
      <Header />
      <div className={showBottomNav ? 'pb-16 md:pb-0' : ''}>{children}</div>
      {showBottomNav && <BottomNav />}
    </>
  )
}

export default function App() {
  const isDark = useThemeStore((state) => state.isDark)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <BrowserRouter>
      <InstallBanner />
      <Routes>
        <Route path="/" element={<CitizenLayout><Landing /></CitizenLayout>} />
        <Route path="/login" element={<CitizenLayout><Login /></CitizenLayout>} />
        <Route path="/registro" element={<CitizenLayout><Register /></CitizenLayout>} />
        <Route path="/mapa" element={<AuthRoute><CitizenLayout><MapPage /></CitizenLayout></AuthRoute>} />
        <Route
          path="/reportar"
          element={
            <CitizenRoute>
              <CitizenLayout><ReportPage /></CitizenLayout>
            </CitizenRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <CitizenRoute>
              <CitizenLayout><ProfilePage /></CitizenLayout>
            </CitizenRoute>
          }
        />
        <Route
          path="/inicio"
          element={
            <CitizenRoute>
              <CitizenLayout><DashboardCiudadano /></CitizenLayout>
            </CitizenRoute>
          }
        />
        <Route
          path="/ranking"
          element={
            <CitizenRoute>
              <CitizenLayout><RankingPage /></CitizenLayout>
            </CitizenRoute>
          }
        />
        <Route
          path="/municipal/dashboard"
          element={
            <MunicipalRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <MunicipalDashboard />
              </div>
            </MunicipalRoute>
          }
        />
        <Route
          path="/municipal/dashboard-riesgo"
          element={
            <MunicipalRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <DashboardMunicipal />
              </div>
            </MunicipalRoute>
          }
        />
        <Route
          path="/municipal/exportar"
          element={
            <MunicipalRoute>
              <div className="flex flex-col min-h-screen">
                <Header />
                <MunicipalExport />
              </div>
            </MunicipalRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
