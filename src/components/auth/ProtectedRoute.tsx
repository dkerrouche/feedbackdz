'use client'

import { useState, useEffect } from 'react'
import PhoneAuth from './PhoneAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    // For now, we'll use localStorage to persist auth state
    const authState = localStorage.getItem('feedbackdz_auth')
    if (authState) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleAuthSuccess = () => {
    // Store auth state
    localStorage.setItem('feedbackdz_auth', 'true')
    setIsAuthenticated(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PhoneAuth onSuccess={handleAuthSuccess} />
  }

  return <>{children}</>
}