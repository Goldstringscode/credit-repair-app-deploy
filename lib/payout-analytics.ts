export interface PayoutAnalytics {
  totalPayouts: number
  totalFees: number
  totalCommissions: number
  averagePayoutAmount: number
  payoutsByMethod: Record<string, number>
  payoutsByStatus: Record<string, number>
  monthlyPayouts: Array<{
    month: string
    amount: number
    count: number
    fees: number
  }>
  topEarners: Array<{
    userId: string
    userName: string
    totalEarnings: number
    totalPayouts: number
    rank: string
  }>
  payoutTrends: Array<{
    date: string
    amount: number
    count: number
  }>
  commissionBreakdown: Array<{
    type: string
    amount: number
    percentage: number
  }>
}

export interface UserPayoutAnalytics {
  userId: string
  totalEarned: number
  totalPaidOut: number
  availableBalance: number
  pendingBalance: number
  totalFeesPaid: number
  averagePayoutAmount: number
  payoutFrequency: number // days between payouts
  preferredMethod: string
  monthlyEarnings: Array<{
    month: string
    commissions: number
    payouts: number
    fees: number
  }>
  commissionSources: Array<{
    type: string
    amount: number
    percentage: number
  }>
  payoutHistory: Array<{
    date: string
    amount: number
    method: string
    status: string
    fees: number
  }>
}

export interface AdminPayoutAnalytics {
  totalPlatformRevenue: number
  totalProcessingCosts: number
  netProfit: number
  profitMargin: number
  totalUsersWithPayouts: number
  averageUserEarnings: number
  payoutMethodDistribution: Record<string, { count: number; volume: number }>
  holdPeriodAnalysis: Array<{
    type: string
    averageHoldDays: number
    totalHeld: number
  }>
  chargeback: {
    total: number
    prevented: number
    savingsFromHolds: number
  }
  cashFlowAnalysis: Array<{
    date: string
    inflow: number // commissions earned
    outflow: number // payouts made
    netCashFlow: number
    cumulativeBalance: number
  }>
}

// Generate mock analytics data
export function generatePayoutAnalytics(): PayoutAnalytics {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return {
    totalPayouts: 2847500, // $28,475.00
    totalFees: 142375, // $1,423.75
    totalCommissions: 3250000, // $32,500.00
    averagePayoutAmount: 18750, // $187.50
    payoutsByMethod: {
      bank_account: 2100000, // $21,000.00
      stripe_connect: 547500, // $5,475.00
      paypal: 150000, // $1,500.00
      check: 50000, // $500.00
    },
    payoutsByStatus: {
      completed: 2500000, // $25,000.00
      processing: 247500, // $2,475.00
      pending: 100000, // $1,000.00
      failed: 0,
    },
    monthlyPayouts: months.map((month, index) => ({
      month,
      amount: Math.floor(Math.random() * 500000) + 200000, // $2,000-$7,000
      count: Math.floor(Math.random() * 50) + 20,
      fees: Math.floor(Math.random() * 25000) + 10000, // $100-$350
    })),
    topEarners: [
      {
        userId: "user_001",
        userName: "Sarah Johnson",
        totalEarnings: 125000, // $1,250.00
        totalPayouts: 115000, // $1,150.00
        rank: "Executive Director",
      },
      {
        userId: "user_002",
        userName: "Mike Chen",
        totalEarnings: 98000, // $980.00
        totalPayouts: 90000, // $900.00
        rank: "Director",
      },
      {
        userId: "user_003",
        userName: "Lisa Rodriguez",
        totalEarnings: 87500, // $875.00
        totalPayouts: 80000, // $800.00
        rank: "Manager",
      },
    ],
    payoutTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: Math.floor(Math.random() * 100000) + 50000, // $500-$1,500
      count: Math.floor(Math.random() * 20) + 5,
    })),
    commissionBreakdown: [
      { type: "Credit Repair Sales", amount: 1500000, percentage: 46.2 },
      { type: "MLM Recruitment", amount: 1200000, percentage: 36.9 },
      { type: "Training Courses", amount: 400000, percentage: 12.3 },
      { type: "Certified Mail", amount: 150000, percentage: 4.6 },
    ],
  }
}

export function generateUserPayoutAnalytics(userId: string): UserPayoutAnalytics {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return {
    userId,
    totalEarned: 125000, // $1,250.00
    totalPaidOut: 115000, // $1,150.00
    availableBalance: 7500, // $75.00
    pendingBalance: 2500, // $25.00
    totalFeesPaid: 5750, // $57.50
    averagePayoutAmount: 23000, // $230.00
    payoutFrequency: 14, // every 2 weeks
    preferredMethod: "bank_account",
    monthlyEarnings: months.slice(0, 6).map((month) => ({
      month,
      commissions: Math.floor(Math.random() * 30000) + 15000, // $150-$450
      payouts: Math.floor(Math.random() * 25000) + 12000, // $120-$370
      fees: Math.floor(Math.random() * 1250) + 600, // $6-$18
    })),
    commissionSources: [
      { type: "Credit Repair Sales", amount: 57500, percentage: 46.0 },
      { type: "MLM Recruitment", amount: 45000, percentage: 36.0 },
      { type: "Training Courses", amount: 15000, percentage: 12.0 },
      { type: "Certified Mail", amount: 7500, percentage: 6.0 },
    ],
    payoutHistory: Array.from({ length: 10 }, (_, i) => ({
      date: new Date(Date.now() - i * 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      amount: Math.floor(Math.random() * 40000) + 15000, // $150-$550
      method: i % 3 === 0 ? "stripe_connect" : "bank_account",
      status: i === 0 ? "processing" : "completed",
      fees: Math.floor(Math.random() * 2000) + 500, // $5-$25
    })),
  }
}

export function generateAdminPayoutAnalytics(): AdminPayoutAnalytics {
  return {
    totalPlatformRevenue: 142375, // $1,423.75 (0.5% of all payouts)
    totalProcessingCosts: 85425, // $854.25 (actual processing costs)
    netProfit: 56950, // $569.50
    profitMargin: 40.0, // 40% profit margin
    totalUsersWithPayouts: 1247,
    averageUserEarnings: 26080, // $260.80
    payoutMethodDistribution: {
      bank_account: { count: 892, volume: 2100000 },
      stripe_connect: { count: 234, volume: 547500 },
      paypal: { count: 98, volume: 150000 },
      check: { count: 23, volume: 50000 },
    },
    holdPeriodAnalysis: [
      { type: "Credit Repair Sales", averageHoldDays: 30, totalHeld: 450000 },
      { type: "MLM Recruitment", averageHoldDays: 3, totalHeld: 75000 },
      { type: "Training Courses", averageHoldDays: 14, totalHeld: 125000 },
      { type: "High Value Sales", averageHoldDays: 14, totalHeld: 200000 },
    ],
    chargeback: {
      total: 25000, // $250.00 in chargebacks
      prevented: 75000, // $750.00 prevented by holds
      savingsFromHolds: 50000, // $500.00 net savings
    },
    cashFlowAnalysis: Array.from({ length: 30 }, (_, i) => {
      const inflow = Math.floor(Math.random() * 150000) + 100000 // $1,000-$2,500
      const outflow = Math.floor(Math.random() * 120000) + 80000 // $800-$2,000
      return {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        inflow,
        outflow,
        netCashFlow: inflow - outflow,
        cumulativeBalance: Math.floor(Math.random() * 500000) + 200000, // $2,000-$7,000
      }
    }),
  }
}
