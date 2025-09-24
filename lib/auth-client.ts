// Client-side authentication utilities
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  subscriptionId?: string
  customerId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResult {
  user: User | null
  isAuthenticated: boolean
  error?: string
}

// Client-side authentication functions
export async function getCurrentUserClient(): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      return {
        user: null,
        isAuthenticated: false,
        error: 'Authentication failed'
      }
    }

    const data = await response.json()
    return {
      user: data.user,
      isAuthenticated: !!data.user,
    }
  } catch (error) {
    return {
      user: null,
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

export async function loginClient(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        user: null,
        isAuthenticated: false,
        error: data.message || 'Login failed'
      }
    }

    return {
      user: data.user,
      isAuthenticated: true,
    }
  } catch (error) {
    return {
      user: null,
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }
  }
}

export async function logoutClient(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
