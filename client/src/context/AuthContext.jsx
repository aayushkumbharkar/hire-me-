import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI, setAuthToken, clearAuth } from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        setAuthToken(token)
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token,
            user: parsedUser,
          },
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        clearAuth()
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false })
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.login(credentials)
      const { token, user } = response.data.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Set auth header
      setAuthToken(token)

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      })

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await authAPI.register(userData)
      const { token, user } = response.data.data

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Set auth header
      setAuthToken(token)

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      })

      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    clearAuth()
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    dispatch({
      type: 'UPDATE_USER',
      payload: updatedUser,
    })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
