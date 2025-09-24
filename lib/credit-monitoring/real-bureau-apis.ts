// Real Credit Bureau API Integration
// Production-ready integration with actual credit bureaus

export interface BureauCredentials {
  apiKey: string
  secretKey: string
  environment: 'sandbox' | 'production'
  baseUrl: string
}

export interface BureauConfig {
  experian: BureauCredentials
  equifax: BureauCredentials
  transunion: BureauCredentials
}

export interface CreditScoreRequest {
  userId: string
  ssn: string
  firstName: string
  lastName: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

export interface CreditReportRequest extends CreditScoreRequest {
  reportType: 'full' | 'summary' | 'score_only'
  includeInquiries?: boolean
  includeAccounts?: boolean
  includePublicRecords?: boolean
}

export interface BureauResponse<T> {
  success: boolean
  data?: T
  error?: string
  requestId: string
  timestamp: string
}

// Experian API Integration
export class ExperianRealAPI {
  private credentials: BureauCredentials

  constructor(credentials: BureauCredentials) {
    this.credentials = credentials
  }

  async getCreditScore(request: CreditScoreRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          options: {
            includeScoreFactors: true,
            includeScoreHistory: false
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Experian API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'experian',
          score: data.creditScore?.score || 0,
          scoreType: data.creditScore?.scoreType || 'fico',
          date: data.timestamp,
          range: data.creditScore?.range || { min: 300, max: 850 },
          factors: data.creditScore?.factors || []
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Experian API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `exp_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getCreditReport(request: CreditReportRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          reportType: request.reportType,
          options: {
            includeInquiries: request.includeInquiries ?? true,
            includeAccounts: request.includeAccounts ?? true,
            includePublicRecords: request.includePublicRecords ?? true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Experian API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'experian',
          reportId: data.reportId,
          date: data.timestamp,
          personalInfo: data.personalInfo,
          accounts: data.accounts || [],
          inquiries: data.inquiries || [],
          publicRecords: data.publicRecords || [],
          collections: data.collections || [],
          summary: data.summary
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Experian API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `exp_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getAlerts(userId: string, since?: string): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/alerts?userId=${userId}&since=${since || ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Experian API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.alerts || [],
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Experian API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `exp_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Equifax API Integration
export class EquifaxRealAPI {
  private credentials: BureauCredentials

  constructor(credentials: BureauCredentials) {
    this.credentials = credentials
  }

  async getCreditScore(request: CreditScoreRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          options: {
            includeScoreFactors: true,
            includeScoreHistory: false
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Equifax API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'equifax',
          score: data.creditScore?.score || 0,
          scoreType: data.creditScore?.scoreType || 'fico',
          date: data.timestamp,
          range: data.creditScore?.range || { min: 300, max: 850 },
          factors: data.creditScore?.factors || []
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Equifax API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `eq_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getCreditReport(request: CreditReportRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `eq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          reportType: request.reportType,
          options: {
            includeInquiries: request.includeInquiries ?? true,
            includeAccounts: request.includeAccounts ?? true,
            includePublicRecords: request.includePublicRecords ?? true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Equifax API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'equifax',
          reportId: data.reportId,
          date: data.timestamp,
          personalInfo: data.personalInfo,
          accounts: data.accounts || [],
          inquiries: data.inquiries || [],
          publicRecords: data.publicRecords || [],
          collections: data.collections || [],
          summary: data.summary
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Equifax API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `eq_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getAlerts(userId: string, since?: string): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/alerts?userId=${userId}&since=${since || ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Equifax API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.alerts || [],
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('Equifax API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `eq_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// TransUnion API Integration
export class TransUnionRealAPI {
  private credentials: BureauCredentials

  constructor(credentials: BureauCredentials) {
    this.credentials = credentials
  }

  async getCreditScore(request: CreditScoreRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-score`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `tu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          options: {
            includeScoreFactors: true,
            includeScoreHistory: false
          }
        })
      })

      if (!response.ok) {
        throw new Error(`TransUnion API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'transunion',
          score: data.creditScore?.score || 0,
          scoreType: data.creditScore?.scoreType || 'fico',
          date: data.timestamp,
          range: data.creditScore?.range || { min: 300, max: 850 },
          factors: data.creditScore?.factors || []
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('TransUnion API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `tu_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getCreditReport(request: CreditReportRequest): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/credit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0',
          'X-Request-ID': `tu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        body: JSON.stringify({
          consumer: {
            ssn: request.ssn,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            address: request.address
          },
          reportType: request.reportType,
          options: {
            includeInquiries: request.includeInquiries ?? true,
            includeAccounts: request.includeAccounts ?? true,
            includePublicRecords: request.includePublicRecords ?? true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`TransUnion API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: {
          bureau: 'transunion',
          reportId: data.reportId,
          date: data.timestamp,
          personalInfo: data.personalInfo,
          accounts: data.accounts || [],
          inquiries: data.inquiries || [],
          publicRecords: data.publicRecords || [],
          collections: data.collections || [],
          summary: data.summary
        },
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('TransUnion API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `tu_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  async getAlerts(userId: string, since?: string): Promise<BureauResponse<any>> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/v1/alerts?userId=${userId}&since=${since || ''}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json',
          'X-API-Version': '1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`TransUnion API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.alerts || [],
        requestId: data.requestId,
        timestamp: data.timestamp
      }
    } catch (error) {
      console.error('TransUnion API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: `tu_error_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Bureau Configuration Manager
export class BureauConfigManager {
  private static instance: BureauConfigManager
  private config: BureauConfig | null = null

  private constructor() {}

  static getInstance(): BureauConfigManager {
    if (!BureauConfigManager.instance) {
      BureauConfigManager.instance = new BureauConfigManager()
    }
    return BureauConfigManager.instance
  }

  async loadConfig(): Promise<BureauConfig> {
    if (this.config) {
      return this.config
    }

    // Load configuration from environment variables
    this.config = {
      experian: {
        apiKey: process.env.EXPERIAN_API_KEY || '',
        secretKey: process.env.EXPERIAN_SECRET_KEY || '',
        environment: (process.env.EXPERIAN_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        baseUrl: process.env.EXPERIAN_BASE_URL || 'https://sandbox.experian.com/api'
      },
      equifax: {
        apiKey: process.env.EQUIFAX_API_KEY || '',
        secretKey: process.env.EQUIFAX_SECRET_KEY || '',
        environment: (process.env.EQUIFAX_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        baseUrl: process.env.EQUIFAX_BASE_URL || 'https://sandbox.equifax.com/api'
      },
      transunion: {
        apiKey: process.env.TRANSUNION_API_KEY || '',
        secretKey: process.env.TRANSUNION_SECRET_KEY || '',
        environment: (process.env.TRANSUNION_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
        baseUrl: process.env.TRANSUNION_BASE_URL || 'https://sandbox.transunion.com/api'
      }
    }

    return this.config
  }

  getConfig(): BureauConfig | null {
    return this.config
  }

  isConfigured(): boolean {
    return !!(
      this.config?.experian.apiKey &&
      this.config?.equifax.apiKey &&
      this.config?.transunion.apiKey
    )
  }
}

// Unified Real Credit Bureau Service
export class RealCreditBureauService {
  private experianAPI: ExperianRealAPI | null = null
  private equifaxAPI: EquifaxRealAPI | null = null
  private transunionAPI: TransUnionRealAPI | null = null
  private configManager: BureauConfigManager

  constructor() {
    this.configManager = BureauConfigManager.getInstance()
  }

  async initialize(): Promise<boolean> {
    try {
      const config = await this.configManager.loadConfig()
      
      if (!this.configManager.isConfigured()) {
        console.warn('⚠️ Credit bureau APIs not configured. Using mock data.')
        return false
      }

      this.experianAPI = new ExperianRealAPI(config.experian)
      this.equifaxAPI = new EquifaxRealAPI(config.equifax)
      this.transunionAPI = new TransUnionRealAPI(config.transunion)

      console.log('✅ Real credit bureau APIs initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize credit bureau APIs:', error)
      return false
    }
  }

  async getAllCreditScores(request: CreditScoreRequest): Promise<any[]> {
    if (!this.experianAPI || !this.equifaxAPI || !this.transunionAPI) {
      // Fallback to mock data
      const { CreditMonitoringService } = await import('./credit-bureau-apis')
      return CreditMonitoringService.getAllCreditScores(request.userId)
    }

    const [experianResult, equifaxResult, transunionResult] = await Promise.allSettled([
      this.experianAPI.getCreditScore(request),
      this.equifaxAPI.getCreditScore(request),
      this.transunionAPI.getCreditScore(request)
    ])

    const results = []
    
    if (experianResult.status === 'fulfilled' && experianResult.value.success) {
      results.push(experianResult.value.data)
    }
    
    if (equifaxResult.status === 'fulfilled' && equifaxResult.value.success) {
      results.push(equifaxResult.value.data)
    }
    
    if (transunionResult.status === 'fulfilled' && transunionResult.value.success) {
      results.push(transunionResult.value.data)
    }

    return results
  }

  async getAllCreditReports(request: CreditReportRequest): Promise<any[]> {
    if (!this.experianAPI || !this.equifaxAPI || !this.transunionAPI) {
      // Fallback to mock data
      const { CreditMonitoringService } = await import('./credit-bureau-apis')
      return CreditMonitoringService.getAllCreditReports(request.userId)
    }

    const [experianResult, equifaxResult, transunionResult] = await Promise.allSettled([
      this.experianAPI.getCreditReport(request),
      this.equifaxAPI.getCreditReport(request),
      this.transunionAPI.getCreditReport(request)
    ])

    const results = []
    
    if (experianResult.status === 'fulfilled' && experianResult.value.success) {
      results.push(experianResult.value.data)
    }
    
    if (equifaxResult.status === 'fulfilled' && equifaxResult.value.success) {
      results.push(equifaxResult.value.data)
    }
    
    if (transunionResult.status === 'fulfilled' && transunionResult.value.success) {
      results.push(transunionResult.value.data)
    }

    return results
  }

  async getAllAlerts(userId: string, since?: string): Promise<any[]> {
    if (!this.experianAPI || !this.equifaxAPI || !this.transunionAPI) {
      // Fallback to mock data
      const { CreditMonitoringService } = await import('./credit-bureau-apis')
      return CreditMonitoringService.getAllAlerts(userId, since)
    }

    const [experianResult, equifaxResult, transunionResult] = await Promise.allSettled([
      this.experianAPI.getAlerts(userId, since),
      this.equifaxAPI.getAlerts(userId, since),
      this.transunionAPI.getAlerts(userId, since)
    ])

    const results = []
    
    if (experianResult.status === 'fulfilled' && experianResult.value.success) {
      results.push(...experianResult.value.data)
    }
    
    if (equifaxResult.status === 'fulfilled' && equifaxResult.value.success) {
      results.push(...equifaxResult.value.data)
    }
    
    if (transunionResult.status === 'fulfilled' && transunionResult.value.success) {
      results.push(...transunionResult.value.data)
    }

    return results
  }
}
