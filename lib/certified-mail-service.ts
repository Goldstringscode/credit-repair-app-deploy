/**
 * Certified Mail Service
 * Phase 1: Core Infrastructure for Certified Mail System
 */

import { uspsApi, type USPSAddress, type USPSAddressValidation } from './usps-api'

export interface CertifiedMailRequest {
  userId: string
  recipient: {
    name: string
    company?: string
    address: USPSAddress
  }
  sender: {
    name: string
    company?: string
    address: USPSAddress
  }
  letter: {
    subject: string
    content: string
    type: string
    templateId?: string
  }
  mailService: string
  additionalServices: string[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
  deliveryInstructions?: string
  returnReceiptRequested: boolean
  signatureConfirmation: boolean
  insurance?: number
}

export interface CertifiedMailResponse {
  trackingId: string
  trackingNumber: string
  uspsTrackingNumber?: string
  status: string
  cost: number
  estimatedDelivery: string
  labelUrl?: string
}

export interface CertifiedMailStatus {
  trackingId: string
  trackingNumber: string
  uspsTrackingNumber?: string
  status: string
  processingStatus: string
  paymentStatus: string
  events: Array<{
    eventType: string
    description: string
    location?: string
    timestamp: string
    source: string
  }>
  sentDate?: string
  deliveredDate?: string
  estimatedDelivery?: string
  actualDelivery?: string
  cost: number
  errorMessage?: string
}

export interface MailTemplate {
  id: string
  name: string
  description: string
  category: string
  content: string
  variables: Record<string, string>
  isActive: boolean
  isPremium: boolean
}

export interface USPSServiceRate {
  serviceCode: string
  serviceName: string
  serviceType: string
  basePrice: number
  additionalServices: Record<string, number>
  deliveryTimeDays: number
  trackingIncluded: boolean
  signatureRequired: boolean
  insuranceIncluded: number
  isActive: boolean
}

class CertifiedMailService {
  private db: any // Will be replaced with actual database connection

  constructor() {
    // Initialize database connection
    this.initializeDatabase()
  }

  private async initializeDatabase() {
    // This will be replaced with actual Supabase/Neon connection
    console.log('Initializing certified mail database connection...')
  }

