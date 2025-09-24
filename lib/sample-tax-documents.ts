export interface SampleTaxDocument {
  id: string
  type: "1099-NEC" | "1099-MISC" | "tax-summary" | "quarterly-report" | "deduction-summary"
  title: string
  description: string
  taxYear: number
  quarter?: number
  data: any
  generatedAt: Date
  downloadUrl?: string
}

// Generate sample 1099-NEC data
export function generateSample1099NEC(taxYear: number): SampleTaxDocument {
  const totalEarnings = Math.floor(Math.random() * 500000) + 100000 // $1,000 - $5,000

  return {
    id: `sample_1099nec_${taxYear}`,
    type: "1099-NEC",
    title: `Sample 1099-NEC for ${taxYear}`,
    description: "Sample 1099-NEC form showing nonemployee compensation",
    taxYear,
    data: {
      formType: "1099-NEC",
      taxYear,
      payer: {
        name: "Credit Repair AI LLC",
        address: "456 Business Ave, Suite 100",
        city: "Business City",
        state: "CA",
        zipCode: "90210",
        ein: "12-3456789",
        phoneNumber: "(555) 123-4567",
      },
      recipient: {
        name: "John Doe",
        address: "123 Main Street",
        city: "Anytown",
        state: "CA",
        zipCode: "12345",
        ssn: "123-45-6789",
        accountNumber: "MLM-USER-001",
      },
      compensation: {
        box1_nonemployeeCompensation: totalEarnings,
        box2_payerMadeDirect: 0,
        box4_federalIncomeTaxWithheld: 0,
        box5_stateIncomeTaxWithheld: 0,
        box6_statePayerNumber: "",
        box7_stateIncome: totalEarnings,
      },
      breakdown: [
        {
          description: "Credit Repair Sales Commissions",
          amount: Math.floor(totalEarnings * 0.46),
          percentage: 46,
        },
        {
          description: "MLM Recruitment Bonuses",
          amount: Math.floor(totalEarnings * 0.37),
          percentage: 37,
        },
        {
          description: "Training Course Commissions",
          amount: Math.floor(totalEarnings * 0.12),
          percentage: 12,
        },
        {
          description: "Certified Mail Service Fees",
          amount: Math.floor(totalEarnings * 0.05),
          percentage: 5,
        },
      ],
      instructions: [
        "Report this income on Schedule C (Form 1040) if you're self-employed",
        "You may be subject to self-employment tax on this income",
        "Keep records of business expenses to offset this income",
        "Consider making quarterly estimated tax payments",
      ],
    },
    generatedAt: new Date(),
  }
}

// Generate sample quarterly report
export function generateSampleQuarterlyReport(taxYear: number, quarter: number): SampleTaxDocument {
  const baseEarnings = Math.floor(Math.random() * 150000) + 50000 // $500 - $1,500 per quarter
  const fees = Math.floor(baseEarnings * 0.05) // 5% fees
  const netEarnings = baseEarnings - fees

  return {
    id: `sample_quarterly_${taxYear}_q${quarter}`,
    type: "quarterly-report",
    title: `Q${quarter} ${taxYear} Quarterly Tax Report`,
    description: `Quarterly earnings and tax summary for Q${quarter} ${taxYear}`,
    taxYear,
    quarter,
    data: {
      period: {
        quarter,
        year: taxYear,
        startDate: new Date(taxYear, (quarter - 1) * 3, 1),
        endDate: new Date(taxYear, quarter * 3, 0),
      },
      earnings: {
        grossEarnings: baseEarnings,
        fees: fees,
        netEarnings: netEarnings,
      },
      breakdown: {
        creditRepairSales: Math.floor(baseEarnings * 0.46),
        mlmRecruitment: Math.floor(baseEarnings * 0.37),
        trainingCourses: Math.floor(baseEarnings * 0.12),
        certifiedMail: Math.floor(baseEarnings * 0.05),
      },
      payouts: [
        {
          date: new Date(taxYear, (quarter - 1) * 3 + 1, 15),
          amount: Math.floor(netEarnings * 0.6),
          method: "Bank Transfer",
          status: "Completed",
        },
        {
          date: new Date(taxYear, quarter * 3 - 1, 15),
          amount: Math.floor(netEarnings * 0.4),
          method: "Bank Transfer",
          status: "Completed",
        },
      ],
      estimatedTax: {
        incomeTax: Math.floor(netEarnings * 0.25),
        selfEmploymentTax: Math.floor(netEarnings * 0.1413),
        totalTax: Math.floor(netEarnings * 0.3913),
        quarterlyPayment: Math.floor((netEarnings * 0.3913) / 4),
      },
      deductions: [
        {
          category: "Home Office",
          amount: Math.floor(netEarnings * 0.05),
          description: "Portion of home used for business",
        },
        {
          category: "Internet & Phone",
          amount: Math.floor(netEarnings * 0.02),
          description: "Business portion of utilities",
        },
        {
          category: "Marketing",
          amount: Math.floor(netEarnings * 0.03),
          description: "Advertising and promotional expenses",
        },
      ],
    },
    generatedAt: new Date(),
  }
}

