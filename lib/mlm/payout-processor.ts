import { mlmDatabaseService } from './database-service'
import { MLMPayout, MLMCommission } from '@/lib/mlm-system'
import { sendPayoutProcessedEmail } from '@/lib/email-service'

export interface PayoutMethod {
  id: string
  type: 'bank_account' | 'paypal' | 'stripe' | 'check'
  details: {
    accountNumber?: string
    routingNumber?: string
    bankName?: string
    paypalEmail?: string
    stripeAccountId?: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  isVerified: boolean
  isDefault: boolean
}

export interface PayoutRequest {
  userId: string
  amount: number
  method: PayoutMethod
  commissionIds: string[]
  notes?: string
}

export class MLMPayoutProcessor {
  private db = mlmDatabaseService

  // Process payout request
  async processPayoutRequest(request: PayoutRequest): Promise<MLMPayout> {
    try {
      // Validate payout amount
      const totalCommissions = await this.getTotalPendingCommissions(request.userId)
      if (request.amount > totalCommissions) {
        throw new Error('Payout amount exceeds available commissions')
      }

      // Validate payout method
      if (!request.method.isVerified) {
        throw new Error('Payout method must be verified')
      }

      // Create payout record
      const payout = await this.db.createPayout({
        userId: request.userId,
        amount: request.amount,
        currency: 'USD',
        method: request.method.type,
        details: request.method.details,
        status: 'pending',
        periodStart: new Date(),
        periodEnd: new Date(),
        commissionIds: request.commissionIds
      })

      // Process payment based on method
      switch (request.method.type) {
        case 'stripe':
          await this.processStripePayout(payout, request.method)
          break
        case 'paypal':
          await this.processPayPalPayout(payout, request.method)
          break
        case 'bank_account':
          await this.processBankPayout(payout, request.method)
          break
        case 'check':
          await this.processCheckPayout(payout, request.method)
          break
        default:
          throw new Error('Unsupported payout method')
      }

      // Update commission statuses
      await this.updateCommissionStatuses(request.commissionIds, 'paid')

      // Create notification
      await this.db.createNotification({
        userId: request.userId,
        type: 'payout_processed',
        title: 'Payout Processed',
        message: `Your payout of $${request.amount.toFixed(2)} has been processed successfully.`,
        data: {
          payoutId: payout.id,
          amount: request.amount,
          method: request.method.type
        },
        priority: 'normal'
      })

      // Send payout processed email
      try {
        const user = await this.db.getMLMUser(request.userId)
        if (user) {
          await sendPayoutProcessedEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`,
            amount: request.amount,
            method: request.method.type,
            transactionId: payout.id,
            dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/mlm/dashboard`
          })
        }
      } catch (error) {
        console.log('📧 Could not send payout processed email, continuing without email')
      }

