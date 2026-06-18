import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor to automatically append JWT Authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor to handle authentication and system failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null
    const requestUrl = error.config?.url || ''
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

    if (status === 401) {
      if (!isAuthRequest) {
        // Unauthorized: clear local auth tokens and redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('role')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      // Forbidden: redirect to 403 error page
      window.location.href = '/403'
    } else if (status === 500) {
      // Server Error: redirect to 500 error page
      window.location.href = '/500'
    }

    return Promise.reject(error)
  }
)

export default api
