import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/auth/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import PublicPortfolioPage from './pages/PublicPortfolioPage'
import NotificationsPage from './pages/NotificationsPage'
import NotFoundPage from './pages/NotFoundPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminModeration from './pages/admin/AdminModeration'
import AdminSettings from './pages/admin/AdminSettings'
import AdminActivity from './pages/admin/AdminActivity'
import MusicianDashboard from './pages/musician/MusicianDashboard'
import ProjectsPage from './pages/musician/ProjectsPage'
import ProjectDetailPage from './pages/musician/ProjectDetailPage'
import FilesPage from './pages/musician/FilesPage'
import FileDetailPage from './pages/musician/FileDetailPage'
import PortfolioPage from './pages/musician/PortfolioPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/portfolio/:userId" element={<PublicPortfolioPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminModeration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="/musician"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <MusicianDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musician/projects"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musician/projects/:id"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musician/files"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <FilesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musician/files/:id"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <FileDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/musician/portfolio"
          element={
            <ProtectedRoute roles={['MUSICIAN']}>
              <PortfolioPage />
            </ProtectedRoute>
          }
        />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/musician" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
