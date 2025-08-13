import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { JobProvider } from './context/JobContext'

// Layout components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import ProfilePage from './pages/Dashboard/ProfilePage'
import ApplicationsPage from './pages/Dashboard/ApplicationsPage'
import PostJobPage from './pages/Employer/PostJobPage'
import ManageJobsPage from './pages/Employer/ManageJobsPage'
import ViewApplicationsPage from './pages/Employer/ViewApplicationsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/:id" element={<JobDetailsPage />} />
              </Route>

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="applications" element={
                  <ProtectedRoute requiredRole="jobseeker">
                    <ApplicationsPage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Employer routes */}
              <Route path="/employer" element={
                <ProtectedRoute requiredRole="employer">
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="post-job" element={<PostJobPage />} />
                <Route path="manage-jobs" element={<ManageJobsPage />} />
                <Route path="applications/:jobId" element={<ViewApplicationsPage />} />
              </Route>

              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                top: 20,
                right: 20,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid #e5e7eb',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
                loading: {
                  iconTheme: {
                    primary: '#6366F1',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </JobProvider>
    </AuthProvider>
  )
}

export default App
