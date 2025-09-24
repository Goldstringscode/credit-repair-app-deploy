export interface PayoutMethod {
  id: string
  userId: string
  type: "bank_account" | "stripe_connect" | "paypal" | "check"
  status: "pending" | "verified" | "failed" | "disabled"
  isDefault: boolean
  details: BankAccountDetails | StripeConnectDetails | PayPalDetails | CheckDetails
  fees: PayoutFees
  processingTime: string
  minimumAmount: number
  createdAt: Date
  verifiedAt?: Date
}

export interface BankAccountDetails {
  bankName: string
  accountType: "checking" | "savings"
  routingNumber: string
  accountNumber: string // encrypted
  accountHolderName: string
  lastFourDigits: string
}

export interface StripeConnectDetails {
  stripeAccountId: string
  email: string
  country: string
  currency: string
  businessType: "individual" | "company"
}

export interface PayPalDetails {
  email: string
  paypalId: string
}

export interface CheckDetails {
  mailingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  payableTo: string
}

export interface PayoutFees {
  flatFee: number // in cents
  percentageFee: number // as decimal (0.029 = 2.9%)
  minimumFee: number // in cents
  maximumFee?: number // in cents
}

export interface PayoutRequest {
  id: string
  userId: string
  amount: number // in cents
  method: PayoutMethod
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  failureReason?: string
  transactionId?: string
  fees: {
    platformFee: number
    processingFee: number
    totalFees: number
    netAmount: number
  }
  metadata: {
    commissionIds: string[]
    period: string
    notes?: string
  }
}

export interface CommissionEscrow {
  id: string
  userId: string
  commissionId: string
  amount: number
  status: "pending" | "available" | "paid" | "disputed" | "refunded"
  holdUntil: Date
  releasedAt?: Date
  reason: "new_sale" | "chargeback_protection" | "quality_review" | "compliance_check"
}

export interface PayoutSchedule {
  userId: string
  frequency: "weekly" | "biweekly" | "monthly"
  dayOfWeek?: number // 0-6 for weekly
  dayOfMonth?: number // 1-31 for monthly
  minimumAmount: number
  autoPayoutEnabled: boolean
  nextPayoutDate: Date
}

// Payout method configurations
export const payoutMethods = {
  bank_account: {
    name: "Bank Account (ACH)",
    description: "Direct deposit to your bank account",
    fees: {
      flatFee: 0, // Free for us to encourage usage
      percentageFee: 0,
      minimumFee: 0,
    },
    processingTime: "3-5 business days",
    minimumAmount: 2500, // $25.00
    icon: "building-2",
    recommended: true,
  },
  stripe_connect: {
    name: "Instant Payout (Stripe)",
    description: "Instant transfer to your debit card",
    fees: {
      flatFee: 50, // $0.50
      percentageFee: 0.015, // 1.5%
      minimumFee: 50,
      maximumFee: 1500, // $15.00 max
    },
    processingTime: "Instant",
    minimumAmount: 500, // $5.00
    icon: "zap",
    recommended: false,
  },
  paypal: {
    name: "PayPal",
    description: "Transfer to your PayPal account",
    fees: {
      flatFee: 25, // $0.25
      percentageFee: 0.02, // 2%
      minimumFee: 25,
      maximumFee: 2000, // $20.00 max
    },
    processingTime: "1-2 business days",
    minimumAmount: 1000, // $10.00
    icon: "credit-card",
    recommended: false,
  },
  check: {
    name: "Paper Check",
    description: "Physical check mailed to your address",
    fees: {
      flatFee: 500, // $5.00 to cover postage and processing
      percentageFee: 0,
      minimumFee: 500,
    },
    processingTime: "7-10 business days",
    minimumAmount: 5000, // $50.00
    icon: "mail",
    recommended: false,
  },
}

// Commission hold periods for different scenarios
export const holdPeriods = {
  new_member: 7, // days - new MLM members have 7-day hold
  credit_repair_sale: 30, // days - credit repair sales have 30-day chargeback protection
  mlm_recruitment: 3, // days - MLM recruitment commissions
  training_course: 14, // days - training course sales
  certified_mail: 1, // days - certified mail services
  high_value: 14, // days - sales over $500
  dispute_period: 60, // days - if there's a dispute
}

