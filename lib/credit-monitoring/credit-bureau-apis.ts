// Credit Bureau API Integration Services
// This file contains mock implementations for development
// In production, replace with actual bureau API integrations

export interface CreditScore {
  bureau: 'experian' | 'equifax' | 'transunion'
  score: number
  scoreType: 'fico' | 'vantagescore' | 'custom'
  date: string
  range: {
    min: number
    max: number
  }
  factors: CreditFactor[]
}

export interface CreditFactor {
  code: string
  description: string
  impact: 'positive' | 'negative' | 'neutral'
  weight: number
}

export interface CreditReport {
  bureau: 'experian' | 'equifax' | 'transunion'
  reportId: string
  date: string
  personalInfo: {
    name: string
    address: string
    ssn: string
    dob: string
  }
  accounts: CreditAccount[]
  inquiries: CreditInquiry[]
  publicRecords: PublicRecord[]
  collections: Collection[]
  summary: {
    totalAccounts: number
    openAccounts: number
    totalDebt: number
    creditUtilization: number
    paymentHistory: number
  }
}

export interface CreditAccount {
  id: string
  creditor: string
  accountNumber: string
  accountType: string
  status: 'open' | 'closed' | 'delinquent'
  balance: number
  creditLimit: number
  paymentStatus: string
  lastPaymentDate: string
  openedDate: string
  closedDate?: string
  monthlyPayment: number
}

export interface CreditInquiry {
  id: string
  creditor: string
  date: string
  type: 'hard' | 'soft'
  amount?: number
}

export interface PublicRecord {
  id: string
  type: 'bankruptcy' | 'foreclosure' | 'lien' | 'judgment'
  date: string
  amount: number
  status: 'active' | 'released'
  court: string
}

export interface Collection {
  id: string
  creditor: string
  originalCreditor: string
  amount: number
  date: string
  status: 'active' | 'paid' | 'disputed'
}

export interface CreditAlert {
  id: string
  type: 'score_change' | 'new_account' | 'inquiry' | 'payment_missed' | 'balance_change'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  date: string
  bureau: 'experian' | 'equifax' | 'transunion' | 'all'
  actionRequired: boolean
  actionUrl?: string
}

export interface MonitoringSettings {
  userId: string
  enabled: boolean
  scoreAlerts: {
    enabled: boolean
    threshold: number
    direction: 'increase' | 'decrease' | 'both'
  }
  newAccountAlerts: boolean
  inquiryAlerts: boolean
  paymentAlerts: boolean
  balanceAlerts: {
    enabled: boolean
    threshold: number
  }
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

// Mock Credit Bureau API Services
export class ExperianAPI {
  private static readonly BASE_URL = process.env.EXPERIAN_API_URL || 'https://api.experian.com'
  private static readonly API_KEY = process.env.EXPERIAN_API_KEY

  static async getCreditScore(userId: string): Promise<CreditScore> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      bureau: 'experian',
      score: 720 + Math.floor(Math.random() * 80),
      scoreType: 'fico',
      date: new Date().toISOString(),
      range: { min: 300, max: 850 },
      factors: [
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 },
        { code: 'LENGTH_OF_HISTORY', description: 'Length of Credit History', impact: 'positive', weight: 0.15 },
        { code: 'NEW_CREDIT', description: 'New Credit', impact: 'neutral', weight: 0.10 },
        { code: 'CREDIT_MIX', description: 'Credit Mix', impact: 'positive', weight: 0.10 }
      ]
    }
  }

  static async getCreditReport(userId: string): Promise<CreditReport> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      bureau: 'experian',
      reportId: `EXP-${Date.now()}`,
      date: new Date().toISOString(),
      personalInfo: {
        name: 'John Doe',
        address: '123 Main St, Anytown, ST 12345',
        ssn: 'XXX-XX-1234',
        dob: '01/01/1980'
      },
      accounts: this.generateMockAccounts(),
      inquiries: this.generateMockInquiries(),
      publicRecords: this.generateMockPublicRecords(),
      collections: this.generateMockCollections(),
      summary: {
        totalAccounts: 8,
        openAccounts: 5,
        totalDebt: 15000,
        creditUtilization: 0.25,
        paymentHistory: 0.95
      }
    }
  }

  static async getAlerts(userId: string, since?: string): Promise<CreditAlert[]> {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: `alert-${Date.now()}-1`,
        type: 'score_change',
        severity: 'medium',
        title: 'Credit Score Increased',
        description: 'Your Experian credit score increased by 15 points',
        date: new Date().toISOString(),
        bureau: 'experian',
        actionRequired: false
      },
      {
        id: `alert-${Date.now()}-2`,
        type: 'new_account',
        severity: 'high',
        title: 'New Account Detected',
        description: 'A new credit card account was opened in your name',
        date: new Date(Date.now() - 86400000).toISOString(),
        bureau: 'experian',
        actionRequired: true,
        actionUrl: '/dashboard/monitoring/alerts/new-account'
      }
    ]
  }

  private static generateMockAccounts(): CreditAccount[] {
    return [
      {
        id: 'acc-1',
        creditor: 'Chase Bank',
        accountNumber: '****1234',
        accountType: 'Credit Card',
        status: 'open',
        balance: 2500,
        creditLimit: 10000,
        paymentStatus: 'Current',
        lastPaymentDate: '2024-01-15',
        openedDate: '2020-03-01',
        monthlyPayment: 75
      },
      {
        id: 'acc-2',
        creditor: 'Bank of America',
        accountNumber: '****5678',
        accountType: 'Credit Card',
        status: 'open',
        balance: 0,
        creditLimit: 5000,
        paymentStatus: 'Current',
        lastPaymentDate: '2024-01-10',
        openedDate: '2019-06-15',
        monthlyPayment: 0
      }
    ]
  }

  private static generateMockInquiries(): CreditInquiry[] {
    return [
      {
        id: 'inq-1',
        creditor: 'Chase Bank',
        date: '2024-01-10',
        type: 'hard',
        amount: 10000
      },
      {
        id: 'inq-2',
        creditor: 'Capital One',
        date: '2023-12-15',
        type: 'hard',
        amount: 5000
      }
    ]
  }

  private static generateMockPublicRecords(): PublicRecord[] {
    return []
  }

  private static generateMockCollections(): Collection[] {
    return []
  }
}

