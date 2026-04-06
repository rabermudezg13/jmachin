import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [accountant, setAccountant] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accountant_token')
    if (token) {
      getMe()
        .then((res) => setAccountant(res.data))
        .catch(() => localStorage.removeItem('accountant_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (token, accountantData) => {
    localStorage.setItem('accountant_token', token)
    setAccountant(accountantData)
  }

  const logout = () => {
    localStorage.removeItem('accountant_token')
    setAccountant(null)
  }

  return (
    <AuthContext.Provider value={{ accountant, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
