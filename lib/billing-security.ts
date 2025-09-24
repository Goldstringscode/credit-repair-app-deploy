import { auditLogger } from './audit-logger'

export interface SecurityConfig {
  maxPaymentAttempts: number
  lockoutDuration: number // in minutes
  suspiciousActivityThreshold: number
  requireStrongPasswords: boolean
  enableTwoFactor: boolean
  pciCompliant: boolean
}

export interface SecurityEvent {
  userId: string
  eventType: 'payment_failed' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metadata: Record<string, any>
  timestamp: string
}

export class BillingSecurityService {
  private config: SecurityConfig
  private failedAttempts: Map<string, { count: number; lastAttempt: Date; locked: boolean }> = new Map()
  private suspiciousActivities: SecurityEvent[] = []

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      maxPaymentAttempts: 5,
      lockoutDuration: 30,
      suspiciousActivityThreshold: 3,
      requireStrongPasswords: true,
      enableTwoFactor: false,
      pciCompliant: true,
      ...config
    }
  }

  /**
   * Validate payment data for security
   */
  validatePaymentData(paymentData: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate amount
    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid payment amount')
    }

    if (paymentData.amount > 100000) { // $1000 max
      errors.push('Payment amount exceeds maximum limit')
    }

    // Validate card data
    if (paymentData.cardData) {
      const cardErrors = this.validateCardData(paymentData.cardData)
      errors.push(...cardErrors)
    }

    // Validate metadata
    if (paymentData.metadata) {
      const metadataErrors = this.validateMetadata(paymentData.metadata)
      errors.push(...metadataErrors)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate card data
   */
  private validateCardData(cardData: any): string[] {
    const errors: string[] = []

    // Basic card number validation
    if (!cardData.number || typeof cardData.number !== 'string') {
      errors.push('Invalid card number')
    } else {
      const cleanNumber = cardData.number.replace(/\s/g, '')
      if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        errors.push('Invalid card number length')
      }

      // Luhn algorithm validation
      if (!this.validateLuhn(cleanNumber)) {
        errors.push('Invalid card number format')
      }
    }

    // Expiry validation
    if (!cardData.exp_month || !cardData.exp_year) {
      errors.push('Invalid expiry date')
    } else {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      if (cardData.exp_year < currentYear || 
          (cardData.exp_year === currentYear && cardData.exp_month < currentMonth)) {
        errors.push('Card has expired')
      }
    }

    // CVC validation
    if (!cardData.cvc || !/^\d{3,4}$/.test(cardData.cvc)) {
      errors.push('Invalid CVC')
    }

    return errors
  }

  /**
   * Validate metadata for security
   */
  private validateMetadata(metadata: any): string[] {
    const errors: string[] = []

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /<script/i,
      /onload/i,
      /onerror/i,
      /eval/i,
      /function/i
    ]

    const metadataString = JSON.stringify(metadata)
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(metadataString)) {
        errors.push('Suspicious content detected in metadata')
        break
      }
    }

    // Check metadata size
    if (metadataString.length > 1000) {
      errors.push('Metadata too large')
    }

    return errors
  }

  /**
   * Luhn algorithm validation
   */
  private validateLuhn(cardNumber: string): boolean {
    let sum = 0
    let isEven = false

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i])

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * Check for suspicious activity
   */
  checkSuspiciousActivity(userId: string, activity: string, metadata: any): boolean {
    const now = new Date()
    const recentActivities = this.suspiciousActivities.filter(
      event => event.userId === userId && 
      (now.getTime() - new Date(event.timestamp).getTime()) < 3600000 // Last hour
    )

    // Check for rapid successive activities
    if (recentActivities.length >= this.config.suspiciousActivityThreshold) {
      this.recordSecurityEvent({
        userId,
        eventType: 'suspicious_activity',
        severity: 'high',
        description: `Multiple suspicious activities detected: ${activity}`,
        metadata: { activity, count: recentActivities.length, ...metadata },
        timestamp: now.toISOString()
      })
      return true
    }

    // Check for unusual patterns
    if (this.isUnusualPattern(activity, metadata)) {
      this.recordSecurityEvent({
        userId,
        eventType: 'suspicious_activity',
        severity: 'medium',
        description: `Unusual pattern detected: ${activity}`,
        metadata: { activity, ...metadata },
        timestamp: now.toISOString()
      })
      return true
    }

    return false
  }

  /**
   * Check for unusual patterns
   */
  private isUnusualPattern(activity: string, metadata: any): boolean {
    // Check for rapid payment attempts
    if (activity === 'payment_attempt') {
      const recentAttempts = this.suspiciousActivities.filter(
        event => event.metadata.activity === 'payment_attempt' &&
        (Date.now() - new Date(event.timestamp).getTime()) < 300000 // Last 5 minutes
      )
      return recentAttempts.length >= 3
    }

    // Check for unusual amounts
    if (metadata.amount && (metadata.amount < 1 || metadata.amount > 50000)) {
      return true
    }

    // Check for unusual locations (if IP tracking is available)
    if (metadata.ipAddress && this.isUnusualLocation(metadata.ipAddress)) {
      return true
    }

    return false
  }

  /**
   * Check for unusual location (simplified)
   */
  private isUnusualLocation(ipAddress: string): boolean {
    // This is a simplified check - in production, use a proper geolocation service
    // For now, just check for known VPN/proxy patterns
    const suspiciousPatterns = [
      /^10\./, // Private IP
      /^192\.168\./, // Private IP
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private IP
    ]

    return suspiciousPatterns.some(pattern => pattern.test(ipAddress))
  }

  /**
   * Record security event
   */
  recordSecurityEvent(event: SecurityEvent): void {
    this.suspiciousActivities.push(event)

    // Log to audit system
    try {
      auditLogger.log({
        userId: event.userId,
        ipAddress: event.metadata.ipAddress || 'unknown',
        userAgent: event.metadata.userAgent || 'unknown',
        action: `security_${event.eventType}`,
        resource: 'billing_security',
        method: 'POST',
        endpoint: '/api/billing/security',
        statusCode: 200,
        severity: event.severity,
        category: 'security',
        metadata: event.metadata
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }

    // Clean up old events (keep last 1000)
    if (this.suspiciousActivities.length > 1000) {
      this.suspiciousActivities = this.suspiciousActivities.slice(-1000)
    }
  }

  /**
   * Check if user is locked out
   */
  isUserLockedOut(userId: string): boolean {
    const userAttempts = this.failedAttempts.get(userId)
    if (!userAttempts) return false

    if (userAttempts.locked) {
      const lockoutExpiry = new Date(userAttempts.lastAttempt.getTime() + this.config.lockoutDuration * 60000)
      if (new Date() < lockoutExpiry) {
        return true
      } else {
        // Unlock user
        userAttempts.locked = false
        userAttempts.count = 0
        this.failedAttempts.set(userId, userAttempts)
        return false
      }
    }

    return false
  }

  /**
   * Record failed payment attempt
   */
  recordFailedAttempt(userId: string): boolean {
    const now = new Date()
    const userAttempts = this.failedAttempts.get(userId) || { count: 0, lastAttempt: now, locked: false }

    userAttempts.count++
    userAttempts.lastAttempt = now

    if (userAttempts.count >= this.config.maxPaymentAttempts) {
      userAttempts.locked = true
      this.recordSecurityEvent({
        userId,
        eventType: 'payment_failed',
        severity: 'high',
        description: `User locked out after ${userAttempts.count} failed payment attempts`,
        metadata: { attempts: userAttempts.count },
        timestamp: now.toISOString()
      })
    }

    this.failedAttempts.set(userId, userAttempts)
    return userAttempts.locked
  }

  /**
   * Reset failed attempts for user
   */
  resetFailedAttempts(userId: string): void {
    this.failedAttempts.delete(userId)
  }

  /**
   * Get security summary
   */
  getSecuritySummary(): {
    totalEvents: number
    recentEvents: SecurityEvent[]
    lockedUsers: number
    highSeverityEvents: number
  } {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3600000)

    const recentEvents = this.suspiciousActivities.filter(
      event => new Date(event.timestamp) > oneHourAgo
    )

    const lockedUsers = Array.from(this.failedAttempts.values()).filter(
      attempts => attempts.locked
    ).length

    const highSeverityEvents = this.suspiciousActivities.filter(
      event => event.severity === 'high' || event.severity === 'critical'
    ).length

    return {
      totalEvents: this.suspiciousActivities.length,
      recentEvents,
      lockedUsers,
      highSeverityEvents
    }
  }

  /**
   * PCI Compliance checks
   */
  validatePCICompliance(): { compliant: boolean; issues: string[] } {
    const issues: string[] = []

    if (!this.config.pciCompliant) {
      issues.push('PCI compliance not enabled')
    }

    // Check for proper data handling
    if (this.suspiciousActivities.some(event => 
      event.metadata.cardData || 
      event.metadata.cvv || 
      event.metadata.cvc
    )) {
      issues.push('Sensitive card data detected in logs')
    }

    // Check for proper encryption (simplified)
    if (!process.env.ENCRYPTION_KEY) {
      issues.push('Encryption key not configured')
    }

    return {
      compliant: issues.length === 0,
      issues
    }
  }
}

// Export singleton instance
export const billingSecurityService = new BillingSecurityService()