export class EquifaxAPI {
  private static readonly BASE_URL = process.env.EQUIFAX_API_URL || 'https://api.equifax.com'
  private static readonly API_KEY = process.env.EQUIFAX_API_KEY

  static async getCreditScore(userId: string): Promise<CreditScore> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    return {
      bureau: 'equifax',
      score: 710 + Math.floor(Math.random() * 90),
      scoreType: 'fico',
      date: new Date().toISOString(),
      range: { min: 300, max: 850 },
      factors: [
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 },
        { code: 'LENGTH_OF_HISTORY', description: 'Length of Credit History', impact: 'positive', weight: 0.15 },
        { code: 'NEW_CREDIT', description: 'New Credit', impact: 'neutral', weight: 0.10 },
        { code: 'CREDIT_MIX', description: 'Credit Mix', impact: 'positive', weight: 0.10 }
      ]
    }
  }

  static async getCreditReport(userId: string): Promise<CreditReport> {
    await new Promise(resolve => setTimeout(resolve, 1800))
    
    return {
      bureau: 'equifax',
      reportId: `EQ-${Date.now()}`,
      date: new Date().toISOString(),
      personalInfo: {
        name: 'John Doe',
        address: '123 Main St, Anytown, ST 12345',
        ssn: 'XXX-XX-1234',
        dob: '01/01/1980'
      },
      accounts: this.generateMockAccounts(),
      inquiries: this.generateMockInquiries(),
      publicRecords: this.generateMockPublicRecords(),
      collections: this.generateMockCollections(),
      summary: {
        totalAccounts: 7,
        openAccounts: 4,
        totalDebt: 12000,
        creditUtilization: 0.22,
        paymentHistory: 0.92
      }
    }
  }

  static async getAlerts(userId: string, since?: string): Promise<CreditAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    return [
      {
        id: `alert-${Date.now()}-3`,
        type: 'inquiry',
        severity: 'low',
        title: 'New Credit Inquiry',
        description: 'A hard inquiry was made by Wells Fargo',
        date: new Date(Date.now() - 172800000).toISOString(),
        bureau: 'equifax',
        actionRequired: false
      }
    ]
  }

  private static generateMockAccounts(): CreditAccount[] {
    return [
      {
        id: 'acc-3',
        creditor: 'Wells Fargo',
        accountNumber: '****9012',
        accountType: 'Auto Loan',
        status: 'open',
        balance: 18000,
        creditLimit: 25000,
        paymentStatus: 'Current',
        lastPaymentDate: '2024-01-20',
        openedDate: '2022-05-01',
        monthlyPayment: 450
      }
    ]
  }

  private static generateMockInquiries(): CreditInquiry[] {
    return [
      {
        id: 'inq-3',
        creditor: 'Wells Fargo',
        date: '2024-01-05',
        type: 'hard',
        amount: 25000
      }
    ]
  }

  private static generateMockPublicRecords(): PublicRecord[] {
    return []
  }

  private static generateMockCollections(): Collection[] {
    return []
  }
}

export class TransUnionAPI {
  private static readonly BASE_URL = process.env.TRANSUNION_API_URL || 'https://api.transunion.com'
  private static readonly API_KEY = process.env.TRANSUNION_API_KEY

