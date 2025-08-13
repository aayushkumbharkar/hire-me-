import { Link } from 'react-router-dom'
import { Search, Briefcase, Users, Building } from 'lucide-react'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Dream <span className="text-gradient">Job</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with top employers and discover opportunities that match your skills and aspirations.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-soft p-6 max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Location"
                    className="input-field"
                  />
                </div>
                <Link
                  to="/jobs"
                  className="btn-primary px-8 py-3 whitespace-nowrap"
                >
                  Search Jobs
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <Briefcase className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1000+</h3>
                <p className="text-gray-600">Active Jobs</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">5000+</h3>
                <p className="text-gray-600">Job Seekers</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-100 rounded-lg mb-4">
                  <Building className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Hire Me?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make job searching and hiring simple, efficient, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-lg mb-6">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Search</h3>
              <p className="text-gray-600">
                Advanced filters and AI-powered matching to find the perfect job opportunities.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-lg mb-6">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Employers</h3>
              <p className="text-gray-600">
                Connect with leading companies and startups across various industries.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-100 rounded-lg mb-6">
                <Briefcase className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Apply</h3>
              <p className="text-gray-600">
                One-click applications with your saved profile and resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started for Free
            </Link>
            <Link
              to="/jobs"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
