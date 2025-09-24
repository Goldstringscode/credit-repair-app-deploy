export interface PayoutRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  amount: number
  method: PayoutMethod
  status: "pending" | "approved" | "processing" | "completed" | "rejected" | "failed"
  requestedAt: Date
  reviewedAt?: Date
  processedAt?: Date
  completedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  failureReason?: string
  transactionId?: string
  fees: PayoutFees
  metadata: PayoutMetadata
  riskScore: number
  flags: PayoutFlag[]
}

export interface PayoutMethod {
  id: string
  type: "bank_account" | "stripe_connect" | "paypal" | "check"
  status: "pending" | "verified" | "failed" | "disabled"
  details: any
  verifiedAt?: Date
}

export interface PayoutFees {
  platformFee: number
  processingFee: number
  totalFees: number
  netAmount: number
}

export interface PayoutMetadata {
  commissionIds: string[]
  period: string
  notes?: string
  ipAddress: string
  userAgent: string
  location?: string
}

export interface PayoutFlag {
  type: "high_amount" | "frequent_requests" | "new_account" | "suspicious_activity" | "compliance_review"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  createdAt: Date
}

export interface AdminPayoutSettings {
  autoApprovalLimit: number // Auto-approve payouts under this amount
  dailyPayoutLimit: number // Max payouts per user per day
  monthlyPayoutLimit: number // Max payouts per user per month
  minimumAccountAge: number // Days account must exist before payouts
  requireManualReview: boolean // Require manual review for all payouts
  enableRiskScoring: boolean // Enable automated risk scoring
  holdPeriods: Record<string, number> // Hold periods by commission type
  processingSchedule: {
    enabled: boolean
    frequency: "daily" | "weekly" | "biweekly"
    processingDays: number[] // Days of week (0-6)
    cutoffTime: string // HH:MM format
  }
  notifications: {
    emailOnLargePayouts: boolean
    emailThreshold: number
    slackWebhook?: string
    discordWebhook?: string
  }
}

export interface PayoutAuditLog {
  id: string
  payoutId: string
  adminId: string
  adminName: string
  action: "approved" | "rejected" | "processed" | "cancelled" | "modified"
  previousStatus: string
  newStatus: string
  reason?: string
  changes?: Record<string, any>
  timestamp: Date
  ipAddress: string
}

export interface PayoutSystemHealth {
  totalPendingPayouts: number
  totalPendingAmount: number
  averageProcessingTime: number // in hours
  successRate: number // percentage
  failureRate: number // percentage
  systemLoad: number // percentage
  queueDepth: number
  lastProcessedAt: Date
  nextScheduledRun: Date
  alerts: SystemAlert[]
}

export interface SystemAlert {
  id: string
  type: "error" | "warning" | "info"
  message: string
  severity: "low" | "medium" | "high" | "critical"
  createdAt: Date
  resolvedAt?: Date
  resolvedBy?: string
}

