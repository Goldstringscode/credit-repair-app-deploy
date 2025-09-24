export interface TaxDocument {
  id: string
  userId: string
  type: "1099-NEC" | "1099-MISC" | "tax-summary" | "quarterly-report"
  taxYear: number
  quarter?: number
  status: "draft" | "generated" | "sent" | "filed"
  totalEarnings: number
  totalFees: number
  netEarnings: number
  generatedAt: Date
  sentAt?: Date
  downloadUrl?: string
  metadata: {
    recipientInfo: {
      name: string
      address: string
      taxId: string // SSN or EIN
      businessName?: string
    }
    payerInfo: {
      name: string
      address: string
      ein: string
      contactInfo: string
    }
    breakdown: Array<{
      category: string
      amount: number
      description: string
    }>
  }
}

export interface TaxSummary {
  userId: string
  taxYear: number
  totalEarnings: number
  totalFees: number
  netEarnings: number
  quarterlyBreakdown: Array<{
    quarter: number
    earnings: number
    fees: number
    netEarnings: number
    payouts: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
  monthlyBreakdown: Array<{
    month: string
    earnings: number
    fees: number
    netEarnings: number
  }>
  deductions: Array<{
    type: string
    amount: number
    description: string
  }>
  estimatedTaxLiability: number
  recommendedQuarterlyPayments: number
}

export interface TaxSettings {
  userId: string
  businessType: "individual" | "sole_proprietorship" | "llc" | "corporation"
  taxId: string
  businessName?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  autoGenerate1099: boolean
  quarterlyReports: boolean
  emailNotifications: boolean
  taxProfessionalEmail?: string
  estimatedTaxRate: number // percentage
  deductionCategories: string[]
}

// Tax thresholds and requirements
export const taxThresholds = {
  form1099Required: 60000, // $600.00 - IRS requirement for 1099-NEC
  quarterlyPaymentThreshold: 100000, // $1,000.00 - estimated tax payment threshold
  businessDeductionMinimum: 0, // No minimum for business deductions
}

// Generate 1099-NEC form data
export function generate1099NEC(
  userId: string,
  taxYear: number,
  earnings: number,
  recipientInfo: any,
  payerInfo: any,
): TaxDocument {
  return {
    id: `1099nec_${userId}_${taxYear}`,
    userId,
    type: "1099-NEC",
    taxYear,
    status: "generated",
    totalEarnings: earnings,
    totalFees: 0, // 1099-NEC reports gross earnings
    netEarnings: earnings,
    generatedAt: new Date(),
    metadata: {
      recipientInfo,
      payerInfo,
      breakdown: [
        {
          category: "Nonemployee Compensation",
          amount: earnings,
          description: "MLM commissions and bonuses",
        },
      ],
    },
  }
}

// Calculate estimated tax liability
export function calculateEstimatedTax(
  netEarnings: number,
  taxRate = 0.25, // 25% default rate
  selfEmploymentTaxRate = 0.1413, // 14.13% SE tax rate
): {
  incomeTax: number
  selfEmploymentTax: number
  totalTax: number
  quarterlyPayment: number
} {
  const incomeTax = Math.round(netEarnings * taxRate)
  const selfEmploymentTax = Math.round(netEarnings * selfEmploymentTaxRate)
  const totalTax = incomeTax + selfEmploymentTax
  const quarterlyPayment = Math.round(totalTax / 4)

  return {
    incomeTax,
    selfEmploymentTax,
    totalTax,
    quarterlyPayment,
  }
}

// Generate comprehensive tax summary
export function generateTaxSummary(userId: string, taxYear: number, commissions: any[], payouts: any[]): TaxSummary {
  const yearCommissions = commissions.filter((c) => new Date(c.createdAt).getFullYear() === taxYear)
  const yearPayouts = payouts.filter((p) => new Date(p.createdAt).getFullYear() === taxYear)

  const totalEarnings = yearCommissions.reduce((sum, c) => sum + c.amount, 0)
  const totalFees = yearPayouts.reduce((sum, p) => sum + p.fees.totalFees, 0)
  const netEarnings = totalEarnings - totalFees

  // Quarterly breakdown
  const quarterlyBreakdown = [1, 2, 3, 4].map((quarter) => {
    const quarterStart = new Date(taxYear, (quarter - 1) * 3, 1)
    const quarterEnd = new Date(taxYear, quarter * 3, 0)

    const quarterCommissions = yearCommissions.filter((c) => {
      const date = new Date(c.createdAt)
      return date >= quarterStart && date <= quarterEnd
    })

    const quarterPayouts = yearPayouts.filter((p) => {
      const date = new Date(p.createdAt)
      return date >= quarterStart && date <= quarterEnd
    })

    const earnings = quarterCommissions.reduce((sum, c) => sum + c.amount, 0)
    const fees = quarterPayouts.reduce((sum, p) => sum + p.fees.totalFees, 0)

    return {
      quarter,
      earnings,
      fees,
      netEarnings: earnings - fees,
      payouts: quarterPayouts.length,
    }
  })

  // Category breakdown
  const categoryBreakdown = [
    { category: "Credit Repair Sales", amount: Math.round(totalEarnings * 0.46), percentage: 46 },
    { category: "MLM Recruitment", amount: Math.round(totalEarnings * 0.37), percentage: 37 },
    { category: "Training Courses", amount: Math.round(totalEarnings * 0.12), percentage: 12 },
    { category: "Certified Mail", amount: Math.round(totalEarnings * 0.05), percentage: 5 },
  ]

  // Monthly breakdown
  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(taxYear, i, 1)
    const monthCommissions = yearCommissions.filter((c) => {
      const date = new Date(c.createdAt)
      return date.getMonth() === i && date.getFullYear() === taxYear
    })

    const monthPayouts = yearPayouts.filter((p) => {
      const date = new Date(p.createdAt)
      return date.getMonth() === i && date.getFullYear() === taxYear
    })

    const earnings = monthCommissions.reduce((sum, c) => sum + c.amount, 0)
    const fees = monthPayouts.reduce((sum, p) => sum + p.fees.totalFees, 0)

    return {
      month: month.toLocaleDateString("en-US", { month: "short" }),
      earnings,
      fees,
      netEarnings: earnings - fees,
    }
  })

  // Common business deductions for MLM
  const deductions = [
    {
      type: "Home Office",
      amount: Math.round(netEarnings * 0.05), // 5% estimate
      description: "Portion of home used exclusively for business",
    },
    {
      type: "Internet & Phone",
      amount: Math.round(netEarnings * 0.02), // 2% estimate
      description: "Business portion of internet and phone bills",
    },
    {
      type: "Marketing & Advertising",
      amount: Math.round(netEarnings * 0.03), // 3% estimate
      description: "Website, social media ads, business cards",
    },
    {
      type: "Training & Education",
      amount: Math.round(netEarnings * 0.02), // 2% estimate
      description: "Business-related courses and training materials",
    },
  ]

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
  const taxableIncome = Math.max(0, netEarnings - totalDeductions)
  const estimatedTax = calculateEstimatedTax(taxableIncome)

  return {
    userId,
    taxYear,
    totalEarnings,
    totalFees,
    netEarnings,
    quarterlyBreakdown,
    categoryBreakdown,
    monthlyBreakdown,
    deductions,
    estimatedTaxLiability: estimatedTax.totalTax,
    recommendedQuarterlyPayments: estimatedTax.quarterlyPayment,
  }
}

