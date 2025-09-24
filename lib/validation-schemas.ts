import { z } from 'zod'

// Common validation patterns
const emailSchema = z.string().email('Invalid email format')
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')

const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .optional()

const ssnSchema = z.string()
  .regex(/^\d{4}$/, 'SSN last 4 digits must be exactly 4 numbers')
  .optional()

const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .optional()

// User registration validation
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: phoneSchema,
  dateOfBirth: dateSchema,
  ssnLastFour: ssnSchema,
  addressLine1: z.string().max(255, 'Address too long').optional(),
  addressLine2: z.string().max(255, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  state: z.string().max(50, 'State name too long').optional(),
  zipCode: z.string().max(10, 'ZIP code too long').optional(),
})

// User login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Password reset validation
export const passwordResetSchema = z.object({
  email: emailSchema,
})

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Credit report upload validation
export const creditReportUploadSchema = z.object({
  file: z.instanceof(File, 'File is required'),
  bureau: z.enum(['experian', 'equifax', 'transunion'], {
    errorMap: () => ({ message: 'Bureau must be experian, equifax, or transunion' })
  }),
  reportDate: dateSchema,
})

// Dispute creation validation
export const disputeSchema = z.object({
  creditReportId: z.string().uuid('Invalid credit report ID'),
  disputeType: z.enum([
    'not_mine',
    'paid_in_full',
    'never_late',
    'duplicate',
    'incorrect_amount',
    'incorrect_date',
    'incorrect_status',
    'other'
  ], {
    errorMap: () => ({ message: 'Invalid dispute type' })
  }),
  accountName: z.string().min(1, 'Account name is required').max(255, 'Account name too long'),
  accountNumber: z.string().max(100, 'Account number too long').optional(),
  disputeReason: z.string().min(10, 'Dispute reason must be at least 10 characters').max(2000, 'Dispute reason too long'),
  bureau: z.enum(['experian', 'equifax', 'transunion'], {
    errorMap: () => ({ message: 'Bureau must be experian, equifax, or transunion' })
  }),
  additionalNotes: z.string().max(1000, 'Additional notes too long').optional(),
})

// Letter generation validation
export const letterGenerationSchema = z.object({
  disputeId: z.string().uuid('Invalid dispute ID'),
  letterType: z.enum([
    'initial_dispute',
    'follow_up',
    'fcra_complaint',
    'cease_desist',
    'goodwill',
    'verification'
  ], {
    errorMap: () => ({ message: 'Invalid letter type' })
  }),
  recipient: z.string().min(1, 'Recipient is required').max(255, 'Recipient name too long'),
  recipientAddress: z.string().min(10, 'Recipient address is required').max(500, 'Address too long'),
  customMessage: z.string().max(2000, 'Custom message too long').optional(),
})

// Subscription validation
export const subscriptionSchema = z.object({
  planId: z.enum(['basic', 'professional', 'premium'], {
    errorMap: () => ({ message: 'Invalid subscription plan' })
  }),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  billingAddress: z.object({
    line1: z.string().min(1, 'Address line 1 is required').max(255, 'Address too long'),
    line2: z.string().max(255, 'Address too long').optional(),
    city: z.string().min(1, 'City is required').max(100, 'City name too long'),
    state: z.string().min(1, 'State is required').max(50, 'State name too long'),
    zipCode: z.string().min(1, 'ZIP code is required').max(10, 'ZIP code too long'),
    country: z.string().min(1, 'Country is required').max(50, 'Country name too long'),
  }),
})

// Notification preferences validation
export const notificationPreferencesSchema = z.object({
  email: z.object({
    creditUpdates: z.boolean(),
    disputeStatus: z.boolean(),
    marketingEmails: z.boolean(),
    weeklyReports: z.boolean(),
    securityAlerts: z.boolean(),
  }),
  push: z.object({
    creditChanges: z.boolean(),
    disputeUpdates: z.boolean(),
    reminders: z.boolean(),
    promotions: z.boolean(),
  }),
  sms: z.object({
    criticalAlerts: z.boolean(),
    disputeStatus: z.boolean(),
    reminders: z.boolean(),
  }),
})

// User profile update validation
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: phoneSchema,
  dateOfBirth: dateSchema,
  addressLine1: z.string().max(255, 'Address too long').optional(),
  addressLine2: z.string().max(255, 'Address too long').optional(),
  city: z.string().max(100, 'City name too long').optional(),
  state: z.string().max(50, 'State name too long').optional(),
  zipCode: z.string().max(10, 'ZIP code too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  website: z.string().url('Invalid website URL').optional(),
  timezone: z.string().max(50, 'Timezone too long').optional(),
})

// API request validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

// Sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
}

// File validation
export function validateFile(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` }
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` }
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension must be one of: ${allowedExtensions.join(', ')}` }
    }
  }

  return { valid: true }
}

// Credit report file validation
export const creditReportFileSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => ['application/pdf', 'text/plain', 'text/csv'].includes(file.type),
    'File must be PDF, TXT, or CSV'
  ),
  bureau: z.enum(['experian', 'equifax', 'transunion']),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
})

