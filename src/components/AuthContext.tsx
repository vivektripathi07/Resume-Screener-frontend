import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type UserType = {
  name: string
  email: string
  role?: string
}

type AuthContextType = {
  user: UserType | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()

  const [user, setUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const login = async (email: string, password: string) => {
    const res = await fetch('http://127.0.0.1:8000/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) throw new Error('Login failed')

    const data = await res.json()
    // console.log("Login response:", data) // 👀 To verify backend response

    // Extract values safely in case some fields are missing
    const name = data.user?.full_name || localStorage.getItem('user_name') || email.split('@')[0]
    const role = data.user?.role || 'user'
    const userEmail = data.user?.email || email

    const userData: UserType = { email: userEmail, name, role }
    console.log(userData)

    // Store in localStorage
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)

    console.log("Redirecting for role:", userData.role, userData.role?.length)
    // Redirect based on role
    if (userData.role === 'admin') {
      console.log("Hi");
      navigate('/admin-dashboard')
    } else {
      console.log("Hello");
      navigate('/main', { replace: true })
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    const res = await fetch('http://127.0.0.1:8000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: name }),
    })

    if (!res.ok) throw new Error('Signup failed')
    const data = await res.json()

    const userData: UserType = { email, name, role: data.role || 'user' }

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('user_name', name)
    setUser(userData)

    // ✅ Redirect only once after signup
    if (userData.role === 'admin') {
      navigate('/admin-dashboard', { replace: true })
    } else {
      navigate('/main', { replace: true })
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    navigate('/main')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
