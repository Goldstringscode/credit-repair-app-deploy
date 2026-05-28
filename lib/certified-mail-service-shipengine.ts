/**
 * lib/certified-mail-service-shipengine.ts
 * Certified mail business logic — now uses Shippo instead of ShipEngine.
 * File kept with original name to avoid breaking all the route imports.
 */

import { shippoService, type CertifiedMailAddress, type CertifiedMailRequest as ShippoMailRequest } from './shippo-service'
import { stripeMailPayments } from './stripe-mail-payments'
import { letterTextToBase64PDF } from './letter-pdf-generator'
import { createClient } from '@supabase/supabase-js'

const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export type { CertifiedMailAddress }

export interface CertifiedMailRequest {
  userId: string
  recipient: CertifiedMailAddress
  sender: CertifiedMailAddress
  letter: {
    content: string          // Plain text letter content
    disputeType: string      // 'dispute' | 'goodwill' | etc.
    bureauName: string
  }
  serviceTier: 'standard' | 'certified' | 'priority'
}

export interface CertifiedMailResponse {
  success: boolean
  trackingId?: string          // Internal DB record ID
  trackingNumber?: string      // USPS tracking number from Shippo
  trackingUrl?: string
  labelUrl?: string
  estimatedDelivery?: string
  cost?: number
  currency?: string
  paymentIntentId?: string     // Stripe payment intent ID
  paymentClientSecret?: string // Stripe payment intent client secret
  error?: string
}

export interface MailRecord {
  id: string
  user_id: string
  status: 'pending_payment' | 'paid' | 'processing' | 'sent' | 'delivered' | 'failed'
  tracking_number?: string
  tracking_url?: string
  label_url?: string
  shippo_transaction_id?: string
  estimated_delivery?: string
  cost?: number
  letter_content: string
  bureau_name: string
  dispute_type: string
  recipient_name: string
  recipient_address: string
  sender_name: string
  created_at: string
  updated_at: string
}

class CertifiedMailService {

