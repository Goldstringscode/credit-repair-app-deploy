export interface TaxReminder {
  id: string
  userId: string
  type: "quarterly_payment" | "annual_filing" | "document_preparation" | "deduction_tracking" | "1099_generation"
  title: string
  description: string
  dueDate: Date
  reminderDates: Date[]
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "sent" | "acknowledged" | "completed" | "overdue"
  metadata: {
    taxYear: number
    quarter?: number
    estimatedAmount?: number
    documentType?: string
    actionRequired?: string
    links?: Array<{
      text: string
      url: string
    }>
  }
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface TaxReminderSettings {
  userId: string
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  reminderSchedule: {
    quarterly: number[] // Days before due date
    annual: number[] // Days before due date
    documents: number[] // Days before due date
  }
  businessType: "individual" | "sole_proprietorship" | "llc" | "corporation"
  fiscalYearEnd: string // MM-DD format
  estimatedTaxRequired: boolean
  autoGenerateReminders: boolean
  timezone: string
}

// Tax calendar dates for 2024-2025
export const taxCalendar = {
  2024: {
    quarterlyDueDates: [
      { quarter: 1, dueDate: new Date("2024-04-15"), description: "Q1 2024 Estimated Tax Payment" },
      { quarter: 2, dueDate: new Date("2024-06-17"), description: "Q2 2024 Estimated Tax Payment" },
      { quarter: 3, dueDate: new Date("2024-09-16"), description: "Q3 2024 Estimated Tax Payment" },
      { quarter: 4, dueDate: new Date("2025-01-15"), description: "Q4 2024 Estimated Tax Payment" },
    ],
    annualDeadlines: [
      { type: "1099_deadline", date: new Date("2025-01-31"), description: "1099 Forms Due to Recipients" },
      { type: "w2_deadline", date: new Date("2025-01-31"), description: "W-2 Forms Due to Employees" },
      { type: "filing_deadline", date: new Date("2025-04-15"), description: "Individual Tax Return Filing Deadline" },
      { type: "extension_deadline", date: new Date("2025-10-15"), description: "Extended Filing Deadline" },
    ],
  },
  2025: {
    quarterlyDueDates: [
      { quarter: 1, dueDate: new Date("2025-04-15"), description: "Q1 2025 Estimated Tax Payment" },
      { quarter: 2, dueDate: new Date("2025-06-16"), description: "Q2 2025 Estimated Tax Payment" },
      { quarter: 3, dueDate: new Date("2025-09-15"), description: "Q3 2025 Estimated Tax Payment" },
      { quarter: 4, dueDate: new Date("2026-01-15"), description: "Q4 2025 Estimated Tax Payment" },
    ],
    annualDeadlines: [
      { type: "1099_deadline", date: new Date("2026-01-31"), description: "1099 Forms Due to Recipients" },
      { type: "w2_deadline", date: new Date("2026-01-31"), description: "W-2 Forms Due to Employees" },
      { type: "filing_deadline", date: new Date("2026-04-15"), description: "Individual Tax Return Filing Deadline" },
      { type: "extension_deadline", date: new Date("2026-10-15"), description: "Extended Filing Deadline" },
    ],
  },
}

// Generate reminders for a user based on their settings and tax situation
export function generateTaxReminders(
  userId: string,
  settings: TaxReminderSettings,
  taxYear: number,
  estimatedQuarterlyPayment?: number,
): TaxReminder[] {
  const reminders: TaxReminder[] = []
  const calendar = taxCalendar[taxYear as keyof typeof taxCalendar]

  if (!calendar) return reminders

  // Generate quarterly payment reminders
  if (settings.estimatedTaxRequired) {
    calendar.quarterlyDueDates.forEach((quarterly) => {
      const reminderDates = settings.reminderSchedule.quarterly.map(
        (days) => new Date(quarterly.dueDate.getTime() - days * 24 * 60 * 60 * 1000),
      )

      reminders.push({
        id: `quarterly_${userId}_${taxYear}_q${quarterly.quarter}`,
        userId,
        type: "quarterly_payment",
        title: `Q${quarterly.quarter} ${taxYear} Estimated Tax Payment Due`,
        description: `Your estimated tax payment for Q${quarterly.quarter} ${taxYear} is due on ${quarterly.dueDate.toLocaleDateString()}. ${estimatedQuarterlyPayment ? `Estimated amount: $${(estimatedQuarterlyPayment / 100).toFixed(2)}` : "Calculate your payment amount based on current earnings."}`,
        dueDate: quarterly.dueDate,
        reminderDates,
        priority: "high",
        status: "pending",
        metadata: {
          taxYear,
          quarter: quarterly.quarter,
          estimatedAmount: estimatedQuarterlyPayment,
          actionRequired: "Make estimated tax payment",
          links: [
            { text: "Calculate Payment", url: "/mlm/tax-reporting" },
            { text: "IRS Payment Portal", url: "https://www.irs.gov/payments" },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    })
  }

  // Generate annual filing reminders
  calendar.annualDeadlines.forEach((deadline) => {
    const reminderDates = settings.reminderSchedule.annual.map(
      (days) => new Date(deadline.date.getTime() - days * 24 * 60 * 60 * 1000),
    )

    let priority: "low" | "medium" | "high" | "critical" = "medium"
    let actionRequired = ""
    let links: Array<{ text: string; url: string }> = []

    switch (deadline.type) {
      case "1099_deadline":
        priority = "critical"
        actionRequired = "Generate and send 1099 forms to recipients"
        links = [
          { text: "Generate 1099s", url: "/mlm/tax-reporting" },
          { text: "IRS 1099 Instructions", url: "https://www.irs.gov/forms-pubs/about-form-1099-nec" },
        ]
        break
      case "filing_deadline":
        priority = "critical"
        actionRequired = "File your tax return or request an extension"
        links = [
          { text: "Tax Summary", url: "/mlm/tax-reporting" },
          { text: "File Extension", url: "https://www.irs.gov/forms-pubs/about-form-4868" },
        ]
        break
      case "extension_deadline":
        priority = "critical"
        actionRequired = "File your extended tax return"
        break
    }

    reminders.push({
      id: `annual_${userId}_${taxYear}_${deadline.type}`,
      userId,
      type: "annual_filing",
      title: deadline.description,
      description: `Important tax deadline approaching. ${actionRequired}`,
      dueDate: deadline.date,
      reminderDates,
      priority,
      status: "pending",
      metadata: {
        taxYear: deadline.type === "filing_deadline" ? taxYear : taxYear - 1,
        documentType: deadline.type,
        actionRequired,
        links,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  // Generate document preparation reminders
  const documentReminders = [
    {
      date: new Date(`${taxYear + 1}-01-01`),
      title: "Start Organizing Tax Documents",
      description: "Begin collecting receipts, 1099s, and other tax documents for the year.",
      priority: "medium" as const,
    },
    {
      date: new Date(`${taxYear + 1}-02-15`),
      title: "Review Business Deductions",
      description: "Review and categorize all business expenses and deductions for the tax year.",
      priority: "medium" as const,
    },
    {
      date: new Date(`${taxYear + 1}-03-01`),
      title: "Prepare for Tax Filing",
      description: "Gather all documents and consider consulting with a tax professional.",
      priority: "high" as const,
    },
  ]

  documentReminders.forEach((doc, index) => {
    const reminderDates = settings.reminderSchedule.documents.map(
      (days) => new Date(doc.date.getTime() - days * 24 * 60 * 60 * 1000),
    )

    reminders.push({
      id: `document_${userId}_${taxYear}_${index}`,
      userId,
      type: "document_preparation",
      title: doc.title,
      description: doc.description,
      dueDate: doc.date,
      reminderDates,
      priority: doc.priority,
      status: "pending",
      metadata: {
        taxYear,
        actionRequired: "Organize tax documents",
        links: [
          { text: "Tax Checklist", url: "/mlm/tax-reporting" },
          { text: "Deduction Tracker", url: "/mlm/tax-reporting" },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  return reminders.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

// Check which reminders should be sent today
export function getRemindersToSend(reminders: TaxReminder[]): TaxReminder[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return reminders.filter((reminder) => {
    if (reminder.status !== "pending") return false

    return reminder.reminderDates.some((reminderDate) => {
      const reminderDay = new Date(reminderDate)
      reminderDay.setHours(0, 0, 0, 0)
      return reminderDay.getTime() === today.getTime()
    })
  })
}

// Mark reminder as sent
export function markReminderSent(reminder: TaxReminder): TaxReminder {
  return {
    ...reminder,
    status: "sent",
    updatedAt: new Date(),
  }
}

// Mark reminder as completed
export function markReminderCompleted(reminder: TaxReminder): TaxReminder {
  return {
    ...reminder,
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  }
}

// Default reminder settings
export const defaultTaxReminderSettings: TaxReminderSettings = {
  userId: "",
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  reminderSchedule: {
    quarterly: [30, 14, 7, 1], // 30, 14, 7, and 1 days before
    annual: [60, 30, 14, 7, 1], // 60, 30, 14, 7, and 1 days before
    documents: [30, 14, 7], // 30, 14, and 7 days before
  },
  businessType: "individual",
  fiscalYearEnd: "12-31",
  estimatedTaxRequired: true,
  autoGenerateReminders: true,
  timezone: "America/New_York",
}

// Mock data for testing
export const mockTaxReminders: TaxReminder[] = [
  {
    id: "reminder_001",
    userId: "user_123",
    type: "quarterly_payment",
    title: "Q1 2024 Estimated Tax Payment Due",
    description: "Your estimated tax payment for Q1 2024 is due on April 15, 2024. Estimated amount: $312.50",
    dueDate: new Date("2024-04-15"),
    reminderDates: [
      new Date("2024-03-16"), // 30 days before
      new Date("2024-04-01"), // 14 days before
      new Date("2024-04-08"), // 7 days before
      new Date("2024-04-14"), // 1 day before
    ],
    priority: "high",
    status: "pending",
    metadata: {
      taxYear: 2024,
      quarter: 1,
      estimatedAmount: 31250, // $312.50 in cents
      actionRequired: "Make estimated tax payment",
      links: [
        { text: "Calculate Payment", url: "/mlm/tax-reporting" },
        { text: "IRS Payment Portal", url: "https://www.irs.gov/payments" },
      ],
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "reminder_002",
    userId: "user_123",
    type: "annual_filing",
    title: "1099 Forms Due to Recipients",
    description: "Important tax deadline approaching. Generate and send 1099 forms to recipients",
    dueDate: new Date("2025-01-31"),
    reminderDates: [
      new Date("2024-12-02"), // 60 days before
      new Date("2025-01-01"), // 30 days before
      new Date("2025-01-17"), // 14 days before
      new Date("2025-01-24"), // 7 days before
      new Date("2025-01-30"), // 1 day before
    ],
    priority: "critical",
    status: "pending",
    metadata: {
      taxYear: 2024,
      documentType: "1099_deadline",
      actionRequired: "Generate and send 1099 forms to recipients",
      links: [
        { text: "Generate 1099s", url: "/mlm/tax-reporting" },
        { text: "IRS 1099 Instructions", url: "https://www.irs.gov/forms-pubs/about-form-1099-nec" },
      ],
    },
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
  },
]
