// User service for admin user management
export interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  subscription: string
  creditScore: number
  phone: string
  createdAt: string
  isVerified: boolean
  totalSpent: number
  lastActivity: string
}

export interface UserFilters {
  status?: string
  role?: string
  search?: string
  page?: number
  limit?: number
}

export interface UserResponse {
  success: boolean
  data?: {
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
    statusCounts: Record<string, number>
    roleCounts: Record<string, number>
    metrics: {
      totalUsers: number
      activeUsers: number
      verifiedUsers: number
      newThisMonth: number
    }
  }
  error?: string
}

class UserService {
  private baseUrl = '/api/admin/users'

  async getUsers(filters: UserFilters = {}): Promise<UserResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status)
      }
      if (filters.role && filters.role !== 'all') {
        params.append('role', filters.role)
      }
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`)
      const data = await response.json()
      
      return data
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users'
      }
    }
  }

  async createUser(userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      }
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      }
    }
  }

  async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting user:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete user'
      }
    }
  }

  async changeUserRole(userId: string, role: string, reason: string): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, reason }),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error changing user role:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change user role'
      }
    }
  }

  async sendEmailToUser(userId: string, emailData: { subject: string; message: string; type: string }): Promise<UserResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${userId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }
}

export const userService = new UserService()