  /**
   * Step 1: Create a mail record and Stripe payment intent.
   * Called when user clicks "Send via Certified Mail".
   */
  async createMailRequest(request: CertifiedMailRequest): Promise<CertifiedMailResponse> {
    try {
      // Validate recipient address via Shippo
      const validation = await shippoService.validateAddress(request.recipient)
      if (!validation.isValid) {
        return { success: false, error: 'Invalid recipient address: ' + validation.errors.join(', ') }
      }

      // Calculate cost based on tier
      const tierCosts: Record<string, number> = {
        standard: 399,    // $3.99
        certified: 799,   // $7.99
        priority: 1299,   // $12.99
      }
      const amountCents = tierCosts[request.serviceTier] || 799

      // Create Stripe payment intent
      const paymentIntent = await stripeMailPayments.instance.createPaymentIntent({
        trackingId: 'pending',               // Will be updated after DB insert
        amount: amountCents / 100,           // createPaymentIntent expects dollars, converts to cents internally
        currency: 'usd',
        description: `Certified Mail - ${request.letter.bureauName} (${request.serviceTier})`,
        metadata: {
          mailType: 'certified_mail',
          serviceType: request.serviceTier,
          trackingNumber: 'pending',
          userId: request.userId,
        },
      })

      // Save mail record to Supabase
      const { data: mailRecord, error: dbError } = await db()
        .from('certified_mail_requests')
        .insert({
          user_id: request.userId,
          status: 'pending_payment',
          letter_content: request.letter.content,
          bureau_name: request.letter.bureauName,
          dispute_type: request.letter.disputeType,
          recipient_name: request.recipient.name,
          recipient_address: JSON.stringify(request.recipient),
          sender_name: request.sender.name,
          sender_address: JSON.stringify(request.sender),
          service_tier: request.serviceTier,
          amount_cents: amountCents,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (dbError) {
        console.error('DB error creating mail record:', JSON.stringify(dbError))
        const errMsg = dbError.message || dbError.details || dbError.hint || JSON.stringify(dbError)
        if (dbError.code === '42P01' || (errMsg && errMsg.includes('does not exist'))) {
          return { success: false, error: 'Database table missing. Run the certified_mail_requests SQL migration in Supabase first.' }
        }
        return { success: false, error: 'Failed to create mail record: ' + errMsg }
      }

      return {
        success: true,
        trackingId: mailRecord.id,
        cost: amountCents / 100,
        currency: 'USD',
        paymentIntentId: paymentIntent.paymentIntentId,
        paymentClientSecret: paymentIntent.clientSecret,
      }
    } catch (err: any) {
      console.error('createMailRequest error:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * Step 2: After payment confirmed — generate PDF and send via Shippo.
   * Called by process-payment route or Stripe webhook.
   */
  async processPaymentAndSend(trackingId: string, paymentIntentId: string): Promise<CertifiedMailResponse> {
    try {
      // Get mail record
      const { data: mailRecord, error: fetchError } = await db()
        .from('certified_mail_requests')
        .select('*')
        .eq('id', trackingId)
        .single()

      if (fetchError || !mailRecord) {
        return { success: false, error: 'Mail record not found' }
      }

      if (mailRecord.status === 'sent') {
        return {
          success: true,
          trackingNumber: mailRecord.tracking_number,
          trackingUrl: mailRecord.tracking_url,
          message: 'Already sent',
        } as any
      }

      // Verify Stripe payment succeeded
      const paymentStatus = await stripeMailPayments.instance.getPaymentStatus(paymentIntentId)
      if (paymentStatus.status !== 'succeeded') {
        return { success: false, error: 'Payment not confirmed: ' + paymentStatus.status }
      }

      // Update status to processing
      await db().from('certified_mail_requests').update({ status: 'processing', updated_at: new Date().toISOString() }).eq('id', trackingId)

      // Generate PDF from letter content
      const recipient = typeof mailRecord.recipient_address === 'string'
        ? JSON.parse(mailRecord.recipient_address)
        : mailRecord.recipient_address

      const sender = typeof mailRecord.sender_address === 'string'
        ? JSON.parse(mailRecord.sender_address)
        : mailRecord.sender_address

      console.log('📄 Generating letter PDF...')
      const pdfBase64 = await letterTextToBase64PDF({
        letterContent: mailRecord.letter_content,
        senderName: mailRecord.sender_name,
        senderAddress: sender?.street1,
        senderCity: sender?.city,
        senderState: sender?.state,
        senderZip: sender?.zip,
      })

      // Send via Shippo
      console.log('📮 Creating Shippo certified mail shipment...')
      const shippoResult = await shippoService.createCertifiedMail({
        sender,
        recipient,
        letterPdfBase64: pdfBase64,
        serviceTier: mailRecord.service_tier || 'certified',
        metadata: {
          trackingId,
          userId: mailRecord.user_id,
          bureauName: mailRecord.bureau_name,
        },
      })

      if (!shippoResult.success) {
        await db().from('certified_mail_requests').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', trackingId)
        return { success: false, error: 'Shippo error: ' + shippoResult.error }
      }

      // Update record with tracking info
      await db().from('certified_mail_requests').update({
        status: 'sent',
        tracking_number: shippoResult.trackingNumber,
        tracking_url: shippoResult.trackingUrl,
        label_url: shippoResult.labelUrl,
        shippo_transaction_id: shippoResult.shippoTransactionId,
        estimated_delivery: shippoResult.estimatedDelivery,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', trackingId)

      console.log('✅ Certified mail sent! Tracking:', shippoResult.trackingNumber)

      return {
        success: true,
        trackingId,
        trackingNumber: shippoResult.trackingNumber,
        trackingUrl: shippoResult.trackingUrl,
        labelUrl: shippoResult.labelUrl,
        estimatedDelivery: shippoResult.estimatedDelivery,
        cost: shippoResult.cost,
        currency: shippoResult.currency,
      }
    } catch (err: any) {
      console.error('processPaymentAndSend error:', err)
      await db().from('certified_mail_requests').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', trackingId).catch(()=>{})
      return { success: false, error: err.message }
    }
  }

  /**
   * Get tracking status for a mail record.
   */
  async getTrackingStatus(trackingId: string): Promise<any> {
    const { data: record } = await db()
      .from('certified_mail_requests')
      .select('*')
      .eq('id', trackingId)
      .single()

    if (!record) return { error: 'Not found' }

    let liveTracking = null
    if (record.tracking_number) {
      liveTracking = await shippoService.getTrackingInfo('usps', record.tracking_number)
    }

    return {
      ...record,
      liveTracking,
    }
  }
}

export const certifiedMailService = new CertifiedMailService()