// Risk scoring algorithm
export function calculateRiskScore(request: PayoutRequest, userHistory: any[]): number {
  let score = 0

  // Amount-based risk
  if (request.amount > 100000)
    score += 30 // $1000+
  else if (request.amount > 50000)
    score += 20 // $500+
  else if (request.amount > 25000) score += 10 // $250+

  // Frequency-based risk
  const recentPayouts = userHistory.filter(
    (p) => new Date(p.requestedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  )
  if (recentPayouts.length > 5) score += 25
  else if (recentPayouts.length > 3) score += 15
  else if (recentPayouts.length > 1) score += 5

  // Account age risk
  const accountAge = Date.now() - new Date(request.requestedAt).getTime()
  const daysSinceCreation = accountAge / (24 * 60 * 60 * 1000)
  if (daysSinceCreation < 7) score += 40
  else if (daysSinceCreation < 30) score += 20
  else if (daysSinceCreation < 90) score += 10

  // Method verification risk
  if (request.method.status !== "verified") score += 30
  if (!request.method.verifiedAt) score += 20

  // Geographic risk (mock)
  if (request.metadata.location && ["high-risk-country"].includes(request.metadata.location)) {
    score += 50
  }

  return Math.min(score, 100) // Cap at 100
}

// Generate payout flags based on risk assessment
export function generatePayoutFlags(request: PayoutRequest, riskScore: number): PayoutFlag[] {
  const flags: PayoutFlag[] = []

  if (request.amount > 100000) {
    flags.push({
      type: "high_amount",
      severity: "high",
      message: `High payout amount: $${(request.amount / 100).toFixed(2)}`,
      createdAt: new Date(),
    })
  }

  if (riskScore > 70) {
    flags.push({
      type: "suspicious_activity",
      severity: "critical",
      message: `High risk score: ${riskScore}/100`,
      createdAt: new Date(),
    })
  } else if (riskScore > 50) {
    flags.push({
      type: "compliance_review",
      severity: "medium",
      message: `Elevated risk score: ${riskScore}/100`,
      createdAt: new Date(),
    })
  }

  if (request.method.status !== "verified") {
    flags.push({
      type: "new_account",
      severity: "medium",
      message: "Unverified payout method",
      createdAt: new Date(),
    })
  }

  return flags
}

// Mock data for development
export const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "payout_001",
    userId: "user_123",
    userName: "John Smith",
    userEmail: "john@example.com",
    amount: 125000, // $1,250.00
    method: {
      id: "pm_001",
      type: "bank_account",
      status: "verified",
      details: { bankName: "Chase Bank", lastFour: "1234" },
      verifiedAt: new Date("2024-01-01"),
    },
    status: "pending",
    requestedAt: new Date("2024-01-15T10:30:00Z"),
    fees: {
      platformFee: 625,
      processingFee: 0,
      totalFees: 625,
      netAmount: 124375,
    },
    metadata: {
      commissionIds: ["comm_001", "comm_002"],
      period: "2024-01",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      location: "US",
    },
    riskScore: 25,
    flags: [],
  },
  {
    id: "payout_002",
    userId: "user_456",
    userName: "Sarah Johnson",
    userEmail: "sarah@example.com",
    amount: 275000, // $2,750.00
    method: {
      id: "pm_002",
      type: "stripe_connect",
      status: "verified",
      details: { email: "sarah@example.com" },
      verifiedAt: new Date("2024-01-10"),
    },
    status: "pending",
    requestedAt: new Date("2024-01-15T14:20:00Z"),
    fees: {
      platformFee: 1375,
      processingFee: 4625, // 1.5% + $0.50
      totalFees: 6000,
      netAmount: 269000,
    },
    metadata: {
      commissionIds: ["comm_003", "comm_004", "comm_005"],
      period: "2024-01",
      ipAddress: "10.0.0.1",
      userAgent: "Mozilla/5.0...",
      location: "US",
    },
    riskScore: 45,
    flags: [
      {
        type: "high_amount",
        severity: "high",
        message: "High payout amount: $2,750.00",
        createdAt: new Date(),
      },
    ],
  },
  {
    id: "payout_003",
    userId: "user_789",
    userName: "Mike Chen",
    userEmail: "mike@example.com",
    amount: 50000, // $500.00
    method: {
      id: "pm_003",
      type: "bank_account",
      status: "pending",
      details: { bankName: "Bank of America", lastFour: "5678" },
    },
    status: "pending",
    requestedAt: new Date("2024-01-15T16:45:00Z"),
    fees: {
      platformFee: 250,
      processingFee: 0,
      totalFees: 250,
      netAmount: 49750,
    },
    metadata: {
      commissionIds: ["comm_006"],
      period: "2024-01",
      ipAddress: "172.16.0.1",
      userAgent: "Mozilla/5.0...",
      location: "US",
    },
    riskScore: 65,
    flags: [
      {
        type: "new_account",
        severity: "medium",
        message: "Unverified payout method",
        createdAt: new Date(),
      },
      {
        type: "compliance_review",
        severity: "medium",
        message: "Elevated risk score: 65/100",
        createdAt: new Date(),
      },
    ],
  },
]

export const mockAdminSettings: AdminPayoutSettings = {
  autoApprovalLimit: 50000, // $500.00
  dailyPayoutLimit: 500000, // $5,000.00
  monthlyPayoutLimit: 2000000, // $20,000.00
  minimumAccountAge: 7, // 7 days
  requireManualReview: false,
  enableRiskScoring: true,
  holdPeriods: {
    credit_repair_sale: 30,
    mlm_recruitment: 3,
    training_course: 14,
    certified_mail: 1,
  },
  processingSchedule: {
    enabled: true,
    frequency: "daily",
    processingDays: [1, 2, 3, 4, 5], // Monday-Friday
    cutoffTime: "15:00", // 3 PM
  },
  notifications: {
    emailOnLargePayouts: true,
    emailThreshold: 100000, // $1,000.00
    slackWebhook: "https://hooks.slack.com/...",
    discordWebhook: "https://discord.com/api/webhooks/...",
  },
}

export const mockSystemHealth: PayoutSystemHealth = {
  totalPendingPayouts: 47,
  totalPendingAmount: 1250000, // $12,500.00
  averageProcessingTime: 2.5, // 2.5 hours
  successRate: 98.7,
  failureRate: 1.3,
  systemLoad: 23, // 23%
  queueDepth: 12,
  lastProcessedAt: new Date("2024-01-15T14:30:00Z"),
  nextScheduledRun: new Date("2024-01-16T15:00:00Z"),
  alerts: [
    {
      id: "alert_001",
      type: "warning",
      message: "High queue depth detected",
      severity: "medium",
      createdAt: new Date("2024-01-15T16:00:00Z"),
    },
    {
      id: "alert_002",
      type: "info",
      message: "Scheduled maintenance in 24 hours",
      severity: "low",
      createdAt: new Date("2024-01-15T12:00:00Z"),
    },
  ],
}
