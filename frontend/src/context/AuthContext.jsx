import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { TOKEN_KEY, USER_KEY } from '../api/client'
import { authApi } from '../api/endpoints'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [initializing, setInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  const persist = useCallback((auth) => {
    localStorage.setItem(TOKEN_KEY, auth.token)
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user))
    setToken(auth.token)
    setUser(auth.user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let active = true
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) {
      setInitializing(false)
      return () => {}
    }
    authApi
      .me()
      .then((res) => {
        if (!active) return
        setUser(res.data)
        localStorage.setItem(USER_KEY, JSON.stringify(res.data))
      })
      .catch(() => {
        if (active) logout()
      })
      .finally(() => {
        if (active) setInitializing(false)
      })
    return () => {
      active = false
    }
  }, [logout])

  const login = useCallback(
    async (payload) => {
      const res = await authApi.login(payload)
      persist(res.data)
      return res.data.user
    },
    [persist],
  )

  const register = useCallback(
    async (payload) => {
      const res = await authApi.register(payload)
      persist(res.data)
      return res.data.user
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      user,
      token,
      initializing,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'ADMIN',
      isMusician: user?.role === 'MUSICIAN',
      login,
      register,
      logout,
    }),
    [user, token, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

export { api }
