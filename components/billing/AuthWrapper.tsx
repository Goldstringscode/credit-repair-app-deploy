'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn } from 'lucide-react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [loginData, setLoginData] = useState({ email: 'demo@example.com', password: 'demo123' })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      // First check if we have a token in localStorage
      const token = localStorage.getItem('accessToken')
      if (token) {
        // Try to access a protected endpoint to check if we're authenticated
        const response = await fetch(`${window.location.origin}/api/billing/user/subscription`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('accessToken')
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${window.location.origin}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Store the token in localStorage
        if (data.token) {
          localStorage.setItem('accessToken', data.token)
        }
        
        setIsAuthenticated(true)
        setShowLogin(false)
      } else {
        const error = await response.json()
        setLoginError(error.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setLoginData({ email: 'demo@example.com', password: 'demo123' })
    handleLogin(new Event('submit') as any)
  }

  // Debug logging removed for production

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to access your billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showLogin ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  You need to be logged in to view your billing information.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => setShowLogin(true)} className="w-full">
                    Login
                  </Button>
                  <Button onClick={handleDemoLogin} variant="outline" className="w-full">
                    Use Demo Account
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowLogin(false)} 
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // If authenticated, show the children (billing content)
  return <>{children}</>
}