  static async getCreditScore(userId: string): Promise<CreditScore> {
    await new Promise(resolve => setTimeout(resolve, 1100))
    
    return {
      bureau: 'transunion',
      score: 730 + Math.floor(Math.random() * 70),
      scoreType: 'fico',
      date: new Date().toISOString(),
      range: { min: 300, max: 850 },
      factors: [
        { code: 'PAYMENT_HISTORY', description: 'Payment History', impact: 'positive', weight: 0.35 },
        { code: 'CREDIT_UTILIZATION', description: 'Credit Utilization', impact: 'negative', weight: 0.30 },
        { code: 'LENGTH_OF_HISTORY', description: 'Length of Credit History', impact: 'positive', weight: 0.15 },
        { code: 'NEW_CREDIT', description: 'New Credit', impact: 'neutral', weight: 0.10 },
        { code: 'CREDIT_MIX', description: 'Credit Mix', impact: 'positive', weight: 0.10 }
      ]
    }
  }

  static async getCreditReport(userId: string): Promise<CreditReport> {
    await new Promise(resolve => setTimeout(resolve, 1900))
    
    return {
      bureau: 'transunion',
      reportId: `TU-${Date.now()}`,
      date: new Date().toISOString(),
      personalInfo: {
        name: 'John Doe',
        address: '123 Main St, Anytown, ST 12345',
        ssn: 'XXX-XX-1234',
        dob: '01/01/1980'
      },
      accounts: this.generateMockAccounts(),
      inquiries: this.generateMockInquiries(),
      publicRecords: this.generateMockPublicRecords(),
      collections: this.generateMockCollections(),
      summary: {
        totalAccounts: 9,
        openAccounts: 6,
        totalDebt: 18000,
        creditUtilization: 0.28,
        paymentHistory: 0.94
      }
    }
  }

  static async getAlerts(userId: string, since?: string): Promise<CreditAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 700))
    
    return [
      {
        id: `alert-${Date.now()}-4`,
        type: 'balance_change',
        severity: 'medium',
        title: 'Account Balance Increased',
        description: 'Your Chase credit card balance increased by $500',
        date: new Date(Date.now() - 259200000).toISOString(),
        bureau: 'transunion',
        actionRequired: true,
        actionUrl: '/dashboard/monitoring/alerts/balance-change'
      }
    ]
  }

  private static generateMockAccounts(): CreditAccount[] {
    return [
      {
        id: 'acc-4',
        creditor: 'American Express',
        accountNumber: '****3456',
        accountType: 'Credit Card',
        status: 'open',
        balance: 3200,
        creditLimit: 15000,
        paymentStatus: 'Current',
        lastPaymentDate: '2024-01-18',
        openedDate: '2021-09-01',
        monthlyPayment: 120
      }
    ]
  }

  private static generateMockInquiries(): CreditInquiry[] {
    return [
      {
        id: 'inq-4',
        creditor: 'American Express',
        date: '2023-11-20',
        type: 'hard',
        amount: 15000
      }
    ]
  }

  private static generateMockPublicRecords(): PublicRecord[] {
    return []
  }

  private static generateMockCollections(): Collection[] {
    return []
  }
}

// Unified Credit Monitoring Service
export class CreditMonitoringService {
  static async getAllCreditScores(userId: string): Promise<CreditScore[]> {
    const [experian, equifax, transunion] = await Promise.all([
      ExperianAPI.getCreditScore(userId),
      EquifaxAPI.getCreditScore(userId),
      TransUnionAPI.getCreditScore(userId)
    ])
    
    return [experian, equifax, transunion]
  }

  static async getAllCreditReports(userId: string): Promise<CreditReport[]> {
    const [experian, equifax, transunion] = await Promise.all([
      ExperianAPI.getCreditReport(userId),
      EquifaxAPI.getCreditReport(userId),
      TransUnionAPI.getCreditReport(userId)
    ])
    
    return [experian, equifax, transunion]
  }

  static async getAllAlerts(userId: string, since?: string): Promise<CreditAlert[]> {
    const [experian, equifax, transunion] = await Promise.all([
      ExperianAPI.getAlerts(userId, since),
      EquifaxAPI.getAlerts(userId, since),
      TransUnionAPI.getAlerts(userId, since)
    ])
    
    return [...experian, ...equifax, ...transunion].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }

  static calculateAverageScore(scores: CreditScore[]): number {
    const validScores = scores.filter(score => score.score > 0)
    if (validScores.length === 0) return 0
    
    const sum = validScores.reduce((acc, score) => acc + score.score, 0)
    return Math.round(sum / validScores.length)
  }

  static calculateScoreTrend(scores: CreditScore[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable'
    
    const sortedScores = scores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const first = sortedScores[0].score
    const last = sortedScores[sortedScores.length - 1].score
    
    const difference = last - first
    if (difference > 10) return 'up'
    if (difference < -10) return 'down'
    return 'stable'
  }
}
