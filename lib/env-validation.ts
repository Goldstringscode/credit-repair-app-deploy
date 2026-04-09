import { z } from 'zod'

// Environment variable validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database Configuration
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  NEON_DATABASE_URL: z.string().url('NEON_DATABASE_URL must be a valid URL').optional(),
  
  // Supabase Configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL').optional(),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required').optional(),
  
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Encryption Configuration
  ENCRYPTION_MASTER_KEY: z.string().min(32, 'ENCRYPTION_MASTER_KEY must be at least 32 characters'),
  
  // Email Configuration
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required').optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'STRIPE_PUBLISHABLE_KEY is required').optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required').optional(),

  // ShipEngine Configuration
  SHIPENGINE_API_KEY: z.string().min(1, 'SHIPENGINE_API_KEY is required').optional(),
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
  
  // Security Configuration
  ALLOWED_ORIGINS: z.string().optional(),
  BLOCKED_IPS: z.string().optional(),
  API_KEYS: z.string().optional(),
  
  // File Upload Configuration
  MAX_FILE_SIZE: z.string().regex(/^\d+$/, 'MAX_FILE_SIZE must be a number').optional(),
  
  // Analysis Configuration
  ANALYSIS_CONFIDENCE_THRESHOLD: z.string().regex(/^\d+(\.\d+)?$/, 'ANALYSIS_CONFIDENCE_THRESHOLD must be a number').optional(),
  MAX_ACCOUNTS_PER_REPORT: z.string().regex(/^\d+$/, 'MAX_ACCOUNTS_PER_REPORT must be a number').optional(),
  MAX_NEGATIVE_ITEMS_PER_REPORT: z.string().regex(/^\d+$/, 'MAX_NEGATIVE_ITEMS_PER_REPORT must be a number').optional(),
  
  // Logging Configuration
  AUDIT_LOGGING_ENABLED: z.enum(['true', 'false']).optional(),
  LOGGING_SERVICE_URL: z.string().url('LOGGING_SERVICE_URL must be a valid URL').optional(),
  LOGGING_SERVICE_TOKEN: z.string().min(1, 'LOGGING_SERVICE_TOKEN is required').optional(),
  
  // Monitoring Configuration
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
  
  // Rate Limiting Configuration
  RATE_LIMIT_REDIS_URL: z.string().url('RATE_LIMIT_REDIS_URL must be a valid URL').optional(),
  
  // CORS Configuration
  CORS_ORIGINS: z.string().optional(),
  
  // Feature Flags
  ENABLE_AI_ANALYSIS: z.enum(['true', 'false']).optional(),
  ENABLE_SUPERIOR_PARSER: z.enum(['true', 'false']).optional(),
  ENABLE_NOTIFICATIONS: z.enum(['true', 'false']).optional(),
  ENABLE_AUDIT_LOGGING: z.enum(['true', 'false']).optional(),
})

// Type for validated environment variables
export type EnvConfig = z.infer<typeof envSchema>

// Environment validation class
class EnvironmentValidator {
  private config: EnvConfig | null = null
  private errors: string[] = []

  constructor() {
    this.validate()
  }

  /**
   * Validate all environment variables
   */
  private validate(): void {
    try {
      this.config = envSchema.parse(process.env)
      console.log('✅ Environment variables validated successfully')
    } catch (error) {
      if (error instanceof z.ZodError) {
        this.errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        console.error('❌ Environment validation failed:')
        this.errors.forEach(err => console.error(`  - ${err}`))
      } else {
        this.errors = ['Unknown validation error']
        console.error('❌ Environment validation failed:', error)
      }
    }
  }

  /**
   * Get validated configuration
   */
  getConfig(): EnvConfig {
    if (!this.config) {
      throw new Error('Environment validation failed. Check the errors above.')
    }
    return this.config
  }

  /**
   * Check if validation passed
   */
  isValid(): boolean {
    return this.errors.length === 0
  }

  /**
   * Get validation errors
   */
  getErrors(): string[] {
    return this.errors
  }

  /**
   * Get specific environment variable
   */
  get(key: keyof EnvConfig): string | undefined {
    return this.config?.[key]
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return this.config?.NODE_ENV === 'production'
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return this.config?.NODE_ENV === 'development'
  }

  /**
   * Check if running in test
   */
  isTest(): boolean {
    return this.config?.NODE_ENV === 'test'
  }