// Mock tax data
export const mockTaxDocuments: TaxDocument[] = [
  {
    id: "1099nec_user123_2024",
    userId: "user_123",
    type: "1099-NEC",
    taxYear: 2024,
    status: "generated",
    totalEarnings: 125000, // $1,250.00
    totalFees: 0,
    netEarnings: 125000,
    generatedAt: new Date("2024-01-31"),
    metadata: {
      recipientInfo: {
        name: "John Doe",
        address: "123 Main St, Anytown, ST 12345",
        taxId: "123-45-6789",
      },
      payerInfo: {
        name: "Credit Repair AI LLC",
        address: "456 Business Ave, Suite 100, Business City, ST 54321",
        ein: "12-3456789",
        contactInfo: "tax@creditrepairai.com",
      },
      breakdown: [
        {
          category: "Nonemployee Compensation",
          amount: 125000,
          description: "MLM commissions and bonuses",
        },
      ],
    },
  },
]

export const mockTaxSettings: TaxSettings = {
  userId: "user_123",
  businessType: "individual",
  taxId: "123-45-6789",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "ST",
    zipCode: "12345",
    country: "US",
  },
  autoGenerate1099: true,
  quarterlyReports: true,
  emailNotifications: true,
  estimatedTaxRate: 25,
  deductionCategories: [
    "Home Office",
    "Internet & Phone",
    "Marketing & Advertising",
    "Training & Education",
    "Travel & Transportation",
    "Office Supplies",
  ],
}