// Generate sample tax summary
export function generateSampleTaxSummary(taxYear: number): SampleTaxDocument {
  const annualEarnings = Math.floor(Math.random() * 2000000) + 500000 // $5,000 - $20,000 annually
  const annualFees = Math.floor(annualEarnings * 0.05) // 5% fees
  const netEarnings = annualEarnings - annualFees

  return {
    id: `sample_tax_summary_${taxYear}`,
    type: "tax-summary",
    title: `${taxYear} Annual Tax Summary`,
    description: `Complete tax summary for ${taxYear} including earnings, deductions, and tax liability`,
    taxYear,
    data: {
      year: taxYear,
      earnings: {
        totalGrossEarnings: annualEarnings,
        totalFees: annualFees,
        netEarnings: netEarnings,
      },
      quarterlyBreakdown: [
        {
          quarter: 1,
          earnings: Math.floor(annualEarnings * 0.22),
          fees: Math.floor(annualFees * 0.22),
          netEarnings: Math.floor(netEarnings * 0.22),
        },
        {
          quarter: 2,
          earnings: Math.floor(annualEarnings * 0.28),
          fees: Math.floor(annualFees * 0.28),
          netEarnings: Math.floor(netEarnings * 0.28),
        },
        {
          quarter: 3,
          earnings: Math.floor(annualEarnings * 0.25),
          fees: Math.floor(annualFees * 0.25),
          netEarnings: Math.floor(netEarnings * 0.25),
        },
        {
          quarter: 4,
          earnings: Math.floor(annualEarnings * 0.25),
          fees: Math.floor(annualFees * 0.25),
          netEarnings: Math.floor(netEarnings * 0.25),
        },
      ],
      categoryBreakdown: [
        {
          category: "Credit Repair Sales",
          amount: Math.floor(annualEarnings * 0.46),
          percentage: 46,
        },
        {
          category: "MLM Recruitment",
          amount: Math.floor(annualEarnings * 0.37),
          percentage: 37,
        },
        {
          category: "Training Courses",
          amount: Math.floor(annualEarnings * 0.12),
          percentage: 12,
        },
        {
          category: "Certified Mail",
          amount: Math.floor(annualEarnings * 0.05),
          percentage: 5,
        },
      ],
      deductions: [
        {
          type: "Home Office",
          amount: Math.floor(netEarnings * 0.05),
          description: "Portion of home used exclusively for business",
        },
        {
          type: "Internet & Phone",
          amount: Math.floor(netEarnings * 0.02),
          description: "Business portion of internet and phone bills",
        },
        {
          type: "Marketing & Advertising",
          amount: Math.floor(netEarnings * 0.03),
          description: "Website, social media ads, business cards",
        },
        {
          type: "Training & Education",
          amount: Math.floor(netEarnings * 0.02),
          description: "Business-related courses and training materials",
        },
        {
          type: "Office Supplies",
          amount: Math.floor(netEarnings * 0.01),
          description: "Printer, paper, software subscriptions",
        },
      ],
      taxCalculation: {
        taxableIncome: netEarnings - Math.floor(netEarnings * 0.13), // After deductions
        incomeTax: Math.floor((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25),
        selfEmploymentTax: Math.floor(netEarnings * 0.1413),
        totalTaxLiability:
          Math.floor((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25) + Math.floor(netEarnings * 0.1413),
        quarterlyPayments: Math.floor(
          ((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25 + Math.floor(netEarnings * 0.1413)) / 4,
        ),
      },
      paymentSchedule: [
        {
          quarter: "Q1",
          dueDate: `April 15, ${taxYear + 1}`,
          amount: Math.floor(
            ((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25 + Math.floor(netEarnings * 0.1413)) / 4,
          ),
          status: "Due",
        },
        {
          quarter: "Q2",
          dueDate: `June 15, ${taxYear + 1}`,
          amount: Math.floor(
            ((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25 + Math.floor(netEarnings * 0.1413)) / 4,
          ),
          status: "Due",
        },
        {
          quarter: "Q3",
          dueDate: `September 15, ${taxYear + 1}`,
          amount: Math.floor(
            ((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25 + Math.floor(netEarnings * 0.1413)) / 4,
          ),
          status: "Due",
        },
        {
          quarter: "Q4",
          dueDate: `January 15, ${taxYear + 2}`,
          amount: Math.floor(
            ((netEarnings - Math.floor(netEarnings * 0.13)) * 0.25 + Math.floor(netEarnings * 0.1413)) / 4,
          ),
          status: "Due",
        },
      ],
    },
    generatedAt: new Date(),
  }
}

// Generate sample deduction summary
export function generateSampleDeductionSummary(taxYear: number): SampleTaxDocument {
  const totalDeductions = Math.floor(Math.random() * 50000) + 20000 // $200 - $500

  return {
    id: `sample_deductions_${taxYear}`,
    type: "deduction-summary",
    title: `${taxYear} Business Deduction Summary`,
    description: `Summary of all business deductions claimed for ${taxYear}`,
    taxYear,
    data: {
      year: taxYear,
      totalDeductions: totalDeductions,
      categories: [
        {
          category: "Home Office Expenses",
          totalAmount: Math.floor(totalDeductions * 0.35),
          items: [
            { description: "Home office space (300 sq ft)", amount: Math.floor(totalDeductions * 0.2) },
            { description: "Utilities (business portion)", amount: Math.floor(totalDeductions * 0.1) },
            { description: "Home insurance (business portion)", amount: Math.floor(totalDeductions * 0.05) },
          ],
        },
        {
          category: "Equipment & Technology",
          totalAmount: Math.floor(totalDeductions * 0.25),
          items: [
            { description: "Computer and laptop", amount: Math.floor(totalDeductions * 0.15) },
            { description: "Software subscriptions", amount: Math.floor(totalDeductions * 0.06) },
            { description: "Phone and internet", amount: Math.floor(totalDeductions * 0.04) },
          ],
        },
        {
          category: "Marketing & Advertising",
          totalAmount: Math.floor(totalDeductions * 0.2),
          items: [
            { description: "Website hosting and domain", amount: Math.floor(totalDeductions * 0.03) },
            { description: "Social media advertising", amount: Math.floor(totalDeductions * 0.08) },
            { description: "Business cards and materials", amount: Math.floor(totalDeductions * 0.05) },
            { description: "Lead generation tools", amount: Math.floor(totalDeductions * 0.04) },
          ],
        },
        {
          category: "Professional Development",
          totalAmount: Math.floor(totalDeductions * 0.15),
          items: [
            { description: "Business courses and training", amount: Math.floor(totalDeductions * 0.08) },
            { description: "Conference attendance", amount: Math.floor(totalDeductions * 0.04) },
            { description: "Professional books and materials", amount: Math.floor(totalDeductions * 0.03) },
          ],
        },
        {
          category: "Other Business Expenses",
          totalAmount: Math.floor(totalDeductions * 0.05),
          items: [
            { description: "Office supplies", amount: Math.floor(totalDeductions * 0.02) },
            { description: "Bank fees", amount: Math.floor(totalDeductions * 0.01) },
            { description: "Professional services", amount: Math.floor(totalDeductions * 0.02) },
          ],
        },
      ],
      taxSavings: {
        incomeTaxSavings: Math.floor(totalDeductions * 0.25),
        selfEmploymentTaxSavings: Math.floor(totalDeductions * 0.1413),
        totalSavings: Math.floor(totalDeductions * 0.3913),
      },
      documentation: {
        receiptsRequired: true,
        recordKeepingPeriod: "7 years",
        auditRisk: "Low",
        recommendations: [
          "Keep all receipts and invoices organized by category",
          "Take photos of receipts immediately to prevent fading",
          "Use accounting software to track expenses throughout the year",
          "Separate business and personal expenses clearly",
          "Consult with a tax professional for complex deductions",
        ],
      },
    },
    generatedAt: new Date(),
  }
}

// Mock sample documents
export const mockSampleDocuments: SampleTaxDocument[] = [
  generateSample1099NEC(2024),
  generateSampleQuarterlyReport(2024, 1),
  generateSampleQuarterlyReport(2024, 2),
  generateSampleTaxSummary(2024),
  generateSampleDeductionSummary(2024),
]