  /**
   * Get database URL
   */
  getDatabaseURL(): string {
    return this.config?.DATABASE_URL || this.config?.NEON_DATABASE_URL || ''
  }

  /**
   * Get allowed origins for CORS
   */
  getAllowedOrigins(): string[] {
    const origins = this.config?.ALLOWED_ORIGINS || this.config?.CORS_ORIGINS
    if (origins) {
      return origins.split(',').map(origin => origin.trim())
    }
    
    if (this.isDevelopment()) {
      return ['http://localhost:3000', 'http://127.0.0.1:3000']
    }
    
    return [this.config?.NEXT_PUBLIC_APP_URL || '']
  }

  /**
   * Get blocked IPs
   */
  getBlockedIPs(): string[] {
    return this.config?.BLOCKED_IPS?.split(',').map(ip => ip.trim()) || []
  }

  /**
   * Get API keys
   */
  getAPIKeys(): string[] {
    return this.config?.API_KEYS?.split(',').map(key => key.trim()) || []
  }

  /**
   * Get max file size in bytes
   */
  getMaxFileSize(): number {
    const maxSize = this.config?.MAX_FILE_SIZE
    return maxSize ? parseInt(maxSize) : 10 * 1024 * 1024 // 10MB default
  }

  /**
   * Get analysis confidence threshold
   */
  getAnalysisConfidenceThreshold(): number {
    const threshold = this.config?.ANALYSIS_CONFIDENCE_THRESHOLD
    return threshold ? parseFloat(threshold) : 0.7
  }

  /**
   * Get max accounts per report
   */
  getMaxAccountsPerReport(): number {
    const maxAccounts = this.config?.MAX_ACCOUNTS_PER_REPORT
    return maxAccounts ? parseInt(maxAccounts) : 20
  }

  /**
   * Get max negative items per report
   */
  getMaxNegativeItemsPerReport(): number {
    const maxItems = this.config?.MAX_NEGATIVE_ITEMS_PER_REPORT
    return maxItems ? parseInt(maxItems) : 10
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature: 'ai_analysis' | 'superior_parser' | 'notifications' | 'audit_logging'): boolean {
    const featureMap = {
      ai_analysis: 'ENABLE_AI_ANALYSIS',
      superior_parser: 'ENABLE_SUPERIOR_PARSER',
      notifications: 'ENABLE_NOTIFICATIONS',
      audit_logging: 'ENABLE_AUDIT_LOGGING'
    } as const

    const envVar = featureMap[feature]
    return this.config?.[envVar] === 'true'
  }

  /**
   * Get security configuration
   */
  getSecurityConfig(): {
    jwtSecret: string
    encryptionKey: string
    allowedOrigins: string[]
    blockedIPs: string[]
    apiKeys: string[]
  } {
    return {
      jwtSecret: this.config?.JWT_SECRET || '',
      encryptionKey: this.config?.ENCRYPTION_MASTER_KEY || '',
      allowedOrigins: this.getAllowedOrigins(),
      blockedIPs: this.getBlockedIPs(),
      apiKeys: this.getAPIKeys()
    }
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): {
    url: string
    isNeon: boolean
  } {
    return {
      url: this.getDatabaseURL(),
      isNeon: !!this.config?.NEON_DATABASE_URL
    }
  }

  /**
   * Get email configuration
   */
  getEmailConfig(): {
    resendApiKey?: string
    isEnabled: boolean
  } {
    return {
      resendApiKey: this.config?.RESEND_API_KEY,
      isEnabled: !!this.config?.RESEND_API_KEY
    }
  }