      return payout
    } catch (error) {
      console.error('Payout processing error:', error)
      throw error
    }
  }

  // Get total pending commissions for user
  private async getTotalPendingCommissions(userId: string): Promise<number> {
    const commissions = await this.db.getCommissions(userId)
    return commissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.totalAmount, 0)
  }

  // Process Stripe payout
  private async processStripePayout(payout: MLMPayout, method: PayoutMethod): Promise<void> {
    try {
      // In a real implementation, this would integrate with Stripe API
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      
      const transfer = await stripe.transfers.create({
        amount: Math.round(payout.amount * 100), // Convert to cents
        currency: payout.currency.toLowerCase(),
        destination: method.details.stripeAccountId,
        metadata: {
          payout_id: payout.id,
          user_id: payout.userId
        }
      })

      // Update payout with Stripe transfer ID
      await this.updatePayoutStatus(payout.id, 'completed', {
        stripeTransferId: transfer.id,
        processedAt: new Date()
      })

      console.log(`✅ Stripe payout processed: ${transfer.id}`)
    } catch (error) {
      console.error('Stripe payout error:', error)
      await this.updatePayoutStatus(payout.id, 'failed', { error: error.message })
      throw error
    }
  }

  // Process PayPal payout
  private async processPayPalPayout(payout: MLMPayout, method: PayoutMethod): Promise<void> {
    try {
      // In a real implementation, this would integrate with PayPal API
      const paypal = require('@paypal/checkout-server-sdk')
      
      const environment = process.env.NODE_ENV === 'production' 
        ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
        : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
      
      const client = new paypal.core.PayPalHttpClient(environment)

      const request = new paypal.orders.OrdersCreateRequest()
      request.prefer("return=representation")
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: payout.currency,
            value: payout.amount.toFixed(2)
          },
          payee: {
            email_address: method.details.paypalEmail
          }
        }]
      })

      const response = await client.execute(request)
      
      // Update payout with PayPal order ID
      await this.updatePayoutStatus(payout.id, 'completed', {
        paypalOrderId: response.result.id,
        processedAt: new Date()
      })

      console.log(`✅ PayPal payout processed: ${response.result.id}`)
    } catch (error) {
      console.error('PayPal payout error:', error)
      await this.updatePayoutStatus(payout.id, 'failed', { error: error.message })
      throw error
    }
  }

  // Process bank account payout
  private async processBankPayout(payout: MLMPayout, method: PayoutMethod): Promise<void> {
    try {
      // In a real implementation, this would integrate with ACH processing service
      // For now, we'll simulate the process
      
      // Simulate ACH processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update payout status
      await this.updatePayoutStatus(payout.id, 'processing', {
        bankName: method.details.bankName,
        accountNumber: method.details.accountNumber?.slice(-4), // Last 4 digits only
        processedAt: new Date()
      })

      // Simulate completion after processing
      setTimeout(async () => {
        await this.updatePayoutStatus(payout.id, 'completed', {
          processedAt: new Date()
        })
      }, 5000)

      console.log(`✅ Bank payout initiated for account ending in ${method.details.accountNumber?.slice(-4)}`)
    } catch (error) {
      console.error('Bank payout error:', error)
      await this.updatePayoutStatus(payout.id, 'failed', { error: error.message })
      throw error
    }
  }

  // Process check payout
  private async processCheckPayout(payout: MLMPayout, method: PayoutMethod): Promise<void> {
    try {
      // In a real implementation, this would generate a check and mail it
      
      // Update payout status
      await this.updatePayoutStatus(payout.id, 'processing', {
        checkNumber: `CHK${Date.now()}`,
        mailingAddress: method.details.address,
        processedAt: new Date()
      })

      // Simulate check mailing
      setTimeout(async () => {
        await this.updatePayoutStatus(payout.id, 'completed', {
          mailedAt: new Date(),
          trackingNumber: `TRK${Date.now()}`
        })
      }, 10000)

      console.log(`✅ Check payout initiated for ${method.details.address?.city}, ${method.details.address?.state}`)
    } catch (error) {
      console.error('Check payout error:', error)
      await this.updatePayoutStatus(payout.id, 'failed', { error: error.message })
      throw error
    }
  }

  // Update payout status
  private async updatePayoutStatus(payoutId: string, status: string, additionalData: any = {}): Promise<void> {
    try {
      // This would update the payout in the database
      // For now, we'll just log it
      console.log(`📊 Payout ${payoutId} status updated to: ${status}`, additionalData)
    } catch (error) {
      console.error('Error updating payout status:', error)
    }
  }

  // Update commission statuses
  private async updateCommissionStatuses(commissionIds: string[], status: string): Promise<void> {
    try {
      // This would update commission statuses in the database
      console.log(`📊 Updating ${commissionIds.length} commissions to status: ${status}`)
    } catch (error) {
      console.error('Error updating commission statuses:', error)
    }
  }

  // Get payout history for user
  async getPayoutHistory(userId: string, limit: number = 50): Promise<MLMPayout[]> {
    try {
      return await this.db.getPayouts(userId)
    } catch (error) {
      console.error('Error fetching payout history:', error)
      return []
    }
  }

  // Get pending payouts for user
  async getPendingPayouts(userId: string): Promise<MLMPayout[]> {
    try {
      return await this.db.getPayouts(userId, 'pending')
    } catch (error) {
      console.error('Error fetching pending payouts:', error)
      return []
    }
  }

  // Calculate available payout amount
  async calculateAvailablePayout(userId: string): Promise<number> {
    try {
      const commissions = await this.db.getCommissions(userId)
      return commissions
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.totalAmount, 0)
    } catch (error) {
      console.error('Error calculating available payout:', error)
      return 0
    }
  }

  // Validate payout method
  async validatePayoutMethod(method: PayoutMethod): Promise<boolean> {
    try {
      switch (method.type) {
        case 'stripe':
          return !!method.details.stripeAccountId
        case 'paypal':
          return !!method.details.paypalEmail && this.isValidEmail(method.details.paypalEmail)
        case 'bank_account':
          return !!(method.details.accountNumber && method.details.routingNumber && method.details.bankName)
        case 'check':
          return !!(method.details.address?.street && method.details.address?.city && 
                   method.details.address?.state && method.details.address?.zipCode)
        default:
          return false
      }
    } catch (error) {
      console.error('Error validating payout method:', error)
      return false
    }
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Get payout methods for user
  async getPayoutMethods(userId: string): Promise<PayoutMethod[]> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return mock data
      return [
        {
          id: 'method_1',
          type: 'bank_account',
          details: {
            accountNumber: '****1234',
            routingNumber: '123456789',
            bankName: 'Chase Bank'
          },
          isVerified: true,
          isDefault: true
        },
        {
          id: 'method_2',
          type: 'paypal',
          details: {
            paypalEmail: 'user@example.com'
          },
          isVerified: true,
          isDefault: false
        }
      ]
    } catch (error) {
      console.error('Error fetching payout methods:', error)
      return []
    }
  }
}

// Export singleton instance
export const mlmPayoutProcessor = new MLMPayoutProcessor()
