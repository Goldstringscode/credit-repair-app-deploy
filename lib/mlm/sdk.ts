import { MLMUser, MLMCommission, MLMPayout, MLMNotification } from '@/lib/mlm-system'

export interface MLMClientConfig {
  apiKey: string
  baseUrl: string
  timeout?: number
  retries?: number
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  requestId: string
}

export class MLMClient {
  private config: MLMClientConfig
  private baseHeaders: Record<string, string>

  constructor(config: MLMClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      ...config
    }
    
    this.baseHeaders = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'MLM-SDK/1.0.0'
    }
  }

  // User Management
  users = {
    get: async (userId: string): Promise<MLMUser> => {
      const response = await this.request<MLMUser>(`/users/${userId}`)
      return response.data!
    },

    update: async (userId: string, data: Partial<MLMUser>): Promise<MLMUser> => {
      const response = await this.request<MLMUser>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    search: async (filters: any = {}): Promise<MLMUser[]> => {
      const params = new URLSearchParams(filters)
      const response = await this.request<MLMUser[]>(`/users?${params}`)
      return response.data!
    },

    getStats: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/users/${userId}/stats`)
      return response.data!
    }
  }

  // Team Management
  teams = {
    getStructure: async (userId: string, depth: number = 5): Promise<any> => {
      const response = await this.request<any>(`/teams/${userId}/structure?depth=${depth}`)
      return response.data!
    },

    getStats: async (userId: string, period: number = 30): Promise<any> => {
      const response = await this.request<any>(`/teams/${userId}/stats?period=${period}`)
      return response.data!
    },

    getMembers: async (userId: string, level?: number): Promise<any[]> => {
      const url = level ? `/teams/${userId}/members?level=${level}` : `/teams/${userId}/members`
      const response = await this.request<any[]>(url)
      return response.data!
    },

    getTopPerformers: async (userId: string, limit: number = 10): Promise<any[]> => {
      const response = await this.request<any[]>(`/teams/${userId}/top-performers?limit=${limit}`)
      return response.data!
    }
  }

  // Commission Management
  commissions = {
    list: async (params: {
      userId: string
      startDate?: string
      endDate?: string
      status?: string
      type?: string
    }): Promise<MLMCommission[]> => {
      const queryParams = new URLSearchParams(params as any)
      const response = await this.request<MLMCommission[]>(`/commissions?${queryParams}`)
      return response.data!
    },

    calculate: async (data: {
      buyerId: string
      amount: number
      productType: string
      commissionType: string
    }): Promise<any> => {
      const response = await this.request<any>('/commissions/calculate', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    getSummary: async (userId: string, period?: string): Promise<any> => {
      const url = period ? `/commissions/summary?userId=${userId}&period=${period}` : `/commissions/summary?userId=${userId}`
      const response = await this.request<any>(url)
      return response.data!
    }
  }

  // Payout Management
  payouts = {
    list: async (params: {
      userId: string
      status?: string
    }): Promise<MLMPayout[]> => {
      const queryParams = new URLSearchParams(params as any)
      const response = await this.request<MLMPayout[]>(`/payouts?${queryParams}`)
      return response.data!
    },

    request: async (data: {
      userId: string
      amount: number
      payoutMethodId: string
      commissionIds?: string[]
      notes?: string
    }): Promise<any> => {
      const response = await this.request<any>('/payouts', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    getMethods: async (userId: string): Promise<any[]> => {
      const response = await this.request<any[]>(`/payouts/methods?userId=${userId}`)
      return response.data!
    },

    getBalance: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/payouts/balance?userId=${userId}`)
      return response.data!
    }
  }

  // Analytics
  analytics = {
    getUserAnalytics: async (userId: string, period: string = 'monthly', metrics?: string[]): Promise<any> => {
      const params = new URLSearchParams({ period })
      if (metrics) {
        params.append('metrics', metrics.join(','))
      }
      const response = await this.request<any>(`/analytics/users/${userId}?${params}`)
      return response.data!
    },

    getPredictiveInsights: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/analytics/users/${userId}/predictions`)
      return response.data!
    },

    getPerformanceScore: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/analytics/users/${userId}/performance-score`)
      return response.data!
    },

    getTeamOptimization: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/analytics/teams/${userId}/optimization`)
      return response.data!
    },

    getRevenueForecast: async (userId: string, months: number = 6): Promise<any> => {
      const response = await this.request<any>(`/analytics/users/${userId}/forecast?months=${months}`)
      return response.data!
    }
  }

  // Notifications
  notifications = {
    list: async (params: {
      userId: string
      unreadOnly?: boolean
      limit?: number
    }): Promise<MLMNotification[]> => {
      const queryParams = new URLSearchParams(params as any)
      const response = await this.request<MLMNotification[]>(`/notifications?${queryParams}`)
      return response.data!
    },

    markAsRead: async (notificationId: string): Promise<void> => {
      await this.request(`/notifications/${notificationId}/read`, {
        method: 'PUT'
      })
    },

    markAllAsRead: async (userId: string): Promise<void> => {
      await this.request(`/notifications/mark-all-read`, {
        method: 'PUT',
        body: JSON.stringify({ userId })
      })
    },

    getStats: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/notifications/stats?userId=${userId}`)
      return response.data!
    }
  }

  // Mobile Integration
  mobile = {
    registerDevice: async (data: {
      userId: string
      deviceToken: string
      platform: 'ios' | 'android' | 'web'
      appVersion: string
      osVersion: string
      timezone: string
    }): Promise<any> => {
      const response = await this.request<any>('/mobile/devices', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    sendPushNotification: async (data: {
      userId: string
      title: string
      body: string
      data?: any
      priority?: 'low' | 'normal' | 'high'
      category?: string
    }): Promise<any> => {
      const response = await this.request<any>('/mobile/notifications', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    trackEvent: async (data: {
      userId: string
      sessionId: string
      events: any[]
      deviceInfo: any
    }): Promise<void> => {
      await this.request('/mobile/analytics', {
        method: 'POST',
        body: JSON.stringify(data)
      })
    }
  }

  // AI Features
  ai = {
    getRecommendations: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/ai/recommendations/${userId}`)
      return response.data!
    },

    processChatbotQuery: async (data: {
      userId: string
      query: string
    }): Promise<any> => {
      const response = await this.request<any>('/ai/chatbot', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.data!
    },

    getPerformanceProfile: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/ai/performance-profile/${userId}`)
      return response.data!
    },

    optimizeTeamStructure: async (userId: string): Promise<any> => {
      const response = await this.request<any>(`/ai/team-optimization/${userId}`)
      return response.data!
    }
  }

  // Automation
  automation = {
    getStatus: async (): Promise<any> => {
      const response = await this.request<any>('/automation/status')
      return response.data!
    },

    getRules: async (): Promise<any[]> => {
      const response = await this.request<any[]>('/automation/rules')
      return response.data!
    },

    addRule: async (rule: any): Promise<any> => {
      const response = await this.request<any>('/automation/rules', {
        method: 'POST',
        body: JSON.stringify(rule)
      })
      return response.data!
    },

    getLogs: async (limit: number = 100): Promise<any[]> => {
      const response = await this.request<any[]>(`/automation/logs?limit=${limit}`)
      return response.data!
    }
  }

  // Core request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.baseHeaders,
        ...options.headers
      }
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.config.retries!; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        return data as APIResponse<T>
        
      } catch (error) {
        lastError = error as Error
        
        if (attempt < this.config.retries!) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        throw lastError
      }
    }
    
    throw lastError!
  }
}

// Export the client class
export { MLMClient }

// Export types
export type { MLMClientConfig, APIResponse }

// Default export
export default MLMClient
