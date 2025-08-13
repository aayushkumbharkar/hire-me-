import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Layout = () => {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gradient">Hire Me!</h1>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/jobs" className="text-gray-600 hover:text-gray-900 font-medium">
                Browse Jobs
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                    Dashboard
                  </Link>
                  {user?.role === 'employer' && (
                    <Link to="/employer/post-job" className="text-gray-600 hover:text-gray-900 font-medium">
                      Post Job
                    </Link>
                  )}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Hi, {user?.name}</span>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Hire Me! All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