// Calculate payout fees
export function calculatePayoutFees(
  amount: number,
  method: keyof typeof payoutMethods,
): {
  platformFee: number
  processingFee: number
  totalFees: number
  netAmount: number
} {
  const methodConfig = payoutMethods[method]

  // Calculate processing fee
  const percentageFee = Math.round(amount * methodConfig.fees.percentageFee)
  const processingFee = Math.max(
    methodConfig.fees.minimumFee,
    Math.min(methodConfig.fees.maximumFee || Number.MAX_SAFE_INTEGER, methodConfig.fees.flatFee + percentageFee),
  )

  // Platform fee (our profit margin on payouts)
  const platformFeeRate = 0.005 // 0.5% platform fee
  const platformFee = Math.round(amount * platformFeeRate)

  const totalFees = processingFee + platformFee
  const netAmount = amount - totalFees

  return {
    platformFee,
    processingFee,
    totalFees,
    netAmount,
  }
}

// Check if commission is available for payout
export function isCommissionAvailable(commission: any): boolean {
  const now = new Date()
  const commissionDate = new Date(commission.createdAt)

  let holdDays = holdPeriods.mlm_recruitment // default

  // Determine hold period based on commission type and amount
  if (commission.type === "credit_repair_sale") {
    holdDays = holdPeriods.credit_repair_sale
  } else if (commission.type === "training_course") {
    holdDays = holdPeriods.training_course
  } else if (commission.amount > 50000) {
    // $500+
    holdDays = holdPeriods.high_value
  }

  const releaseDate = new Date(commissionDate.getTime() + holdDays * 24 * 60 * 60 * 1000)
  return now >= releaseDate
}

// Get available balance for user
export function getAvailableBalance(
  userId: string,
  commissions: any[],
): {
  availableAmount: number
  pendingAmount: number
  totalEarned: number
  nextReleaseDate: Date | null
  nextReleaseAmount: number
} {
  const availableCommissions = commissions.filter(
    (c) => c.userId === userId && c.status === "confirmed" && isCommissionAvailable(c),
  )

  const pendingCommissions = commissions.filter(
    (c) => c.userId === userId && c.status === "confirmed" && !isCommissionAvailable(c),
  )

  const availableAmount = availableCommissions.reduce((sum, c) => sum + c.amount, 0)
  const pendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0)
  const totalEarned = commissions.filter((c) => c.userId === userId).reduce((sum, c) => sum + c.amount, 0)

  // Find next release
  const nextPending = pendingCommissions.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )[0]

  let nextReleaseDate = null
  let nextReleaseAmount = 0

  if (nextPending) {
    const commissionDate = new Date(nextPending.createdAt)
    const holdDays = holdPeriods[nextPending.type as keyof typeof holdPeriods] || holdPeriods.mlm_recruitment
    nextReleaseDate = new Date(commissionDate.getTime() + holdDays * 24 * 60 * 60 * 1000)
    nextReleaseAmount = nextPending.amount
  }

  return {
    availableAmount,
    pendingAmount,
    totalEarned,
    nextReleaseDate,
    nextReleaseAmount,
  }
}

// Mock data for development
export const mockPayoutMethods: PayoutMethod[] = [
  {
    id: "pm_001",
    userId: "user_123",
    type: "bank_account",
    status: "verified",
    isDefault: true,
    details: {
      bankName: "Chase Bank",
      accountType: "checking",
      routingNumber: "021000021",
      accountNumber: "encrypted_account_number",
      accountHolderName: "John Doe",
      lastFourDigits: "1234",
    } as BankAccountDetails,
    fees: payoutMethods.bank_account.fees,
    processingTime: payoutMethods.bank_account.processingTime,
    minimumAmount: payoutMethods.bank_account.minimumAmount,
    createdAt: new Date("2024-01-01"),
    verifiedAt: new Date("2024-01-02"),
  },
  {
    id: "pm_002",
    userId: "user_123",
    type: "stripe_connect",
    status: "verified",
    isDefault: false,
    details: {
      stripeAccountId: "acct_1234567890",
      email: "john@example.com",
      country: "US",
      currency: "usd",
      businessType: "individual",
    } as StripeConnectDetails,
    fees: payoutMethods.stripe_connect.fees,
    processingTime: payoutMethods.stripe_connect.processingTime,
    minimumAmount: payoutMethods.stripe_connect.minimumAmount,
    createdAt: new Date("2024-01-05"),
    verifiedAt: new Date("2024-01-05"),
  },
]

export const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "payout_001",
    userId: "user_123",
    amount: 125000, // $1,250.00
    method: mockPayoutMethods[0],
    status: "completed",
    requestedAt: new Date("2024-01-15"),
    processedAt: new Date("2024-01-16"),
    completedAt: new Date("2024-01-18"),
    transactionId: "txn_1234567890",
    fees: {
      platformFee: 625, // $6.25 (0.5%)
      processingFee: 0, // Free ACH
      totalFees: 625,
      netAmount: 124375, // $1,243.75
    },
    metadata: {
      commissionIds: ["comm_001", "comm_002", "comm_003"],
      period: "2024-01",
      notes: "Monthly payout",
    },
  },
]