  /**
   * Create a new certified mail request
   */
  async createMailRequest(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    try {
      // 1. Validate addresses
      const recipientValidation = await uspsApi.validateAddress(request.recipient.address)
      const senderValidation = await uspsApi.validateAddress(request.sender.address)

      if (!recipientValidation.isValid) {
        throw new Error(`Invalid recipient address: ${recipientValidation.errorMessage}`)
      }

      if (!senderValidation.isValid) {
        throw new Error(`Invalid sender address: ${senderValidation.errorMessage}`)
      }

      // 2. Calculate costs
      const cost = await this.calculateMailCost(request)

      // 3. Generate tracking number
      const trackingNumber = this.generateTrackingNumber()
      const trackingId = this.generateTrackingId()

      // 4. Create database record
      const mailRecord = {
        id: trackingId,
        user_id: request.userId,
        tracking_number: trackingNumber,
        recipient_name: request.recipient.name,
        recipient_company: request.recipient.company,
        recipient_address_line1: request.recipient.address.address1,
        recipient_address_line2: request.recipient.address.address2,
        recipient_city: request.recipient.address.city,
        recipient_state: request.recipient.address.state,
        recipient_zip_code: request.recipient.address.zip5,
        sender_name: request.sender.name,
        sender_company: request.sender.company,
        sender_address_line1: request.sender.address.address1,
        sender_address_line2: request.sender.address.address2,
        sender_city: request.sender.address.city,
        sender_state: request.sender.address.state,
        sender_zip_code: request.sender.address.zip5,
        letter_subject: request.letter.subject,
        letter_content: request.letter.content,
        letter_type: request.letter.type,
        letter_template_id: request.letter.templateId,
        mail_service: request.mailService,
        additional_services: JSON.stringify(request.additionalServices),
        priority_level: request.priority,
        delivery_instructions: request.deliveryInstructions,
        return_receipt_requested: request.returnReceiptRequested,
        signature_confirmation: request.signatureConfirmation,
        base_cost: cost.baseCost,
        additional_services_cost: cost.additionalServicesCost,
        total_cost: cost.totalCost,
        status: 'processing',
        processing_status: 'pending',
        payment_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store in database (mock for now)
      await this.storeMailRecord(mailRecord)

      // 5. Create initial event
      await this.createMailEvent(trackingId, 'created', 'Mail request created', 'system')

      return {
        trackingId,
        trackingNumber,
        status: 'processing',
        cost: cost.totalCost,
        estimatedDelivery: this.calculateEstimatedDelivery(request.mailService)
      }
    } catch (error) {
      console.error('Error creating mail request:', error)
      throw new Error(`Failed to create mail request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process payment and send mail
   */
  async processPaymentAndSend(trackingId: string, paymentIntentId: string): Promise<CertifiedMailResponse> {
    try {
      // 1. Update payment status
      await this.updateMailRecord(trackingId, {
        payment_status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
        processing_status: 'validating'
      })

      // 2. Create payment event
      await this.createMailEvent(trackingId, 'payment_completed', 'Payment processed successfully', 'stripe')

      // 3. Validate mail request
      await this.validateMailRequest(trackingId)

      // 4. Create USPS label
      const labelResponse = await this.createUSPSLabel(trackingId)

      // 5. Update with USPS tracking info
      await this.updateMailRecord(trackingId, {
        usps_tracking_id: labelResponse.trackingNumber,
        status: 'sent',
        processing_status: 'completed',
        sent_date: new Date().toISOString()
      })

      // 6. Create sent event
      await this.createMailEvent(trackingId, 'sent', 'Mail sent via USPS', 'usps')

      return {
        trackingId,
        trackingNumber: trackingId,
        uspsTrackingNumber: labelResponse.trackingNumber,
        status: 'sent',
        cost: 0, // Will be fetched from database
        estimatedDelivery: labelResponse.estimatedDelivery,
        labelUrl: labelResponse.labelUrl
      }
    } catch (error) {
      console.error('Error processing payment and sending mail:', error)
      
      // Update status to failed
      await this.updateMailRecord(trackingId, {
        status: 'failed',
        processing_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      await this.createMailEvent(trackingId, 'failed', 'Failed to process payment and send mail', 'system')

      throw new Error(`Failed to process payment and send mail: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get mail status and tracking information
   */
  async getMailStatus(trackingId: string): Promise<CertifiedMailStatus> {
    try {
      // Get mail record from database
      const mailRecord = await this.getMailRecord(trackingId)
      if (!mailRecord) {
        throw new Error('Mail record not found')
      }

      // Get events
      const events = await this.getMailEvents(trackingId)

      // If we have a USPS tracking number, get real-time tracking
      if (mailRecord.usps_tracking_id) {
        try {
          const uspsTracking = await uspsApi.getTrackingInfo(mailRecord.usps_tracking_id)
          
          // Update status based on USPS tracking
          if (uspsTracking.status !== mailRecord.status) {
            await this.updateMailRecord(trackingId, {
              status: this.mapUSPSStatusToInternal(uspsTracking.status)
            })
          }

          // Add USPS events
          uspsTracking.events.forEach(event => {
            events.push({
              eventType: 'usps_update',
              description: event.details,
              location: event.location,
              timestamp: event.timestamp,
              source: 'usps'
            })
          })
        } catch (error) {
          console.warn('Failed to get USPS tracking info:', error)
        }
      }

      return {
        trackingId: mailRecord.id,
        trackingNumber: mailRecord.tracking_number,
        uspsTrackingNumber: mailRecord.usps_tracking_id,
        status: mailRecord.status,
        processingStatus: mailRecord.processing_status,
        paymentStatus: mailRecord.payment_status,
        events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        sentDate: mailRecord.sent_date,
        deliveredDate: mailRecord.delivered_date,
        estimatedDelivery: mailRecord.estimated_delivery,
        actualDelivery: mailRecord.actual_delivery,
        cost: mailRecord.total_cost,
        errorMessage: mailRecord.error_message
      }
    } catch (error) {
      console.error('Error getting mail status:', error)
      throw new Error(`Failed to get mail status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get available mail templates
   */
  async getMailTemplates(category?: string): Promise<MailTemplate[]> {
    try {
      // This would query the database for templates
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'Basic Dispute Letter',
          description: 'Standard credit report dispute letter',
          category: 'dispute',
          content: 'Template content...',
          variables: {
            your_name: 'string',
            your_address: 'string',
            disputed_items: 'string'
          },
          isActive: true,
          isPremium: false
        }
      ]
    } catch (error) {
      console.error('Error getting mail templates:', error)
      return []
    }
  }

  /**
   * Get USPS service rates
   */
  async getServiceRates(): Promise<USPSServiceRate[]> {
    try {
      // This would query the database for service rates
      // For now, return mock data
      return [
        {
          serviceCode: 'certified_mail',
          serviceName: 'Certified Mail',
          serviceType: 'certified',
          basePrice: 3.75,
          additionalServices: {
            'return_receipt': 2.75,
            'signature_confirmation': 3.50
          },
          deliveryTimeDays: 3,
          trackingIncluded: true,
          signatureRequired: false,
          insuranceIncluded: 0,
          isActive: true
        }
      ]
    } catch (error) {
      console.error('Error getting service rates:', error)
      return []
    }
  }

  // Private helper methods

  private async calculateMailCost(request: CertifiedMailRequest): Promise<{
    baseCost: number
    additionalServicesCost: number
    totalCost: number
  }> {
    // Get service rates
    const rates = await this.getServiceRates()
    const serviceRate = rates.find(rate => rate.serviceCode === request.mailService)
    
    if (!serviceRate) {
      throw new Error(`Invalid mail service: ${request.mailService}`)
    }

    let baseCost = serviceRate.basePrice
    let additionalServicesCost = 0

    // Calculate additional services cost
    request.additionalServices.forEach(service => {
      if (serviceRate.additionalServices[service]) {
        additionalServicesCost += serviceRate.additionalServices[service]
      }
    })

    // Add insurance cost if requested
    if (request.insurance && request.insurance > serviceRate.insuranceIncluded) {
      additionalServicesCost += (request.insurance - serviceRate.insuranceIncluded) * 0.5
    }

    return {
      baseCost,
      additionalServicesCost,
      totalCost: baseCost + additionalServicesCost
    }
  }

  private generateTrackingNumber(): string {
    return `CR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  private generateTrackingId(): string {
    return `cm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private calculateEstimatedDelivery(mailService: string): string {
    const deliveryDays: Record<string, number> = {
      'certified_mail': 3,
      'certified_mail_return_receipt': 3,
      'registered_mail': 5,
      'priority_mail_express': 1,
      'priority_mail': 2,
      'first_class_mail': 5
    }

    const days = deliveryDays[mailService] || 3
    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + days)
    
    return deliveryDate.toISOString().split('T')[0]
  }

  private mapUSPSStatusToInternal(uspsStatus: string): string {
    const statusMap: Record<string, string> = {
      'accepted': 'sent',
      'in_transit': 'in_transit',
      'out_for_delivery': 'in_transit',
      'delivered': 'delivered',
      'returned': 'returned',
      'failed': 'failed'
    }

    return statusMap[uspsStatus] || 'in_transit'
  }

  private async validateMailRequest(trackingId: string): Promise<void> {
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await this.updateMailRecord(trackingId, {
      processing_status: 'validated'
    })

    await this.createMailEvent(trackingId, 'validated', 'Mail request validated successfully', 'system')
  }

  private async createUSPSLabel(trackingId: string): Promise<{
    trackingNumber: string
    labelUrl: string
    estimatedDelivery: string
  }> {
    // Get mail record
    const mailRecord = await this.getMailRecord(trackingId)
    if (!mailRecord) {
      throw new Error('Mail record not found')
    }

    // Create USPS label request
    const labelRequest = {
      toAddress: {
        address1: mailRecord.recipient_name,
        address2: mailRecord.recipient_company,
        city: mailRecord.recipient_city,
        state: mailRecord.recipient_state,
        zip5: mailRecord.recipient_zip_code
      },
      fromAddress: {
        address1: mailRecord.sender_name,
        address2: mailRecord.sender_company,
        city: mailRecord.sender_city,
        state: mailRecord.sender_state,
        zip5: mailRecord.sender_zip_code
      },
      serviceType: mailRecord.mail_service,
      weight: 1, // Default weight
      returnReceipt: mailRecord.return_receipt_requested,
      signatureConfirmation: mailRecord.signature_confirmation,
      insurance: mailRecord.insurance || 0
    }

    // Create label via USPS API
    const labelResponse = await uspsApi.createLabel(labelRequest)

    return {
      trackingNumber: labelResponse.trackingNumber,
      labelUrl: labelResponse.labelUrl,
      estimatedDelivery: labelResponse.estimatedDelivery
    }
  }

  // Database methods (mock implementations for now)

  private async storeMailRecord(record: any): Promise<void> {
    // Mock implementation - in production, this would use Supabase/Neon
    console.log('Storing mail record:', record.id)
  }

  private async getMailRecord(trackingId: string): Promise<any> {
    // Mock implementation - in production, this would query the database
    return {
      id: trackingId,
      tracking_number: `CR${Date.now()}`,
      status: 'processing',
      processing_status: 'pending',
      payment_status: 'pending',
      total_cost: 3.75,
      recipient_name: 'Test Recipient',
      recipient_city: 'Test City',
      recipient_state: 'TS',
      recipient_zip_code: '12345',
      sender_name: 'Test Sender',
      sender_city: 'Test City',
      sender_state: 'TS',
      sender_zip_code: '12345',
      mail_service: 'certified_mail',
      return_receipt_requested: false,
      signature_confirmation: false
    }
  }

  private async updateMailRecord(trackingId: string, updates: any): Promise<void> {
    // Mock implementation - in production, this would update the database
    console.log('Updating mail record:', trackingId, updates)
  }

  private async createMailEvent(trackingId: string, eventType: string, description: string, source: string): Promise<void> {
    // Mock implementation - in production, this would store the event
    console.log('Creating mail event:', { trackingId, eventType, description, source })
  }

  private async getMailEvents(trackingId: string): Promise<Array<{
    eventType: string
    description: string
    location?: string
    timestamp: string
    source: string
  }>> {
    // Mock implementation - in production, this would query the database
    return [
      {
        eventType: 'created',
        description: 'Mail request created',
        timestamp: new Date().toISOString(),
        source: 'system'
      }
    ]
  }
}

// Export singleton instance
export const certifiedMailService = new CertifiedMailService()

// Export types
export type {
  CertifiedMailRequest,
  CertifiedMailResponse,
  CertifiedMailStatus,
  MailTemplate,
  USPSServiceRate
}

