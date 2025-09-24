"use client"

import { useState, useEffect } from 'react'
import { getCurrentUserClient, loginClient, logoutClient, type User } from '@/lib/auth-client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const result = await getCurrentUserClient()
      setUser(result.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const result = await loginClient(email, password)
      if (result.isAuthenticated) {
        setUser(result.user)
      } else {
        throw new Error(result.error || 'Login failed')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutClient()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => {
    await checkAuthStatus()
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }
}