  /**
   * Get Stripe configuration
   */
  getStripeConfig(): {
    secretKey?: string
    publishableKey?: string
    webhookSecret?: string
    isEnabled: boolean
  } {
    return {
      secretKey: this.config?.STRIPE_SECRET_KEY,
      publishableKey: this.config?.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: this.config?.STRIPE_WEBHOOK_SECRET,
      isEnabled: !!(this.config?.STRIPE_SECRET_KEY && this.config?.STRIPE_PUBLISHABLE_KEY)
    }
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig(): {
    sentryDsn?: string
    loggingServiceUrl?: string
    loggingServiceToken?: string
    isEnabled: boolean
  } {
    return {
      sentryDsn: this.config?.SENTRY_DSN,
      loggingServiceUrl: this.config?.LOGGING_SERVICE_URL,
      loggingServiceToken: this.config?.LOGGING_SERVICE_TOKEN,
      isEnabled: !!(this.config?.SENTRY_DSN || this.config?.LOGGING_SERVICE_URL)
    }
  }

  /**
   * Validate specific environment variable
   */
  validateVariable(key: string, value: string, schema: z.ZodSchema): { valid: boolean; error?: string } {
    try {
      schema.parse(value)
      return { valid: true }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0].message }
      }
      return { valid: false, error: 'Validation failed' }
    }
  }

  /**
   * Generate environment template
   */
  generateTemplate(): string {
    const template = `
# Environment Configuration Template
# Copy this file to .env.local and fill in your values

# Node Environment
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@hostname:port/database
NEON_DATABASE_URL=postgresql://username:password@hostname:port/database

# Supabase Configuration (Optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-at-least-32-characters-long

# Encryption Configuration
ENCRYPTION_MASTER_KEY=your-encryption-master-key-at-least-32-characters

# Email Configuration (Optional)
RESEND_API_KEY=re_your-resend-api-key

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Configuration (Optional)
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
BLOCKED_IPS=192.168.1.100,10.0.0.50
API_KEYS=your-api-key-1,your-api-key-2

# File Upload Configuration (Optional)
MAX_FILE_SIZE=10485760
ANALYSIS_CONFIDENCE_THRESHOLD=0.7
MAX_ACCOUNTS_PER_REPORT=20
MAX_NEGATIVE_ITEMS_PER_REPORT=10

# Logging Configuration (Optional)
AUDIT_LOGGING_ENABLED=true
LOGGING_SERVICE_URL=https://your-logging-service.com/api/logs
LOGGING_SERVICE_TOKEN=your-logging-token

# Monitoring Configuration (Optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Rate Limiting Configuration (Optional)
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# Feature Flags (Optional)
ENABLE_AI_ANALYSIS=true
ENABLE_SUPERIOR_PARSER=true
ENABLE_NOTIFICATIONS=true
ENABLE_AUDIT_LOGGING=true
`.trim()

    return template
  }
}

// Create singleton instance with lazy initialization
let _envValidator: EnvironmentValidator | null = null

function getEnvValidator(): EnvironmentValidator {
  if (!_envValidator) {
    _envValidator = new EnvironmentValidator()
  }
  return _envValidator
}

// Export convenience functions
export function getEnvConfig(): EnvConfig {
  return getEnvValidator().getConfig()
}

export function isProduction(): boolean {
  return getEnvValidator().isProduction()
}

export function isDevelopment(): boolean {
  return getEnvValidator().isDevelopment()
}

export function isTest(): boolean {
  return getEnvValidator().isTest()
}

export function isFeatureEnabled(feature: 'ai_analysis' | 'superior_parser' | 'notifications' | 'audit_logging'): boolean {
  return getEnvValidator().isFeatureEnabled(feature)
}

// Export the validator instance getter
export const envValidator = {
  get instance() {
    return getEnvValidator()
  }
}

// Export the validator instance getter as default
export default envValidator

/**
 * Validates the eight environment variables that are critical for production.
 * Call this function during app startup (e.g. from instrumentation.ts) so that
 * missing configuration fails loudly with a clear message rather than causing
 * cryptic runtime errors later.
 *
 * @throws {Error} with a descriptive message listing every missing variable.
 */
export function validateRequiredEnvVars(): void {
  const required: { key: string; description: string }[] = [
    { key: 'JWT_SECRET', description: 'Secret used to sign and verify JWT tokens' },
    { key: 'SUPABASE_URL', description: 'Supabase project URL (e.g. https://<project>.supabase.co)' },
    { key: 'SUPABASE_ANON_KEY', description: 'Supabase anonymous/public API key' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service-role key (server-side only)' },
    { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret API key (sk_live_... or sk_test_...)' },
    { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret (whsec_...)' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key exposed to the browser' },
    { key: 'SHIPENGINE_API_KEY', description: 'ShipEngine API key for certified-mail shipments' },
  ]

  const missing = required.filter(({ key }) => !process.env[key])

  if (missing.length > 0) {
    const lines = missing
      .map(({ key, description }) => `  • ${key} — ${description}`)
      .join('\n')
    throw new Error(
      `Missing required environment variables. Set the following before starting the app:\n\n${lines}\n`
    )
  }
}

