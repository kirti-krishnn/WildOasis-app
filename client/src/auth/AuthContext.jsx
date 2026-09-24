import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from './authApi.js'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data.user || data.data?.user || data.data || null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(refreshMe)
  }, [refreshMe])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    const loggedInUser = data.data?.user
    setUser(loggedInUser)
    const session = await authApi.me()
    const currentUser = session.user || session.data?.user || session.data || loggedInUser
    setUser(currentUser)
    return currentUser
  }, [])

  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload)
    setUser(data.data?.user)
    return data.data?.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    refreshMe,
  }), [user, loading, login, signup, logout, refreshMe])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
