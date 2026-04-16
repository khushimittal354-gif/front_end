import { createContext, useContext, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { loginUser } from '../services/routes/generalRoutes'

const TOKEN_STORAGE_KEY = 'finsecure_token'
const USER_STORAGE_KEY = 'finsecure_user'

const AuthContext = createContext(null)

function parseJwtPayload(token) {
  try {
    console.log('[parseJwtPayload] Parsing token:', token.substring(0, 20) + '...')
    const payloadPart = token.split('.')[1]

    if (!payloadPart) {
      console.error('[parseJwtPayload] No payload part found in token')
      return null
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const payloadJson = atob(padded)
    const parsed = JSON.parse(payloadJson)
    console.log('[parseJwtPayload] Parsed payload:', parsed)
    return parsed
  } catch (error) {
    console.error('[parseJwtPayload] Error parsing JWT:', error.message)
    return null
  }
}

function inferRoleFromUsername(username) {
  if (!username) return 'EMPLOYEE'
  
  const lowerUsername = username.toLowerCase()
  
  if (lowerUsername.includes('finance') || lowerUsername === 'finance') {
    return 'FINANCE'
  }
  if (lowerUsername.includes('admin') || lowerUsername === 'admin') {
    return 'ADMIN'
  }
  if (lowerUsername.includes('hr') || lowerUsername === 'hr') {
    return 'HR'
  }
  
  return 'EMPLOYEE'
}

function normalizeLoginResponse(responseData) {
  console.log('[normalizeLoginResponse] Response data:', responseData)
  
  const token = responseData?.token || responseData?.jwt || responseData?.accessToken
  console.log('[normalizeLoginResponse] Token extracted:', token ? 'YES' : 'NO')

  if (!token) {
    console.error('[normalizeLoginResponse] Could not extract token from response')
    throw new Error('Token not found in login response.')
  }

  const tokenPayload = parseJwtPayload(token)
  console.log('[normalizeLoginResponse] Token payload:', tokenPayload)
  
  const userFromApi = responseData?.user
  console.log('[normalizeLoginResponse] User from API:', userFromApi)

  // Extract username first
  const username = responseData?.username || userFromApi?.username || tokenPayload?.sub || 'User'
  console.log('[normalizeLoginResponse] Username:', username)

  // Extract employee ID
  let employeeId = userFromApi?.employeeId || userFromApi?.id || tokenPayload?.employeeId

  // Extract or infer role
  let role = responseData?.role || userFromApi?.role
  if (!role) {
    role = inferRoleFromUsername(username)
    console.log('[normalizeLoginResponse] Inferred role from username "' + username + '":', role)
  } else {
    console.log('[normalizeLoginResponse] Role from response:', role)
  }

  const user = userFromApi || {
    username: username,
    role: role,
    employeeId: employeeId,
  }

  // Ensure user object has all required fields
  if (!user.role) {
    user.role = role
  }
  if (user.employeeId === undefined || user.employeeId === null) {
    user.employeeId = employeeId
  }

  console.log('[normalizeLoginResponse] Final user object:', user)
  console.log('[normalizeLoginResponse] Stored role will be:', user.role)
  return { token, user }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [authLoading, setAuthLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  const login = async (username, password) => {
    console.log('[AuthContext.login] Starting login for user:', username)
    setAuthLoading(true)

    try {
      const responseData = await loginUser({ username, password })
      console.log('[AuthContext.login] Login API call succeeded')
      
      const { token: nextToken, user: nextUser } = normalizeLoginResponse(responseData)
      console.log('[AuthContext.login] Normalized token and user')

      setToken(nextToken)
      setUser(nextUser)
      console.log('[AuthContext.login] Saving to localStorage')
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser))
      console.log('[AuthContext.login] Login successful, token and user saved')
    } catch (error) {
      console.error('[AuthContext.login] Login failed:', error.message)
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      authLoading,
      login,
      logout,
    }),
    [token, user, isAuthenticated, authLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}