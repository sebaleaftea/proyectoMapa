import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { BottomNav } from './components/layout/BottomNav'
import { Landing } from './pages/Landing/Landing'
import { Login } from './pages/Login/Login'
import { MapPage } from './pages/Map/MapPage'
import { ReportPage } from './pages/Report/ReportPage'
import { RankingPage } from './pages/Ranking/RankingPage'
import { MunicipalDashboard } from './pages/Municipal/Dashboard'
import { MunicipalExport } from './pages/Municipal/Export'
import { useAuthStore } from './store/authStore'

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CitizenLayout><Landing /></CitizenLayout>} />
        <Route path="/login" element={<CitizenLayout><Login /></CitizenLayout>} />
        <Route path="/mapa" element={<CitizenLayout><MapPage /></CitizenLayout>} />
        <Route
          path="/reportar"
          element={
            <CitizenRoute>
              <CitizenLayout><ReportPage /></CitizenLayout>
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
