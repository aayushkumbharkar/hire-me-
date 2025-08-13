import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hire-me-app-flax.vercel.app/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    // Handle different error status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.response?.status === 403) {
      toast.error('Access denied.')
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API methods
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getUserStats: () => api.get('/auth/stats'),
}

export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getFeaturedJobs: (limit = 6) => api.get('/jobs/featured', { params: { limit } }),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getEmployerJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),
  getJobStats: () => api.get('/jobs/employer/stats'),
}

export const applicationsAPI = {
  applyToJob: (applicationData) => api.post('/applications', applicationData),
  getUserApplications: (params) => api.get('/applications/user', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  withdrawApplication: (id) => api.delete(`/applications/${id}/withdraw`),
  getApplicationStats: () => api.get('/applications/employer/stats'),
}

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
    api.defaults.headers.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
  }
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.Authorization
}

export default api
